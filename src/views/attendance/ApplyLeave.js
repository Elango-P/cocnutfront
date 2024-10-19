// Import React and Component
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ScrollView, View } from "react-native";
import Button from "../../components/Button";
import DatePicker from "../../components/DatePicker";
import Layout from "../../components/Layout";
import Select from "../../components/Select";
import TextArea from "../../components/TextArea";
import { Color } from "../../helper/Color";
import TabName from "../../helper/Tab";
import Alert from "../../lib/Alert";
import DateTime from "../../lib/DateTime";
import asyncStorageService from "../../services/AsyncStorageService";
import AttendanceService from "../../services/AttendanceService";
import attendanceTypeServie from "../../services/AttendanceTypeService";
import shiftService from "../../services/ShiftService";
import AttendanceTypeSelector from "../../components/AttendanceTypeSelector";
import alert from "../../components/Modal/Alert";


const ApplyLeave = (props) => {
  const [selectedDate, setSelectedDate] = useState();
  const [applyLeaveModal, setApplyLeaveModal] = useState("");
  const [visible, setIsVisible] = useState(false);
  const [leaveTypeModel, setLeaveTypeModel] = useState(false);
  const [leaveTypeList, setLeaveTypeList] = useState("");
  const [selectLeaveType, setSelectLeaveType] = useState(null);
  const [reason, setReason] = useState("");
  const [shiftList, setShiftList] = useState([]);
  const [shift, setShift] = useState("");
  const [isSubmit, setIsSubmit] = useState(false);
  const [activeTab, setActiveTab] = useState(TabName.DATE);
  const [refreshing,setRefreshing] = useState(false)
  //get navigation object
  const navigation = useNavigation();
  const preloadedValues = {
    date: selectedDate,
    leaveType: selectLeaveType,
    shift: shift,
  };
  useEffect(() => {
    getShiftList();
  }, []);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: preloadedValues });

  useEffect(() => {
    getAttendanceType();
  }, [selectedDate]);
  const onDateSelect = (value) => {
    try {
        setSelectedDate(value);
        setApplyLeaveModal(false);
    } catch (err) {
      console.log(err);
    }
  };

  const getAttendanceType = async () => {
    try {
      let date = (selectedDate && selectedDate != "") ? selectedDate : "";
      if(date){
        await attendanceTypeServie.list({ date: DateTime.toISOStringDate(date) }, (res) => {
          setLeaveTypeList(res);
        });
      }
    } catch (err) {
      console.log(err);
    }
  };

  const applyLeaveAttendance = async () => {
    {
      setIsSubmit(true);
      if (selectedDate == "") {
        setIsSubmit(false);
        return Alert.Error("Select Date");
      }
      if (!selectLeaveType) {
        setIsSubmit(false);
        return Alert.Error("Select Leave Type");
      }

      if (!shift) {
        setIsSubmit(false);
        return Alert.Error("Select Shift");
      }
      const selectedUser = await asyncStorageService.getUserId();
      let createData = {
        user: selectedUser,
        date: selectedDate,
        type: selectLeaveType && selectLeaveType?.id,
        leaveType: selectLeaveType && selectLeaveType?.id,
        reason: reason || "",
        shift: shift,
      };
      AttendanceService.Leave(createData, (err, response) => {
        if (response) {
          setIsSubmit(false);

          navigation.navigate("Attendance");
        } else {
          setIsSubmit(false);
        }
      });
    }
  };
  const getShiftList = () => {
    //create new rray
    let shiftListOption = new Array();

    shiftService.getShiftList({showAllowedShift:true}, (error, response) => {
      //validate shift list exist or nott
      let shiftList = response?.data?.data;
      //validate shift list
      if (shiftList && shiftList.length > 0) {
        if (shiftList && shiftList.length == 1) {
          setShift(shiftList[0].id);
        }
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
    });
  };


  const handleType = async (value) => {
    setSelectLeaveType(value);
    setLeaveTypeModel(false);
  };
  const onNotesChange = (value) => {
    setReason(value);
  };
  const handleSelect = (value) => {
    setShift(value);
  };

  const returnTitle = () => {
    if ((activeTab == TabName.DATE) || (activeTab == TabName.TYPE)) {
      return "Next"
    } else {
      return "Submit"
    }
  }
  const handleNextButton = (e) => {
    if (activeTab == TabName.DATE && selectedDate) {
      setActiveTab(TabName.TYPE);
    }else if(activeTab == TabName.DATE && !selectedDate){
      alert.Error("Select Leave Date");
    }

    if (activeTab == TabName.TYPE && selectLeaveType) {
      setActiveTab(TabName.SUMMARY);
    }else if(activeTab == TabName.TYPE && !selectLeaveType){
      alert.Error("Select Leave Type");
    }

  }

  const isDisable = () => {
    if ((activeTab == TabName.DATE && selectedDate) || (activeTab == TabName.TYPE && selectLeaveType) || (activeTab == TabName.SUMMARY) || (activeTab == TabName.TYPE && !selectLeaveType) || (activeTab == TabName.DATE && !selectedDate)) {
      return false
    } else {
      return true
    }
  }

  return (
    <Layout
      title={activeTab == TabName.DATE ? "Select Date" : activeTab == TabName.TYPE ? "Select Leave Type" : "Leave"}
      showBackIcon={true}
      buttonLabel={"Cancel"}
      refreshing = {activeTab == TabName.TYPE && refreshing}
      buttonOnPress={() => {
        navigation.navigate("Attendance")
      }}
      closeModal={visible}
      isSubmit={isSubmit}
      backButtonNavigationUrl={() =>
        activeTab == TabName.DATE ? "Attendance" : ""
      }
      backButtonNavigationOnPress={() =>
        activeTab == TabName.TYPE
          ? setActiveTab(TabName.DATE)
          : activeTab == TabName.SUMMARY
            ? setActiveTab(TabName.TYPE)
            : navigation.navigate("Attendance")
      }
      FooterContent={
        <Button
          title={returnTitle()}
          width={"100%"}
          backgroundColor={Color.PRIMARY}
          onPress={activeTab !== TabName.SUMMARY ? () => handleNextButton() : handleSubmit((values) => {
            applyLeaveAttendance(values);
          })}
          isDisabled={isDisable()}
        />
      }
      showActionButton={activeTab == TabName.SUMMARY ? true : false}
    >
      {activeTab == TabName.DATE && (
        <View style={{ flex: 1, width: "100%" }}>
          <DatePicker
            title={"Select Date"}
            onDateSelect={onDateSelect}
            selectedDate={selectedDate ? new Date(selectedDate) : ""}
            onClear={()=>onDateSelect("")} 
            disablePastDates = {true}

          />
        </View>
      )}
      {activeTab == TabName.TYPE && (
        <AttendanceTypeSelector setRefreshing = {setRefreshing} refreshing = {refreshing} onPress={handleType} showSingleCheckBox params={{is_leave: true}} seletectedDate={selectedDate} />
      )}
      <ScrollView>
        {activeTab == TabName.SUMMARY && (
          <>
            <View>
              <DatePicker
                label="Date"
                title={"Date"}
                onDateSelect={onDateSelect}
                selectedDate={selectedDate ? new Date(selectedDate) : ""}
                showTime={true}
                disabled={false}
              />
            </View>
            <View>
              <Select
                name="type"
                label="Leave Type"
                options={leaveTypeList}
                control={control}
                placeholder="Select Type"
                data={selectLeaveType}
                disable
              />
              <Select
                name="shift"
                label="Shift"
                options={shiftList}
                control={control}
                placeholder="Select Shift"
                OnSelect={handleSelect}
                data={shift}
              />
            </View>
          </>
        )}
        {activeTab == TabName.SUMMARY && (
          <View style={{ paddingTop: 5 }}>
            <TextArea
              name="reason"
              title="Reason"
              control={control}
              values={reason}
              onInputChange={onNotesChange}
              required
            />
          </View>
        )}
      </ScrollView>
    </Layout>
  );
};

export default ApplyLeave;


