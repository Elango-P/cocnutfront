import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import AlternativeColor from "./AlternativeBackground";
import Spinner from "./Spinner";
import { Color } from "../helper/Color";
import styles from "../helper/Styles";
import ArrayList from "../lib/ArrayList";
import DateTime from "../lib/DateTime";
import attendanceTypeServie from "../services/AttendanceTypeService";
import Refresh from "./Refresh";
import NoRecordFound from "./NoRecordFound";

const AttendanceTypeSelector = ({ onPress, params = {}, customTypeList, refreshing, setRefreshing, showSingleCheckBox, showMultiCheckBox, seletectedDate }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [typeList, setTypeList] = useState([]);

    const isFocused = useIsFocused();

    useEffect(() => {
        getAttendanceTypeList(true);
    }, [isFocused]);

    useEffect(() => {
        if (refreshing) {
            getAttendanceTypeList(true);
        }
    }, [refreshing]);

    const getAttendanceTypeList = async (initalLoad) => {

        if (initalLoad) {
            typeList && typeList.length == 0 && setIsLoading(true);
        }

        let param = {
            ...params
        }

        if (seletectedDate) {
            param.date = DateTime.toISOStringDate(seletectedDate)
        }

        await attendanceTypeServie.leaveType(param, (res) => {
            setTypeList(res);
            if (initalLoad) {
                setIsLoading(false);
            }
        });
    }

    if (isLoading) {
        return <Spinner />;
    }

    let attendanceTypeList = ArrayList.isArray(customTypeList) ? customTypeList : typeList;

    return (
        <Refresh refreshing={refreshing && refreshing} isLoading={isLoading} setRefreshing={setRefreshing && setRefreshing}>
            <ScrollView>
                {ArrayList.isArray(attendanceTypeList) ? (<ListUI
                    List={ArrayList.isArray(customTypeList) ? customTypeList : typeList}
                    selectProperty={"name"}
                    onPress={onPress}
                    showSingleCheckBox={showSingleCheckBox}
                    showMultiCheckBox={showMultiCheckBox}
                />):(
                <NoRecordFound iconName="receipt" />
                )}
            </ScrollView>
        </Refresh>
    );
};

export default AttendanceTypeSelector;

const ListUI = ({
    List,
    onPress,
    showSelectedRow,
    selectedRowProperty,
    rowCompareValue,
    showSingleCheckBox,
    showMultiCheckBox,
}) => {
    // State to handle single or multi-selected items
    const [selectedItems, setSelectedItems] = useState(showMultiCheckBox ? [] : null);

    const handleSelect = (item) => {
        if (showSingleCheckBox) {
            // Single select - set the selected item
            setSelectedItems(item);
        } else if (showMultiCheckBox) {
            // Multi select - toggle the selected items
            const isAlreadySelected = selectedItems.some(selected => selected.id === item.id);

            if (isAlreadySelected) {
                // Uncheck the item if it is already selected
                setSelectedItems(selectedItems.filter(selected => selected.id !== item.id));
            } else {
                // Add the item to selected items if it is not selected
                setSelectedItems([...selectedItems, item]);
            }
        }
    };

    return (
        <>
            <View style={styles.container}>
                <View>
                    {List && List.length > 0 && List.map((item, index) => {
                        const containerStyle = AlternativeColor.getBackgroundColor(index);

                        const isSingleSelected = showSingleCheckBox && selectedItems && selectedItems.id === item.id;
                        const isMultiSelected = showMultiCheckBox && selectedItems.some(selected => selected.id === item.id);

                        return (
                            <TouchableOpacity
                                key={index}
                                onPress={() => {
                                    item?.isEnabled && onPress(item);
                                    item?.isEnabled && handleSelect(item);
                                }}
                                style={[styles.containers, { height: "auto" }]}
                            >
                                <View style={containerStyle}>
                                    <View style={style.rowContainer}>
                                        {/* Main content area */}
                                        <View style={style.textContainer}>
                                            <Text
                                                style={style.title}
                                            >
                                                {item.name}{" "}
                                            </Text>
                                            {!item.isEnabled && (
                                                <Text style={!item.isEnabled && style.subtext}>
                                                    {item.warningMessage}
                                                </Text>
                                            )}
                                            {/* Description and Leave Type Notes */}
                                            {item.formattedSalary && (
                                                <View style={style.iconTextContainer}>
                                                    <MaterialCommunityIcons
                                                        name="information"
                                                        size={20}
                                                        color="#000"
                                                        style={style.icon}
                                                    />
                                                    <Text
                                                        style={item.isEnabled ? style.itemText : style.disabledText}
                                                    >
                                                        {`${item.days_count} days salary (`}
                                                        <Text style={{ color: 'red' }}>
                                                            {item.formattedSalary}
                                                        </Text>
                                                        {`) will be deducted`}
                                                    </Text>
                                                </View>
                                            )}
                                            {item.leaveTypeNote && (
                                                <View style={style.iconTextContainer}>
                                                    <MaterialCommunityIcons
                                                        name="information"
                                                        size={20}
                                                        color="#000"
                                                        style={style.icon}
                                                    />
                                                    <Text
                                                        style={
                                                            item.isEnabled
                                                                ? style.itemText
                                                                : style.disabledText
                                                        }
                                                    >
                                                        {item.leaveTypeNote}
                                                    </Text>
                                                </View>
                                            )}
                                        </View>

                                        {/* Right side icons (chevron and checkboxes) */}
                                        <View style={style.iconContainer}>
                                            {!showSingleCheckBox && !showMultiCheckBox && showSelectedRow && selectedRowProperty && rowCompareValue && item[selectedRowProperty] === rowCompareValue ? (
                                                <MaterialIcons name="chevron-right" size={30} color="gray" />
                                            ) : null}

                                            {(item?.isEnabled && showSingleCheckBox) && (
                                                <MaterialIcons
                                                    name={isSingleSelected ? "check-box" : "check-box-outline-blank"}
                                                    size={30}
                                                    color={isSingleSelected ? "green" : "gray"}
                                                />
                                            )}

                                            {(item?.isEnabled && showMultiCheckBox) && (
                                                <MaterialIcons
                                                    name={isMultiSelected ? "check-box" : "check-box-outline-blank"}
                                                    size={30}
                                                    color={isMultiSelected ? "green" : "gray"}
                                                />
                                            )}
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
        </>
    );
};

const style = StyleSheet.create({
    rowContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: Color.LIGHT_GRAY,
    },
    itemContainer: {
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: Color.LIGHT_GRAY,
    },
    textContainer: {
        flex: 1, // Allow the text container to take up most space
        paddingRight: 10, // Space between text and icons
    },
    iconContainer: {
        flexDirection: "row", // Align icons in a row if necessary
        alignItems: "center",
        marginTop: 10,
        marginBottom: 10,
    },
    title: {
        fontSize: 16,
        fontWeight: "bold",
        color: Color.BLACK,
    },
    subtext: {
        fontSize: 14,
        color: Color.RED,
    },
    iconTextContainer: {
        flexDirection: "row", // Align icon and text in a row
        alignItems: "center",
        marginTop: 5, // Space between description rows
    },
    icon: {
        marginRight: 8, // Space between icon and text
    },
    itemText: {
        fontSize: 14,
        color: Color.GREY,
    },
    disabledText: {
        fontSize: 14,
        color: Color.LIGHT_GREY1,
    },
});


