import React, { useEffect, useState } from "react";
import { ScrollView, Text, View, StyleSheet, TouchableOpacity } from "react-native";
import Layout from "../../components/Layout";
import { useNavigation } from "@react-navigation/native";
import AttendanceReportLocationWiseService from "../../services/attendanceReportLocationWiseService";
import UserCard from "../../components/UserCard";
import VerticalSpace10 from "../../components/VerticleSpace10";
import DateTime from "../../lib/DateTime";
import style from "../../helper/Styles";
import Refresh from "../../components/Refresh";
import settingService from "../../services/SettingService";
import Setting from "../../lib/Setting";
import FilterDrawer from "../../components/Filter";
import typeOptions, { Attendance } from "../../helper/Attendance";
import AttendanceTypeServie from "../../services/AttendanceTypeService";
import Status from "../../helper/Status";



const AttendanceReport = () => {
  const navigation = useNavigation();
  const [attendanceReport, setAttendanceReport] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [login, setLogin] = useState("")
  const [dateSelected, setSelectedDate] = useState(new Date());
  const [values, setValues] = useState({ date: new Date() })
  const [openFilter, setOpenFilter] = useState(false);
  const [locationData, setLocationData] = useState([]);
  const [attendanceTypeList,setAttendanceTypeList] =  useState([]);





  useEffect(() => {
    setIsLoading(true);
    AttendanceReportLocation(values);
    getLoginTime()
  }, [])
  useEffect(() => {
    getAttendanceType()
  }, []);
  useEffect(() => {
    if (refreshing) {
      AttendanceReportLocation(values);
    }
  }, [refreshing]);


  const AttendanceReportLocation = async (values) => {
    locationData && locationData.length == 0 && attendanceReport && attendanceReport.length == 0 && setIsLoading(true);
    let params = {}
    if (values?.type) {
      params.type = values?.type;
    }
    if (values?.date) {
      params.date = DateTime.toISOStringDate(values?.date);
    }

    await AttendanceReportLocationWiseService.search(params, (error, res) => {
      setAttendanceReport(res && res.data && res.data.data.attendance)
      setLocationData(res && res.data && res.data.data.location)
      setIsLoading(false);
      setRefreshing(false);
    })
  }

  const getLoginTime = async () => {
    await settingService.get(Setting.USER_LOGIN_TIME, async (err, response) => {
      if (response && response.settings && response.settings[0].value) {
        setLogin(response.settings[0].value)

      }

    })
  }

  const closeDrawer = () => {
    setOpenFilter(!openFilter);
  };
  const handleSubmit = async () => {
    AttendanceReportLocation(values);
    closeDrawer();
  };
  const typeOnSelect = (value) => {
    if (value) {
      setValues((prevValues) => ({
        ...prevValues,
        type: value?.label,
        typeId : value?.value,
      }));
    } else {
      setValues((prevValues) => ({
        ...prevValues,
        type: "",
        typeId : "",

      }));
    }
  };
  const onDateSelect = (value) => {
    if (value) {
      setValues((prevValues) => ({
        ...prevValues,
        date: new Date(value)
      }));
      setSelectedDate(new Date(value));
    } else {
      setValues((prevValues) => ({
        ...prevValues,
        date: ""
      }));
      setSelectedDate("");
    }
  }
  const getAttendanceType =async ()=>{
    await AttendanceTypeServie.list({},(response) => {
      const optionList = new Array();
      let list = response;
      if (list && list.length > 0) {
        for (let i = 0; i < list.length; i++) {
          optionList.push({
            label: list[i].name,
            value: list[i].name,
            id: list[i].id,
          });
        }

        setAttendanceTypeList(optionList);
      }

     })
  }

  return (
    <>
      <Layout
        title={"Attendance Report"}
        showBackIcon
        isLoading={isLoading}
        refreshing={refreshing}
        showFilter
        onFilterPress={closeDrawer}

      >
        <FilterDrawer
          values={values}
          isOpen={openFilter}
          closeDrawer={closeDrawer}
          typeOnSelect={typeOnSelect}
          onDateSelect={onDateSelect}
          selectedDate={dateSelected}
          handleSubmit={handleSubmit}
          showOnDate
          typeList={attendanceTypeList}
          showType
          clearFilter={() => {
            setValues("");
            AttendanceReportLocation();
            closeDrawer();
          }}
        />
        <Refresh refreshing={refreshing} setRefreshing={setRefreshing}>

          <View>
            <VerticalSpace10 />
            <ScrollView>
              <View>
                {locationData && locationData.length > 0 && locationData.map((item, index) => {
                  return (
                    <>
                      <View>
                        <TouchableOpacity
                          style={[
                            style.headerContainer,
                          ]}
                        >
                          <VerticalSpace10 />
                          <View style={style.headerRow}>
                            <Text
                              style={[
                                style.headerText,
                                attendanceReport && attendanceReport.length > 0 && attendanceReport.some((data)=> data?.location_id == item?.locationId) ? style.textColor : style.colorText,
                              ]}
                            >
                              {item.locationName}
                            </Text>
                          </View>
                          <VerticalSpace10 />
                        </TouchableOpacity>
                        {attendanceReport && attendanceReport.length > 0 && attendanceReport.map((data) =>{
                                     const isMatched = data?.location_id == item?.locationId;
                          return isMatched ? (           
                          <><View key={index} style={{ flexDirection: 'row', flexWrap: 'wrap' }}>

                              <UserCard
                                firstName={data.name}
                                lastName={data.last_name}
                                image={data.media_url ? data.media_url : data.image} />
                            
                            {data.loginTime && (
                              <Text>
                                &nbsp;: {DateTime.LocalTime(data.loginTime)}
                              </Text>
                            )}
                            {data.logoutTime && (
                              <Text>
                                &nbsp;- {DateTime.LocalTime(data.logoutTime)}
                              </Text>
                            )}
                           
                            {!data.logoutTime  && data.shiftName && (
                              <Text>
                                &nbsp;({data.shiftName})
                              </Text>
                            )}



                            
                          </View>
                          <View style={style.alignType}>
                          {data.logoutTime  && data.shiftName && (
                              <Text>
                                &nbsp;({data.shiftName}) {data?.attendanceTypeDetail?.is_additional_day ? `-` : ""} 
                              </Text>
                            )}
                          
                            {data?.attendanceTypeDetail?.is_additional_day &&
                             <Text style={style.colorText}>{` ${data.type}`}</Text>}
                             </View>
                            <VerticalSpace10 /></>
                        ) : ("")
                })}


                      </View>
                    </>
                  )

                }
                )}
              </View>
            </ScrollView>


            <VerticalSpace10 />

          </View>
        </Refresh>

      </Layout>

    </>
  )
}
export default AttendanceReport;
