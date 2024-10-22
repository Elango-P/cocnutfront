import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { ScrollView, Text, TouchableOpacity, View, Image } from "react-native";
import { Card } from "react-native-paper"; // Assuming you're using react-native-paper or a similar library
import Currency from "../../components/Currency";
import Layout from "../../components/Layout";
import VerticalSpace10 from "../../components/VerticleSpace10";
import styles from "../../helper/Styles";
import YearSelect from "../../components/YearSelect";
import MonthSelect from "../../components/MonthSelect";
import UserCard from "../../components/UserCard";
import TextBox from "../../components/TextBox";
import Tab from "../../components/Tab";
import TabName from "../../helper/Tab";
import { SwipeListView } from "react-native-swipe-list-view";
import NoRecordFound from "../../components/NoRecordFound";
import ShowMore from "../../components/ShowMore";
import AttendanceService from "../../services/AttendanceService";
import DateTime from "../../lib/DateTime";
import { useIsFocused, useNavigation } from "@react-navigation/core";
import UserAvatar from "react-native-user-avatar";
import AlternativeColor from "../../components/AlternativeBackground";
import { Color } from "../../helper/Color";
import Refresh from "../../components/Refresh";
import PermissionService from "../../services/PermissionService";
import Permission from "../../helper/Permission";
import HistoryList from "../../components/HistoryList";
import ObjectName from "../../helper/ObjectName";
import { StyleSheet } from "react-native";
import ArrayList from "../../lib/ArrayList";
import SalaryAttendanceTable from "./SalaryAttendanceTable";

const SalaryDetailPage = (props) => {
  const params = props?.route?.params?.item;
  const preloadedValues = {};

  const [activeTab, setActiveTab] = useState(TabName.SUMMARY);
  const [attendanceList, setAttendanceList] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [page, setPage] = useState(1);
  const [HasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [salaryHistoryView, setSalaryHistoryView] = useState("");

  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const stateRef = useRef();

  const { control } = useForm({
    defaultValues: preloadedValues,
  });

  useEffect(() => {
    getSalaryPermission();
  }, [isFocused]);

  const closeRow = (rowMap, rowKey) => {
    if (rowMap[rowKey]) {
      rowMap[rowKey].closeRow();
    }
  };

  const getSalaryPermission = async () => {
    const salaryHistoryView = await PermissionService.hasPermission(
      Permission.SALARY_HISTORY_VIEW
    );
    setSalaryHistoryView(salaryHistoryView);
  };

  const renderItem = (data) => {
    let item = data?.item;
    let index = data?.index;
    const containerStyle = AlternativeColor.getBackgroundColor(index);

    return (
      <View style={styles.container}>
        <View>
          {item && (
            <TouchableOpacity
              style={[styles.cardAttendance, containerStyle]}
              onPress={() =>
                navigation.navigate("/Attendance/Detail", {
                  attendanceId: item.id,
                  item: item,
                })
              }
            >
              <View style={style.avatarContainer}>
                <View style={style.avatarWrapper}>
                  {item?.check_in_media_id ? (
                    <Image
                      source={{
                        uri: item?.check_in_media_id
                          ? item?.check_in_media_id
                          : item.media_url,
                      }}
                      style={style.avatarImage}
                    />
                  ) : (
                    <UserAvatar
                      size={55}
                      name={item.userName}
                      bgColor={Color.PRIMARY}
                    />
                  )}
                </View>
              </View>
              <View style={style.cardContent}>
                <Text style={style.userName}>
                  {item.userName} {item.lastName}
                </Text>
                {!item?.attendanceTypeDetail?.is_leave && item.locationName && (
                  <Text>
                    {item.locationName}, {item.shiftName}
                  </Text>
                )}
                <Text>Date: {DateTime.formatDate(item?.date)}</Text>
                {item?.type && <Text>Type: {item?.typeName}</Text>}

                <View style={styles.container1}>
                  {!item?.attendanceTypeDetail?.is_leave && (
                    <>
                      <Text style={{ width: "50%" }}>
                        In: {DateTime.LocalTime(item?.login)}
                      </Text>

                      <Text style={{ width: "50%" }}>
                        Out: {DateTime.LocalTime(item?.logout)}
                      </Text>
                    </>
                  )}
                </View>
                <View></View>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderHiddenItem = (data, rowMap) => {
    return (
      <View style={styles.swipeStyle}>
        <TouchableOpacity
          style={styles.actionDeleteButton}
          onPress={() => {
            stateRef.selectedItem = data?.item;
            stateRef.selecredRowMap = rowMap;
            closeRow(rowMap, data?.item.id);
          }}
        >
          <Text style={styles.btnText}>Delete</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const LoadMoreList = async (values) => {
    try {
      setIsFetching(true);

      let param = {
        page: page,
        startDate: params?.salaryDate?.startDate,
        endDate: params?.salaryDate?.endDate,
        ...values,
      };

      AttendanceService.getAttendanceList(null, param, (error, response) => {
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

  let title = [
    {
      title: TabName.SUMMARY,
      tabName: TabName.SUMMARY,
    },
    {
      title: TabName.ATTENDANCE,
      tabName: TabName.ATTENDANCE,
    },
    {
      title: TabName.FINE,
      tabName: TabName.FINE,
    },
    {
      title: TabName.BONUS,
      tabName: TabName.BONUS,
    },
  ];
  if (salaryHistoryView) {
    title.push({
      title: TabName.HISTORY,
      tabName: TabName.HISTORY,
    });
  }
  return (
    <Layout title={`Salary - ${params?.month} ${params?.year}`} showBackIcon>
      <ScrollView>
        <View>
          <Tab
            title={title}
            setActiveTab={setActiveTab}
            defaultTab={activeTab}
          />
        </View>
        <Refresh refreshing={refreshing} setRefreshing={setRefreshing}>
          {activeTab == TabName.SUMMARY && (
            <View style={style.card}>
              {/* Personal Information Card */}
              <Card style={{ marginBottom: 10 }}>
                <Card.Title title="Personal Information" />
                <Card.Content>
                  <UserCard
                    firstName={params?.first_name}
                    lastName={params?.last_name}
                    image={params?.image_url}
                    avatarStyle={{ height: 40, width: 40, borderRadius: 20 }}
                  />
                  <VerticalSpace10 />
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <View style={style.infoHalf}>
                      <MonthSelect
                        title="Month"
                        label="Month"
                        selectedMonth={params?.monthValue}
                        disable
                        control={control}
                      />
                    </View>
                    <View style={style.infoHalf}>
                      <YearSelect
                        title="Year"
                        label="Year"
                        selectedYear={params?.year}
                        style={[styles.input, { flex: 1 }]} // Adjust the flex as needed
                        disable
                        control={control}
                      />
                    </View>
                  </View>
                  <VerticalSpace10 />
                </Card.Content>
              </Card>

              {/* Net Salary Information Card */}
              <Card style={{ marginBottom: 10 }}>
                <Card.Title title="Net Salary Information" />
                <Card.Content>
                  <Currency
                    showPlaceHolder={false}
                    title="Net Salary"
                    name="net_salary"
                    control={control}
                    noEditable
                    values={params ? params?.net_salary?.toString() : ""}
                  />
                </Card.Content>
              </Card>
              {/* Salary Information Card */}
              <Card style={{ marginBottom: 10 }}>
                <Card.Title title="Salary Information" />
                <Card.Content>
                  <View style={style.inOutContainer}>
                    <View style={style.infoHalf}>
                      <Currency
                        showPlaceHolder={false}
                        title="Monthly Salary"
                        name="monthly_salary"
                        control={control}
                        noEditable
                        values={
                          params ? params?.monthly_salary?.toString() : ""
                        }
                      />
                    </View>
                    <VerticalSpace10 paddingTop={5} />
                    <View style={style.infoHalf}>
                      <Currency
                        showPlaceHolder={false}
                        title="Salary Per Day"
                        name="salary_per_day"
                        control={control}
                        noEditable
                        values={
                          params ? params?.salary_per_day?.toString() : ""
                        }
                      />
                    </View>
                  </View>

                  <VerticalSpace10 paddingTop={5} />
                  <View style={style.inOutContainer}>
                    <View style={style.infoHalf}>
                      <Currency
                        showPlaceHolder={false}
                        title="Basic"
                        name="basic"
                        control={control}
                        noEditable
                        values={params ? params?.basic?.toString() : ""}
                      />
                    </View>
                    <View style={style.infoHalf}>
                      <Currency
                        showPlaceHolder={false}
                        title="HRA"
                        name="hra"
                        control={control}
                        noEditable
                        values={params ? params?.hra?.toString() : ""}
                      />
                    </View>
                  </View>
                  <VerticalSpace10 paddingTop={5} />
                  <Currency
                    showPlaceHolder={false}
                    title="Standard Allowance"
                    name="standard_allowance"
                    control={control}
                    noEditable
                    values={
                      params ? params?.standard_allowance?.toString() : ""
                    }
                  />
                  <VerticalSpace10 paddingTop={5} />
                  <Currency
                    showPlaceHolder={false}
                    title="Special Allowance"
                    name="special_allowance"
                    control={control}
                    noEditable
                    values={params ? params?.special_allowance?.toString() : ""}
                  />
                  <VerticalSpace10 paddingTop={5} />
                  <View style={style.inOutContainer}>
                    <View style={style.infoHalf}>
                      <Currency
                        showPlaceHolder={false}
                        title="Other Allowance"
                        name="other_allowance"
                        control={control}
                        noEditable
                        values={
                          params ? params?.other_allowance?.toString() : ""
                        }
                      />
                    </View>
                    <VerticalSpace10 paddingTop={5} />
                  </View>
                </Card.Content>
              </Card>

              {/* Work Days Information Card */}
              <Card style={{ marginBottom: 10 }}>
                <Card.Title title="Work Days Information" />
                <Card.Content>
                  <TextBox
                    showPlaceHolder={false}
                    control={control}
                    name="working_days"
                    title={"Working Days"}
                    values={params ? params?.working_days?.toString() : ""}
                    editable={false}
                  />
                  <VerticalSpace10 paddingTop={5} />

                  {params && params?.enableAddtionalDayCalculation && (
                    <View style={style.inOutContainer}>
                      <View style={style.infoHalf}>
                        <TextBox
                          showPlaceHolder={false}
                          control={control}
                          name="additional_hours"
                          title={"Additional Hours"}
                          values={
                            params ? params?.additional_hours?.toString() : "0"
                          }
                          editable={false}
                        />
                      </View>

                      <View style={style.infoHalf}>
                        <Currency
                          showPlaceHolder={false}
                          title="Additional Salary"
                          name="additionalHourAmount"
                          control={control}
                          noEditable
                          values={
                            params
                              ? params?.additionalHourAmount?.toString()
                              : "858"
                          }
                        />
                      </View>
                    </View>
                  )}
                  <VerticalSpace10 paddingTop={10} />

                  {ArrayList.isArray(params?.attendanceCount) && (
                    <SalaryAttendanceTable data={params?.attendanceCount} />
                  )}
                  <VerticalSpace10 paddingTop={5} />
                </Card.Content>
              </Card>
              {/* Net Salary Information Card */}
              <Card style={{ marginBottom: 10 }}>
                <Card.Title title="Fine/Bonus" />
                <Card.Content>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <View style={style.infoHalf}>
                      <Currency
                        showPlaceHolder={false}
                        title="Bonus"
                        name="bonus"
                        control={control}
                        noEditable
                        values={params ? params?.bonus?.toString() : ""}
                      />
                    </View>

                    <View style={style.infoHalf}>
                      <Currency
                        showPlaceHolder={false}
                        title="Fine"
                        name="fine"
                        control={control}
                        noEditable
                        values={params ? params?.fine?.toString() : ""}
                      />
                    </View>
                  </View>
                </Card.Content>
              </Card>

              {/* Deductions Information Card */}
              <Card style={{ marginBottom: 10 }}>
                <Card.Title title="Deductions Information" />
                <Card.Content>
                  <View style={style.inOutContainer}>
                    <View style={style.infoHalf}>
                      <Currency
                        showPlaceHolder={false}
                        title="TDS"
                        name="tds"
                        control={control}
                        noEditable
                        values={params ? params?.tds?.toString() : ""}
                      />
                    </View>

                    <View style={style.infoHalf}>
                      <Currency
                        showPlaceHolder={false}
                        title="Medical Insurance"
                        name="medical_insurance"
                        control={control}
                        noEditable
                        values={
                          params ? params?.medical_insurance?.toString() : ""
                        }
                      />
                    </View>
                  </View>
                  <VerticalSpace10 paddingTop={5} />

                  <View style={style.inOutContainer}>
                    <View style={style.infoHalf}>
                      <Currency
                        showPlaceHolder={false}
                        title="Gratuity"
                        name="gratuity"
                        control={control}
                        noEditable
                        values={params ? params?.gratuity?.toString() : ""}
                      />
                    </View>
                    <View style={style.infoHalf}>
                      <Currency
                        showPlaceHolder={false}
                        title="PF"
                        name="provident_fund"
                        control={control}
                        noEditable
                        values={
                          params ? params?.provident_fund?.toString() : ""
                        }
                      />
                    </View>
                  </View>
                  <VerticalSpace10 paddingTop={5} />

                  <View style={style.inOutContainer}>
                    <View style={style.infoHalf}>
                      <Currency
                        showPlaceHolder={false}
                        title="PT"
                        name="professional_tax"
                        control={control}
                        noEditable
                        values={
                          params ? params?.professional_tax?.toString() : ""
                        }
                      />
                    </View>
                    <View style={style.infoHalf}>
                      <Currency
                        showPlaceHolder={false}
                        title="Other Deductions"
                        name="other_deductions"
                        control={control}
                        noEditable
                        values={
                          params ? params?.other_deductions?.toString() : ""
                        }
                      />
                    </View>
                  </View>
                  <VerticalSpace10 paddingTop={5} />
                </Card.Content>
              </Card>
            </View>
          )}
          {activeTab == TabName.ATTENDANCE && (
            <View>
              {attendanceList && attendanceList.length > 0 ? (
                <>
                  <SwipeListView
                    data={attendanceList}
                    renderItem={renderItem}
                    renderHiddenItem={renderHiddenItem}
                    rightOpenValue={-70}
                    previewOpenValue={-40}
                    previewOpenDelay={3000}
                    disableRightSwipe={true}
                    closeOnRowOpen={true}
                    keyExtractor={(item) => String(item.id)}
                  />
                </>
              ) : (
                <NoRecordFound iconName="receipt" />
              )}

              <ShowMore
                List={attendanceList}
                isFetching={isFetching}
                HasMore={HasMore}
                onPress={() => LoadMoreList({ user: params?.user_id })}
              />
            </View>
          )}
        </Refresh>
      </ScrollView>
      {activeTab === TabName.HISTORY && (
        <ScrollView>
          <HistoryList objectName={ObjectName.SALARY} objectId={params?.id} />
        </ScrollView>
      )}
    </Layout>
  );
};
const style = StyleSheet.create({
  avatarContainer: {
    flex: 0,
  },
  avatarWrapper: {
    paddingHorizontal: 11,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: "10%",
  },
  avatarImage: {
    width: 55,
    height: 55,
    borderRadius: 30,
  },
  cardContent: {
    justifyContent: "space-between",
    paddingVertical: 5,
    flex: 1,
  },
  userName: {
    fontWeight: "700",
    textTransform: "capitalize",
  },
  inOutContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoHalf: {
    width: "48%",
  },

  card: {
    marginTop: 10,
    padding: 10,
  },

  noRecord: {
    paddingVertical: 250,
    alignItems: "center",
  },
});

export default SalaryDetailPage;
