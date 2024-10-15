// Import React and Component
import React, { useState, useEffect } from "react";
import { View, ScrollView } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import { MenuItem } from "react-native-material-menu";
import { useForm } from "react-hook-form";

// Components
import Layout from "../../components/Layout";
import AttendanceFormComponent from "./components/AttendanceForm";
import Tab from "../../components/Tab";
import MediaList from "../../components/MediaList";
import HistoryList from "../../components/HistoryList";

// Services
import StoreService from "../../services/StoreService";
import UserService from "../../services/UserService";
import ShiftService from "../../services/ShiftService";
import AttendanceService from "../../services/AttendanceService";
import PermissionService from "../../services/PermissionService";
import mediaService from "../../services/MediaService";

// Helpers
import Permission from "../../helper/Permission";
import AsyncStorageConstants from "../../helper/AsyncStorage";
import ObjectName from "../../helper/ObjectName";
import TabName from "../../helper/Tab";

// Lib
import AsyncStorage from "../../lib/AsyncStorage";
import dateTime from "../../lib/DateTime";
import ArrayList from "../../lib/ArrayList";

const AttendanceForm = (props) => {
  let params = props?.route?.params;

  let param = props?.route?.params?.item;

  const [locationList, setLocationList] = useState([]);

  const [userList, setUserList] = useState([]);

  const [shiftList, setShiftList] = useState([]);

  const [selectedUser, setSelectedUser] = useState(param?.userId || "");

  const [selectedStore, setSelectedStore] = useState(param?.location || "");

  const [selectedShift, setSelectedShift] = useState(param?.shift_id || "");

  const [selectedType, setSelectedType] = useState(param?.type || null);

  const [notes, setNotes] = useState(param?.notes || "");

  const [manageOther, setManageOther] = useState(false);

  const [isStoreLading, setStoreLoading] = useState("");

  const [isShiftLoading, setShiftLoading] = useState(false);

  const [selelctedDate, setSelectedDate] = useState(new Date());

  const [selectedInTime, setSelectedInTime] = useState();

  const [selectedOutTime, setSelectedOutTime] = useState("");

  const [attendanceDetail, setAttendanceDetail] = useState("");

  const [allowEdit, setEdit] = useState(!params ? true : false);

  const [actionList, setActionList] = useState([]);

  const [activeTab, setActiveTab] = useState(TabName.SUMMARY);
  const [historyPermission, setHistoryPermission] = useState("");

  const [MediaData, setMediaData] = useState([]);
  const [visible, setIsVisible] = useState(false);

  const [allowEarlyCheckout, setAllowEarlyCheckout] = useState(
    param?.allow_early_checkout ? param?.allow_early_checkout : false
  );

  const [allowGoalMissing, setAllowGoalMissing] = useState(
    param?.allow_goal_missing ? param?.allow_goal_missing : false
  );

  const [allowLateCheckin, setAllowLateCheckin] = useState(
    param?.approve_late_check_in ? param?.approve_late_check_in : false
  );
  const [isSubmit,setIsSubmit] = useState(false)

  const [attendanceTypeList, setAttendanceTypeList] = useState([]);


  //get focused
  const isFocused = useIsFocused();

  //get navigation object
  const navigation = useNavigation();

  //route params

  useEffect(() => {
    //get required values
    getRequiredValues();
  }, [isFocused, props]);

  useEffect(() => {
    //get permission
    getPermission();
  }, [userList]);

  useEffect(() => {
    //get permission
    updateAttendanceDetail();
  }, [attendanceDetail, locationList, shiftList, userList]);

  useEffect(() => {
    getAttendanceDetail();
    getMediaList();
  }, [props, isFocused]);

  useEffect(() => {
    getActionItems();
  }, [attendanceDetail, allowEdit]);

  const preloadedValues = {
    shift: selectedShift ? selectedShift : attendanceDetail.shift_id,
    type: selectedType ? ArrayList.isArray(attendanceTypeList) && attendanceTypeList?.find((data)=> data?.value == selectedType) : ArrayList.isArray(attendanceTypeList) && attendanceTypeList.find((data)=> data?.value == attendanceDetail?.type),
    location: selectedStore ? selectedStore : attendanceDetail.store_id,
    user: param ? param?.userId : attendanceDetail.user_id,
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: preloadedValues });

  const updateAttendanceDetail = () => {
    if (attendanceDetail) {
      setSelectedDate(
        attendanceDetail?.date ? new Date(attendanceDetail?.date) : ""
      );
      setSelectedInTime(
        attendanceDetail?.login ? new Date(attendanceDetail?.login) : ""
      );
      setSelectedOutTime(
        attendanceDetail?.logout ? new Date(attendanceDetail?.logout) : ""
      );

      if (userList && userList.length > 0) {
        let selectedUser = userList.find(
          (data) => data.id == attendanceDetail.user_id
        );
        setSelectedUser(selectedUser);
      }

      if (locationList && locationList.length > 0) {
        let selectedStore = locationList.find(
          (data) => data.value == attendanceDetail.store_id
        );
        setSelectedStore(selectedStore);
      }

      if (shiftList && shiftList.length > 0) {
        let selectedShift = shiftList.find(
          (data) => data.value == attendanceDetail.shift_id
        );
        setSelectedShift(selectedShift);
      }
    }
  };

  const getAttendanceDetail = () => {
    if (params?.attendanceId) {
      AttendanceService.getAttendanceDetail(
        navigation,
        params?.attendanceId,
        (error, response) => {
          if (response && response.data && response.data.data) {
            setAttendanceDetail(response.data.data);
          }
        }
      );
    }
  };

  const getPermission = async () => {
    //get permission list
    let permissionList = await AsyncStorage.getItem(
      AsyncStorageConstants.PERMISSIONS
    );

    const value = await PermissionService.hasPermission(
      Permission.ATTENDANCE_HISTORY_VIEW
    );
    setHistoryPermission(value);

    //validate permission list exist or not
    if (permissionList) {
      //convert string to JSON
      permissionList = JSON.parse(permissionList);

      //validate permission list exist or not
      if (permissionList && permissionList.length > 0) {
        //get permission
        let manageOther =
          permissionList &&
          permissionList.find(
            (option) =>
              option.role_permission === Permission.ATTENDANCE_MANAGE_OTHERS
          )
            ? true
            : false;

        //set all user
        setManageOther(manageOther);

        //validate show all user exist or not
        if (!manageOther && !params?.attendanceId) {
          //validate user list exist or not
          if (userList && userList.length > 0) {
            //get user Id from async storage
            let user_id = await AsyncStorage.getItem(
              AsyncStorageConstants.USER_ID
            );
            //validate user Id exist or not
            if (user_id) {
              //get selected user data
              let selectedUserData = userList.find(
                (data) => data.value == user_id
              );
              //set selected User Data
              setSelectedUser(selectedUserData);
            }
          }
        }
      }
    }
  };

  const getRequiredValues = () => {
    //declare store list option
    const storeListOption = new Array();
    //declare user list option
    const userListOption = new Array();
    //declare shift list option
    const shiftListOption = new Array();

    setStoreLoading(true);
    StoreService.list({}, (error, response) => {
      //get store list
      let storeList = response?.data?.data;
      //validate store list exist or not
      if (storeList && storeList.length > 0) {
        //loop the store list
        for (let i = 0; i < storeList.length; i++) {
          //push the store list
          storeListOption.push({
            label: storeList[i].name,
            value: storeList[i].id,
          });
        }
        //set store list
        setLocationList(storeListOption);
      }
      setStoreLoading(false);
    });

    //get user list
    UserService.getList((err, response) => {
      setUserList(response);
    });

    setShiftLoading(true);
    //get shift list
    ShiftService.getShiftList(null, (error, response) => {
      //validate shift list exist or nott
      let shiftList = response?.data?.data;
      //validate shift list
      if (shiftList && shiftList.length > 0) {
        //loop the shift list
        for (let i = 0; i < shiftList.length; i++) {
          //push the shift list
          shiftListOption.push({
            label: shiftList[i].name,
            value: shiftList[i].id,
          });
        }
        //set the shift list
        setShiftList(shiftListOption);
      }
      setShiftLoading(false);
    });
  };

  const onUserChange = (value) => {
    setSelectedUser(value);
  };

  const onStoreChange = (value) => {
    setSelectedStore(value);
  };

  const onShiftChange = (value) => {
    setSelectedShift(value);
  };

  const onTypeChange = (value) => {
    setSelectedType(value);
  };

  const onNotesChange = (value) => {
    setNotes(value);
  };

  const onInTimeChange = (value) => {
    let Intime = dateTime.TimeUpdate(value, selelctedDate);

    setSelectedInTime(Intime);
  };

  const onOutTimeChange = (value) => {
    let outTime = dateTime.TimeUpdate(value, selelctedDate);

    setSelectedOutTime(outTime);
  };

  const onDateSelect = (value) => {
    setSelectedDate(value);

    let Intime = dateTime.DateUpdate(value, selectedInTime);

    let OutTime = dateTime.DateUpdate(value, selectedOutTime);

    setSelectedInTime(Intime);

    setSelectedOutTime(OutTime);
  };

  const handleEarlyCheckout = () => {
    setAllowEarlyCheckout(!allowEarlyCheckout);
  };

  const handleGoalMissing = () => {
    setAllowGoalMissing(!allowGoalMissing);
  };

  const handleApproveLateCheckin = () => {
    setAllowLateCheckin(!allowLateCheckin);
  };

  const addAttendance = (values) => {
    {
      setIsSubmit(true)
      let bodyData = {
        user: values?.user?.value ? values?.user?.value : selectedUser.value,
        type: values?.type?.value
          ? values?.type?.value
          : attendanceDetail?.type,
        location: values?.location?.value
          ? values?.location?.value
          : selectedStore?.value,
        notes: values?.notes ? values?.notes : notes,
      };
      if (selectedShift) {
        bodyData.shift = values?.shift?.value
          ? values?.shift?.value
          : selectedShift.value;
      }
      if (selelctedDate) {
        bodyData.date = selelctedDate;
      }

      if (selectedInTime) {
        bodyData.login = selectedInTime;
      }

      if (selectedOutTime) {
        bodyData.logout = selectedOutTime;
      }
      bodyData.allow_early_checkout = allowEarlyCheckout;
      bodyData.allow_goal_missing = allowGoalMissing;
      bodyData.approve_late_check_in = allowLateCheckin;

      if (bodyData) {
        if (params?.attendanceId) {
          AttendanceService.updateAttendance(
            navigation,
            params?.attendanceId,
            bodyData,
            (error, response) => {
              if (response) {
                setIsSubmit(false)
                navigation.navigate("Attendance");
              }else{
                setIsSubmit(false)
              }
            }
          );
        } else {
          AttendanceService.add(bodyData, (error, response) => {
            if (response) {
              setIsSubmit(false)
              setSelectedUser("");
              setSelectedStore("");
              setSelectedShift("");
              navigation.navigate("Attendance");
            }else{
              setIsSubmit(false)
            }
          });
        }
      }
    }
  };

  const title = [
    {
      title: TabName.SUMMARY,
      tabName: TabName.SUMMARY,
    },
    {
      title: TabName.ATTACHMENTS,
      tabName: TabName.ATTACHMENTS,
    },
  ];

  if (params && historyPermission) {
    title.push({
      title: TabName.HISTORY,
      tabName: TabName.HISTORY,
    });
  }

  const getMediaList = async () => {
    if (params?.attendanceId) {
      await mediaService.search(
        params?.attendanceId,
        ObjectName.ATTENDANCE,
        (callback) => setMediaData(callback.data.data)
      );
    }
  };

  const updateCheckout = () => {
    AttendanceService.CheckOutValidation(
      params?.attendanceId,
      async (err, response) => {
        if (response) {
          let bodyData = {
            attendanceId: params?.attendanceId,
          };

          AttendanceService.updateCheckOut(bodyData, async (err, response) => {
            if (response) {
              navigation.navigate("Attendance");
            }
          });
        }
      }
    );
  };

  const getActionItems = async () => {
    let actionItems = new Array();
    const editPermission = await PermissionService.hasPermission(
      Permission.ATTENDANCE_EDIT
    );
    if (editPermission) {
      !allowEdit &&
        actionItems.push(
          <MenuItem
            onPress={() => {
              setIsVisible(true), setEdit(true);
            }}
          >
            Edit
          </MenuItem>
        );
      !attendanceDetail?.logout &&
        actionItems.push(
          <MenuItem
            onPress={() => {
              setIsVisible(true), updateCheckout();
            }}
          >
            Check-Out
          </MenuItem>
        );
    }
    setActionList(actionItems);
  };

  return (
    <Layout
      title={"Attendance"}
      showBackIcon={true}
      showActionMenu={
        params &&
        activeTab === TabName.SUMMARY &&
        actionList &&
        actionList.length > 0
          ? true
          : false
      }
      actionItems={actionList}
      buttonLabel={activeTab === TabName.SUMMARY && allowEdit ? "Save" : ""}
      buttonOnPress={handleSubmit((values) => {
        addAttendance(values);
      })}
      closeModal={visible}
      isSubmit = {isSubmit}
    >
      {params && (
        <View>
          <>
            <Tab
              title={title}
              setActiveTab={setActiveTab}
              defaultTab={activeTab}
            />
          </>
        </View>
      )}
      {/* Summary Tab */}
      {activeTab === TabName.SUMMARY && (
        <ScrollView>
          <AttendanceFormComponent
            shiftList={shiftList}
            userList={userList}
            locationList={locationList}
            onUserChange={onUserChange}
            onStoreChange={onStoreChange}
            onShiftChange={onShiftChange}
            onTypeChange={onTypeChange}
            onNotesChange={onNotesChange}
            selectedType={selectedType}
            selectedUser={selectedUser}
            notes={notes}
            manageOther={manageOther}
            selectedDate={selelctedDate}
            selectedInTime={selectedInTime}
            selectedOutTime={selectedOutTime}
            onInTimeChange={onInTimeChange}
            onOutTimeChange={onOutTimeChange}
            onDateSelect={onDateSelect}
            selectedStore={selectedStore}
            selectedShift={selectedShift}
            attendanceDetail={attendanceDetail}
            handleEarlyCheckout={handleEarlyCheckout}
            handleGoalMissing={handleGoalMissing}
            handleApproveLateCheckin={handleApproveLateCheckin}
            allowEarlyCheckout={allowEarlyCheckout}
            allowGoalMissing={allowGoalMissing}
            allowLateCheckin={allowLateCheckin}
            allowEdit={allowEdit}
            control={control}
            typeList={setAttendanceTypeList}
            attendanceTypeList={attendanceTypeList}
          />
        </ScrollView>
      )}

      {/* Attachment Tab */}
      {activeTab === TabName.ATTACHMENTS && (
        <MediaList mediaData={MediaData} getMediaList={getMediaList} />
      )}

      {/* History Tab */}
      {activeTab === TabName.HISTORY && (
        <ScrollView>
          <HistoryList
            objectName={ObjectName.ATTENDANCE}
            objectId={params?.attendanceId}
          />
        </ScrollView>
      )}
    </Layout>
  );
};

export default AttendanceForm;
