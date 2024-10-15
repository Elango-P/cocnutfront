import React from "react";
import AttendanceTypeSelect from "../../../components/AttendanceTypeSelect";
import CheckBox from "../../../components/CheckBox";
import DatePicker from "../../../components/DatePicker";
import LocationSelect from "../../../components/LocationSelect";
import ShiftSelect from "../../../components/ShiftSelect";
import TextArea from "../../../components/TextArea";
import TimePicker from "../../../components/TimePicker";
import UserSelect from "../../../components/UserSelect";
import VerticalSpace10 from "../../../components/VerticleSpace10";
import typeOptions from "../../../helper/Attendance";

const AttendanceForm = (props) => {
  const {
    shiftList,
    userList,
    locationList,
    onUserChange,
    onStoreChange,
    onShiftChange,
    onTypeChange,
    selectedUser,
    manageOther,
    selectedDate,
    selectedInTime,
    selectedOutTime,
    onInTimeChange,
    onOutTimeChange,
    onDateSelect,
    selectedStore,
    typeList,
    selectedType,
    attendanceDetail,
    allowEdit,
    control,
    notes,
    onNotesChange,
    handleEarlyCheckout,
    handleGoalMissing,
    handleApproveLateCheckin,
    allowEarlyCheckout,
    allowGoalMissing,
    allowLateCheckin,
    attendanceTypeList
  } = props;

  let attendanceTypeDetail = attendanceTypeList.find((data)=> data?.value == selectedType )
  return (
    
    <>
    {!attendanceDetail && (
     <>
      <VerticalSpace10 />

      <UserSelect
        name={"user"}
        options={userList}
        label={"User"}
        disable={selectedUser && !allowEdit}
        placeholder={"Select User"}
        getDetails={onUserChange}
        control={control}
        required
      />
      <VerticalSpace10 />
      <AttendanceTypeSelect
        name={"type"}
        onChange={onTypeChange}
        control={control}
        label={"Type"}
        placeholder={"Select Type"}
        disable={!allowEdit}
        required
        typeList={typeList}

      />
      <VerticalSpace10 />
      {((!attendanceTypeDetail?.is_absent) && (!attendanceTypeDetail?.is_leave)) && (
    <>
        <LocationSelect
            name={"location"}
            options={locationList}
            label={"Location"}
            placeholder={"Select Location"}
            getDetails={onStoreChange}
            control={control}
            disable={!allowEdit}
            required
        />
        <VerticalSpace10 />
    </>
)}


      {!attendanceTypeDetail?.is_absent  && (
        <>
          <ShiftSelect
            name={"shift"}
            options={shiftList}
            label={"Shift"}
            placeholder={"Select Shift"}
            onChange={onShiftChange}
            control={control}
            disable={!allowEdit}
            required

          />
          <VerticalSpace10 />
        </>
      )}

      <DatePicker title="Date" onDateSelect={onDateSelect} selectedDate={selectedDate} format={"DD-MMM-YYYY"} disabled={allowEdit} />
      <VerticalSpace10 />

      {!attendanceTypeDetail?.is_absent && (
        <>
          <TimePicker title="In Time" onTimeSelect={onInTimeChange} selectedTime={selectedInTime} placeholder={"Select InTime"} format={"hh:mm a"} disabled={allowEdit} />
          <VerticalSpace10 />

          <TimePicker title="Out Time" selectedTime={selectedOutTime} onTimeSelect={onOutTimeChange} placeholder={"Select OutTime"} format={"hh:mm a"} disabled={allowEdit} />
          <VerticalSpace10 />
        </>
      )}
       <TextArea
                        name="notes"
                        title="Notes"
                        control={control}
                        showBorder={true}
                        values={notes}
                        onInputChange={onNotesChange}
                    />
                       <VerticalSpace10 />
                       <VerticalSpace10 />

                       <VerticalSpace10 />

      </>
      )}
      {attendanceDetail && (
        <>
          <VerticalSpace10 />

          <UserSelect
            name={"user"}
            options={userList}
            label={"User"}
            disable={selectedUser && !allowEdit}
            placeholder={"Select User"}
            getDetails={onUserChange}
            control={control}
            required
          />
          <VerticalSpace10 />
          <AttendanceTypeSelect
            name={"type"}
            options={typeOptions}
            onChange={onTypeChange}
            control={control}
            label={"Type"}
            placeholder={"Select Type"}
            disableSearch
            disable={!allowEdit}
            data = {attendanceDetail?.type}
            required

          />
          <VerticalSpace10 />
          {!attendanceTypeDetail?.is_leave && (
            <>
              <LocationSelect
                name={"location"}
                options={locationList}
                label={"Location"}
                placeholder={"Select Location"}
                getDetails={onStoreChange}
                control={control}
                disable={!allowEdit}
                required

              />
              <VerticalSpace10 />
            </>
          )}

            <>
              <ShiftSelect
                name={"shift"}
                options={shiftList}
                label={"Shift"}
                placeholder={"Select Shift"}
                onChange={onShiftChange}
                control={control}
                disable={!allowEdit}
                required

              />
              <VerticalSpace10 />
            </>

          <DatePicker title="Date" onDateSelect={onDateSelect} selectedDate={selectedDate} format={"DD-MMM-YYYY"} disabled={allowEdit} />
          <VerticalSpace10 />

            <>
              <TimePicker title="In Time" onTimeSelect={onInTimeChange} selectedTime={selectedInTime} placeholder={"Select InTime"} format={"hh:mm a"} disabled={allowEdit} />
              <VerticalSpace10 />

              <TimePicker title="Out Time" selectedTime={selectedOutTime} onTimeSelect={onOutTimeChange} placeholder={"Select OutTime"} format={"hh:mm a"} disabled={allowEdit} />
              <VerticalSpace10 />
            </>
                    <TextArea
                        name="notes"
                        title="Notes"
                        control={control}
                        showBorder={true}
                        values={notes}
                        onInputChange={onNotesChange}
                        editable={allowEdit}
                    />
                       <VerticalSpace10 />
                       <CheckBox label={"Allow Early Checkout"} isChecked={allowEarlyCheckout && "Allow Early Checkout"} toggleCheckbox={handleEarlyCheckout} disabled = {!allowEdit} />
                       <CheckBox label={"Allow Goal Missing"} isChecked = {allowGoalMissing && "Allow Goal Missing"} toggleCheckbox={handleGoalMissing} disabled = {!allowEdit} />
                       <CheckBox label={"Approve Late CheckIn"} isChecked = {allowLateCheckin && "Approve Late CheckIn"} toggleCheckbox = {handleApproveLateCheckin} disabled = {!allowEdit} />


        </>
        

      )}


    </>

  );
};

export default AttendanceForm;
