import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import React, { useState } from "react";
import { Controller } from 'react-hook-form';
import { Platform, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import styles from '../helper/Styles';
import CustomDivider from './Divider';
import Label from './Label';
import { Color } from '../helper/Color';
const DatePicker = ({ onClear, selectedDate, onDateSelect, visible=false,disablePastDates = false, divider, format = "YYYY-MM-DD", displayFormat = "DD-MMM-YYYY", disabled = true, title, showTime, name, control, isForm, required }) => {
    const [datePickerVisible, setDatePickerVisible] = useState(visible ? visible :false);
    const [timePickerVisible, setTimePickerVisible] = useState(false);
    const [selectedDateTime, setSelectedDateTime] = useState("");
      

    const handleClear = () => {
        setSelectedDateTime("");
        onClear && onClear();
    };

    const date = selectedDateTime
        ? moment(selectedDateTime, displayFormat).format(displayFormat)
        : selectedDate && moment(selectedDate).format(displayFormat);
    const showDatePicker = () => {
        setDatePickerVisible(!datePickerVisible);
    };

    const showTimePicker = () => {
        setTimePickerVisible(!timePickerVisible);
    };
    
    const onDateChange = (value)=>{
        try {            
            setDatePickerVisible(false);
            if (value) {
                const formattedDate = moment(value).format(format);
                setSelectedDateTime(moment(value).format(displayFormat));
                onDateSelect(formattedDate);
            }
        } catch (err) {
            console.log(err);
        }
    }

    const onDateSelected = (event, value) => {
        try {
            setDatePickerVisible(false);
            if (value) {
                const formattedDate = moment(value).format(format);
                setSelectedDateTime(moment(value).format(displayFormat));
                onDateSelect(formattedDate);
            }
        } catch (err) {
            console.log(err);
        }
    };

    const onTimeSelected = (event, value) => {
        try {
            setTimePickerVisible(false);
            if (value) {
                const formattedTime = moment(value).format(format);
                setSelectedDateTime(moment(value).format(displayFormat));
                onDateSelect(formattedTime);
            }
        } catch (err) {
            console.log(err);
        }
    };   
    return (
        !disabled ? (<View style={styles.MainContainer}>
            <View style={{ paddingBottom: 2 }}>
                {title && <Label text={title} bold={true} />}
            </View>
    <View style={{ padding: 10 }}>
      {title && <Label color= {Color.LIGHT_GREY} size={15} text={date} />}
  </View>
        </View>) : (
            <TouchableOpacity activeOpacity = {1.2} onPress={disabled === false ? () => setDatePickerVisible(false) : showDatePicker}>
                <View style={styles.MainContainer}>
                    <View style={{ paddingBottom: 2 }}>
                        {title && <Label text={title} bold={true} />}
                    </View>
                    <View style={{ flexDirection: showTime ? 'row' : 'column' }}>
                        <View style={[styles.inputDate, { flexDirection: "row", justifyContent: "space-between" }]}>
                            <TextInput
                                editable={true}
                                showSoftInputOnFocus={false}
                                onPressIn={showDatePicker}
                                name="date"
                                value={date != "Invalid date" ? date : ""}
                                placeholder="Select Date"
                            />
                            {date && (
                                <TouchableOpacity onPress={handleClear}>
                                    {disabled === false ? "" : <Ionicons name="close" size={20} color="grey" style={{ marginTop: 5 }} />}
                                </TouchableOpacity>
                            )}
                        </View>

                        {divider && <CustomDivider />}

                        {showTime && (
                            <TextInput
                                editable={disabled}
                                showSoftInputOnFocus={false}
                                onPressIn={() => showTimePicker()}
                                name="time"
                                value={date}
                                placeholder="Select Time"
                                style={[styles.inputDate, { width: '50%' }]}
                            />
                        )}
                    </View>

                    {datePickerVisible && (
                        <>
                            {isForm ? (
                                <Controller
                                    control={control}
                                    name={name}
                                    rules={required ? { required: `Enter ${placeholder}` } : ""}
                                    render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
                                        <DateTimePicker
                                            value={value ? new Date(value) : new Date()}
                                            mode="date"
                                            display={Platform.OS === 'ios' ? 'inline' : 'default'}
                                            onChange={(event, date) => {
                                                setDatePickerVisible(false);
                                                const formattedDate = moment(date).format(format);
                                                setSelectedDateTime(moment(date).format(displayFormat));
                                                onChange(formattedDate);
                                            }}
                                        />
                                    )}
                                />
                            ) : 
                                
                                <DateTimePicker
                                 value={selectedDate ? new Date(selectedDate) : new Date()}
                                 mode="date"
                                 display={Platform.OS === 'ios' ? 'inline' : 'default'}
                                 onChange={Platform.OS === 'ios' ? selectedDate && onDateSelected : onDateSelected}
                                 onTouchStart={Platform.OS === 'ios' && !selectedDate && onDateChange}
                                 minimumDate={disablePastDates ? new Date() : null}                                 />
                            }
                        </>
                    )}

                    {showTime && timePickerVisible && (
                        <DateTimePicker
                            value={selectedDate ? new Date(selectedDate) : new Date()}
                            mode="time"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            format="hh:mm A"
                            onChange={onTimeSelected}
                        />
                    )}
                </View>
            </TouchableOpacity>)
    );
}

export default DatePicker;


