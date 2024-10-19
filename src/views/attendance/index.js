// Import React and Component
import { useIsFocused, useNavigation } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import {
  Image,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { MenuItem } from "react-native-material-menu";
import { SwipeListView } from "react-native-swipe-list-view";
import UserAvatar from "react-native-user-avatar";
import AlternativeColor from "../../components/AlternativeBackground";
import FilterDrawer from "../../components/Filter";
import Layout from "../../components/Layout";
import DeleteModal from "../../components/Modal/DeleteConfirmationModal";
import NoRecordFound from "../../components/NoRecordFound";
import Refresh from "../../components/Refresh";
import ShowMore from "../../components/ShowMore";
import { Color } from "../../helper/Color";
import Permission from "../../helper/Permission";
import styles from "../../helper/Styles";
import AppID from "../../lib/AppID";
import DateTime from "../../lib/DateTime";
import Device from "../../lib/Device";
import AsyncStorageService from "../../services/AsyncStorageService";
import { default as AttendanceService, default as attendanceService } from "../../services/AttendanceService";
import AttendanceTypeServie from "../../services/AttendanceTypeService";
import PermissionService from "../../services/PermissionService";
import shiftService from "../../services/ShiftService";
import storeService from "../../services/StoreService";
import SyncService from "../../services/SyncService";
import userService from "../../services/UserService";
import { useForm } from "react-hook-form";
import Tab from "../../components/Tab";
import TabName from "../../helper/Tab";
import AttendanceMonthWiseList from "./components/AttendanceMonthWiseList";

const AttendanceList = (props) => {
  const param = props?.route?.params;

  const [attendanceList, setAttendanceList] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [page, setPage] = useState(1);
  const [HasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [attendanceDeleteModal, setattendanceDeleteModal] = useState(false);
  const [attendanceManageOthersPermission, setAttendanceManageOthersPermission] = useState();
  const [selectedItem, setSelectedItem] = useState("");
  const [attendanceDeletePermission, setAttendanceDeletePermission] = useState('')
  const [applyLeaveModal, setApplyLeaveModal] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [visible, setIsVisible] = useState(false);
  const [attendanceCheckinCheckPermission, setAttendanceCheckinCheckPermission] = useState("")
  const [dateSelected, setDateSelected] = useState("");
  const [selectedEndDate, setSelectedEndDate] = useState("");
  const [values, setValues] = useState({
    startDate: "",
    endDate:"",
  });
  const [openFilter, setOpenFilter] = useState(false);
  const [userList, setUserList] = useState();
  const [locationList, setLocationList] = useState();
  const [shiftList, setShiftList] = useState();
  const [locationId, setLocationId] = useState([]);
  const [attendanceTypeList,setAttendanceTypeList] =  useState([]);
  const [devicePendingStatus, setDevicePendingStatus]=useState(false);
  const [isListFeatching, setIsListFeatching]=useState(false);
  const [activeTab, setActiveTab] = useState(TabName.ALL);





  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const stateRef = useRef();

  useEffect(() => {
    let mount = true;
    mount && getAttendanceList(values);
    mount && getAsyncStorageItem();
    mount && getDeletePermission();
    mount && getPermission();
    //cleanup function
    return () => {
      mount = false;
    };
  }, [isFocused]);
  useEffect(()=>{
    if(refreshing){
      getAttendanceList(values);
    }
  },[refreshing])
  useEffect(() => {
    getUserList();
    getStoreList();
    getShiftList();
    getAttendanceType();
  }, []);

  useEffect(() => {

    const loginSync = async () => {
      if (param?.login) {
        await SyncService.Sync(() => { });

      }
    };
    loginSync()

  }, [param?.login])

  const {
    control,
    formState: { errors },
  } = useForm();


  const onDateSelect = (value) => {
    setSelectedDate(new Date(value))
  }
  const getAsyncStorageItem = async () => {
    let storeId = await AsyncStorageService.getSelectedLocationId()
    setLocationId(storeId)
  }


  const getUserList = ()=>{
    userService.list(null, (callback) => { setUserList(callback) });

  }
  const getStoreList = ()=>{
    storeService.list({},(error, response) => {
      const storeListOption = new Array();
      let storeList = response?.data?.data;
      if (storeList && storeList.length > 0) {
        for (let i = 0; i < storeList.length; i++) {
          storeListOption.push({
            label: storeList[i].name,
            value: storeList[i].id,
          });
        }

        setLocationList(storeListOption);
      }

    });
  }
  const getShiftList = () =>{
    let shiftListOption = new Array();

    shiftService.getShiftList({ showAllowedShift: true }, (error, response) => {
      let shiftList = response?.data?.data;
      if (shiftList && shiftList.length > 0) {
        for (let i = 0; i < shiftList.length; i++) {
          shiftListOption.push({
            label: shiftList[i].name,
            value: shiftList[i].id,
          });
        }
        setShiftList(shiftListOption);
      }
    })
  }

  const getAttendanceType =async ()=>{
    await AttendanceTypeServie.list({},(response) => {
      const optionList = new Array();
      let list = response;
      if (list && list.length > 0) {
        for (let i = 0; i < list.length; i++) {
          optionList.push({
            label: list[i].name,
            value: list[i].id,
            id: list[i].id,
          });
        }

        setAttendanceTypeList(optionList);
      }

    })
  }


  const getAttendanceList = (values) => {
    attendanceList && attendanceList.length == 0 && setIsLoading(true);
    let params = { page: 1, sort: "created_at", sortDir: "DESC" };


    if (values?.user) {
      params.user = values?.user;
    }
    if(param?.monthYear){
      params.monthYear = param?.monthYear
    }
    if(param?.user){
      params.user = param?.user;
    }
    if (values?.location) {
      params.location = values?.location;
    }
    if (values?.shift) {
      params.shift = values?.shift;
    }
    if (values?.type) {
      params.type = values?.type;
    }
    if(values?.selectedDate){
      params.selectedDate = values.selectedDate

    }
    if (values?.startDate) {
      params.startDate = DateTime.formatDate(values?.startDate);
    }
    if (values?.endDate) {
      params.endDate = DateTime.formatDate(values?.endDate);
    }
    AttendanceService.getAttendanceList(navigation, params, (err, attendanceList) => {
      setAttendanceList(attendanceList);
      setPage(2)
      setIsLoading(false);
      if (err) {
        console.error(err);
        setIsLoading(false);

      }
    });
  };

  const attendanceDeleteToggle = () => {
    setattendanceDeleteModal(!attendanceDeleteModal);
    clearRowDetail();
  }

  const applyleaveToggle = () => {
    setApplyLeaveModal(!applyLeaveModal);
    setIsVisible(false)
    setSelectedDate(new Date())
  }
  const closeRow = (rowMap, rowKey) => {
    if (rowMap[rowKey]) {
      rowMap[rowKey].closeRow();
    }
  }


  const clearRowDetail = () => {
    if (stateRef) {
      const selectedItem = stateRef.selectedItem;
      const selectedRowMap = stateRef.selecredRowMap;
      if (selectedItem && selectedRowMap) {
        closeRow(selectedRowMap, selectedItem.inventoryTransferProductId)
        setSelectedItem("");
        stateRef.selectedItem = "";
        stateRef.selecredRowMap = "";
      }
    }
  }

  const renderHiddenItem = (data, rowMap) => {

    return (
      <View style={styles.swipeStyle}>
        <TouchableOpacity
          style={styles.actionDeleteButton}
          onPress={() => {
            attendanceDeleteToggle()
            setSelectedItem(data?.item);
            stateRef.selectedItem = data?.item;
            stateRef.selecredRowMap = rowMap;
            closeRow(rowMap, data?.item.id);
          }}
        >
          <Text style={styles.btnText}>Delete</Text>
        </TouchableOpacity>
      </View>
    )
  };


  const LoadMoreList = async () => {
    try {
      setIsFetching(true);

      let params = { page: page ,sort: "created_at", sortDir: "DESC"}

      if (values?.user) {
        params.user = values?.user;
      }
      if (values?.location) {
        params.location = values?.location;
      }
      if(param?.monthYear){
        params.monthYear = param?.monthYear
      }
      if (values?.shift) {
        params.shift = values?.shift;
      }
      if (values?.type) {
        params.type = values?.type;
      }
      if(values?.selectedDate){
        params.selectedDate = values.selectedDate

      }
      if (values?.startDate) {
        params.startDate = DateTime.formatDate(values?.startDate);
      }
      if (values?.endDate) {
        params.endDate = DateTime.formatDate(values?.endDate);
      }

      AttendanceService.getAttendanceList(null, params, (error, response) => {

        let attendanceList = response;

        // Set response in state
        setAttendanceList((prevTitles) => {
          return [...new Set([...prevTitles, ...attendanceList])];
        });
        setPage((prevPageNumber) => prevPageNumber + 1);
        setHasMore(attendanceList.length > 0);
        setIsFetching(false);
      });
    } catch (err) {
      console.log(err);
      setIsLoading(false);
    }
  };


  const getPermission = async () => {
    const isExist = await PermissionService.hasPermission(Permission.ATTENDANCE_MANAGE_OTHERS);
    await Device.isStatusBlocked((devicePendingStatus)=>{
      setDevicePendingStatus(devicePendingStatus)
    });
    setAttendanceManageOthersPermission(isExist)
  }

  const getDeletePermission = async () => {
    const isExist = await PermissionService.hasPermission(Permission.ATTENDANCE_DELETE);
    setAttendanceDeletePermission(isExist)
    const attendanceCheckinCheckPermission = await PermissionService.hasPermission(Permission.USER_MOBILE_CHECKIN);
    setAttendanceCheckinCheckPermission(attendanceCheckinCheckPermission)

  }

  const attendanceDelete = async () => {
    if (selectedItem) {
      attendanceService.Delete(selectedItem.id, (error, response) => {
        getAttendanceList(values);
      })
    }
  };


  const today = DateTime.toISOStringDate(new Date());

  let appId = AppID.getAppId();
  let title = [
    {
      title: TabName.SUMMARY,
      tabName: TabName.SUMMARY,
    },
    {
      title: TabName.ALL,
      tabName: TabName.ALL,
    }
  ]


  const renderItem = data => {
    let item = data?.item;
    let index = data?.index;
    const containerStyle = AlternativeColor.getBackgroundColor(index)

    return (
      <View style={styles.container}>
        <View>
          {item && (
            <TouchableOpacity
              style={[styles.cardAttendance, containerStyle]}
              disabled={!attendanceManageOthersPermission}
              onPress={() =>
                navigation.navigate("/Attendance/Detail", {
                  attendanceId: item.id,
                  item :item
                })
              }
            >
              <View>
                <View
                  style={styles.listContainers}
                >
                  {item?.check_in_media_id ? (
                    <Image source={{ uri: item?.check_in_media_id ? item?.check_in_media_id : item.media_url }} style={{ width: 55, height: 55, borderRadius: 30 }} />
                  ) : (
                    <UserAvatar
                      size={55}
                      name={item.userName}
                      bgColor={Color.PRIMARY}
                    />
                  )}

                </View>
              </View>
              <View
                style={{
                  justifyContent: "space-between",
                  paddingVertical: 5,
                  flex: 1,
                }}
              >
                {attendanceManageOthersPermission && (
                  <Text
                    style={{ fontWeight: "700", textTransform: "capitalize" }}
                  >
                    {item.userName} {item.lastName}
                  </Text>
                )}
                <View style={styles.container1}>
                  <Text>{DateTime.formatDate(item?.date)}</Text>
                  <View style={{ ...styles.container1, marginLeft: 5 }}>
                    {!item?.attendanceTypeDetail?.is_leave && (
                      <>
                        {item?.login && <Text style={styles.item}>In: {DateTime.LocalTime(item?.login)}
                        </Text>
                        }
                        {item?.logout && <Text style={styles.item}>Out: {DateTime.LocalTime(item?.logout)}
                        </Text>
                        }
                      </>
                    )}
                  </View>
                </View>

                {!item?.attendanceTypeDetail?.is_leave ? (
                  <Text>
                    {item.locationName ? item.locationName : ""}{item.locationName && item.shiftName ? ", " : ""}
                    {item.shiftName ? item.shiftName : ""}
                  </Text>
                ) : item?.attendanceTypeDetail?.is_leave && (
                  <Text>
                    {item.shiftName ? item.shiftName : ""}
                  </Text>
                )}
                {item?.type && (
                  <Text>{item?.typeName}</Text>
                )}
              </View>
            </TouchableOpacity>

          )}
        </View>
      </View>
    );
  };
  const closeDrawer = () => {
    setOpenFilter(!openFilter);
  };

  const handleSubmit = async () => {
    setIsListFeatching(true)
    getAttendanceList(values);
    closeDrawer();
  };
  const typeOnSelect = (value) => {
    if (value) {
      setValues((prevValues) => ({
        ...prevValues,
        type: value?.id,
      }));
    } else {
      setValues((prevValues) => ({
        ...prevValues,
        type: "",
      }));
    }
  };
  const userOnSelect = (value) => {
    if (value) {
      setValues((prevValues) => ({
        ...prevValues,
        user: value.value,
      }));
    } else {
      setValues((prevValues) => ({
        ...prevValues,
        user: "",
      }));
    }
  };
  const locationOnSelect = (value) => {
    if (value) {
      setValues((prevValues) => ({
        ...prevValues,
        location: value,
      }));
    } else {
      setValues((prevValues) => ({
        ...prevValues,
        location: "",
      }));
    }
  };
  const shiftOnSelect = (value) => {
    if (value) {
      setValues((prevValues) => ({
        ...prevValues,
        shift: value,
      }));
    } else {
      setValues((prevValues) => ({
        ...prevValues,
        shift: "",
      }));
    }
  };



  const onSelectDate = (value) => {
    if (value) {
      setValues((prevValues) => ({
        ...prevValues,
        startDate: new Date(value),
      }));
      setDateSelected(new Date(value));
    } else {
      setValues((prevValues) => ({
        ...prevValues,
        startDate: "",
      }));
      setDateSelected("");
    }
  };
  const onEndDateSelect = (value) => {
    if (value) {
      setValues((prevValues) => ({
        ...prevValues,
        endDate: new Date(value),
      }));
      setSelectedEndDate(new Date(value));
    } else {
      setValues((prevValues) => ({
        ...prevValues,
        endDate: "",
      }));
      setSelectedEndDate("");
    }
  };


  const AddAttendance =()=>{
    navigation.navigate("/Attendance/Detail")
  }
  const actionItems = [
    <>
    {attendanceManageOthersPermission && (
         <MenuItem
        onPress={() => {  setOpenFilter(!openFilter)
       ,setIsVisible(true)}}
        >
        Filter
      </MenuItem>
    )}
    
      {activeTab == TabName.ALL && attendanceManageOthersPermission && (
     !devicePendingStatus && <MenuItem onPress={() => { setIsVisible(true), AddAttendance() }}>
      Add
     </MenuItem>
      )}
    
     
    </>
  ];
  const applyLeave = async () => {
    navigation.navigate("/Attendance/applyLeave", {
      date: selectedDate,
    });
    };
  
  return (
    <Layout
      title={"Attendance"}
      isLoading={isLoading}
      refreshing={refreshing}
      onFilterPress={closeDrawer}
      actionItems={actionItems}
      buttonOnPress={()=> {applyLeave(true) } }
      buttonLabel={activeTab == TabName.ALL && "Apply Leave"}
      showActionMenu={attendanceCheckinCheckPermission}
      closeModal={visible}
      showActionButton={attendanceCheckinCheckPermission}
      params = {{navigator: navigation}}
   
    >
      {activeTab == TabName.SUMMARY ? 
      
      <FilterDrawer
        values={values}
        isOpen={openFilter}
        closeDrawer={closeDrawer}
        userOnSelect={userOnSelect}
        handleSubmit={handleSubmit}
        userList={userList}
        showUser
        clearFilter={() => {
          setValues("");
          closeDrawer();
        }}
      /> :
      <FilterDrawer
        values={values}
        isOpen={openFilter}
        closeDrawer={closeDrawer}
        shiftOnSelect={shiftOnSelect}
        locationOnSelect={locationOnSelect}
        typeOnSelect={typeOnSelect}
        userOnSelect={userOnSelect}
        onDateSelect={onSelectDate}
        onEndDateSelect={onEndDateSelect}
        selectedEndDate={selectedEndDate}
        selectedDate={dateSelected}
        handleSubmit={handleSubmit}
        locationList={locationList}
        userList={userList}
        shiftList={shiftList}
        typeList={attendanceTypeList}
        showUser = {attendanceManageOthersPermission ? true : false}
        showType
        showLocation
        showShift
        showDate
        clearFilter={() => {
          setValues("");
          getAttendanceList();
          closeDrawer();
        }}
      />
    }

       <View style={styles.tabBar}>
          <>
            <Tab
              title={title}
              setActiveTab={setActiveTab}
              defaultTab={activeTab}
            />
          </>
        </View>
        <Refresh refreshing={refreshing} setRefreshing={setRefreshing}>

        {activeTab == TabName.SUMMARY  && (
           <AttendanceMonthWiseList isListFeatching = {isListFeatching} values = {values}/>
       )} 

        <DeleteModal
          modalVisible={attendanceDeleteModal}
          toggle={attendanceDeleteToggle}
          updateAction={attendanceDelete}
          date={selectedItem?.date}
          userName={selectedItem?.userName}
        />
        {activeTab == TabName.ALL && (

        <View>
        {attendanceList &&
          attendanceList.length > 0 ?
          <>
            <SwipeListView
              data={attendanceList}
              renderItem={renderItem}
              renderHiddenItem={renderHiddenItem}
              rightOpenValue={-70}
              previewOpenValue={-40}
              previewOpenDelay={3000}
              disableRightSwipe={true}
              disableLeftSwipe={attendanceDeletePermission ? false : true}
              closeOnRowOpen={true}
              keyExtractor={item => String(item.id)}
            />
          </>
          : (
            <NoRecordFound iconName="receipt" />
          )}

        <ShowMore List={attendanceList} isFetching={isFetching} HasMore={HasMore} onPress={LoadMoreList} />
        </View>
                )}

      
      </Refresh>
      
    </Layout>
  );
};
export default AttendanceList;

