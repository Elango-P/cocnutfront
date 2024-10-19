import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Divider } from "react-native-paper";
import Button from "../../components/Button";
import Card from "../../components/Card";
import CheckOutButton from "../../components/CheckOutButton";
import { Color } from "../../helper/Color";
import DateTime from "../../lib/DateTime";
import settingService from "../../services/SettingService";
import asyncStorageService from "../../services/AsyncStorageService";
import Setting from "../../lib/Setting";
import AttendanceService from "../../services/AttendanceService";
import Permission from "../../helper/Permission";
import PermissionService from "../../services/PermissionService";
import AlertMessage from "../../lib/Alert";
import Device from "../../lib/Device";
import AppID from "../../lib/AppID";
import Company from "../../helper/Company";
import Boolean from "../../lib/Boolean";
import { useIsFocused } from "@react-navigation/native";


const AttendanceCard = ({ CheckIn,isSubmit, checkOut,refreshing, checkIn, navigation, locationId }) => {

    const [checkInPermission, setCheckInPermission] = useState("")
    const [devicePendingStatus, setDevicePendingStatus]=useState(false)
    const [isUserRoleAllowMultipleCheckIn,setIsUserRoleAllowMultipleCheckIn] = useState("")
    const isFocused = useIsFocused();

    useEffect(() => {
        const forceCheckIn = async () => {
            const permission = await PermissionService.hasPermission(Permission.USER_MOBILE_CHECKIN)
            setCheckInPermission(permission)
            let RoleId = await asyncStorageService.getRoleId()
            let userId = await asyncStorageService.getUserId()
            await settingService.get(Setting.FORCE_CHECK_IN_AFTER_LOGIN, async (error, response) => {
                let attendance = { user: userId, startDate: DateTime.formatDate(new Date()), endDate: DateTime.toISOEndTimeAndDate(new Date()) }
                AttendanceService.getAttendanceList(null, attendance, (error, Attendnace) => {
                    if (response && response.settings && response.settings[0].value === "true" && Attendnace.length == 0) {
                        if (!locationId) {
                            AlertMessage.Error("Location Not Selected")
                        }else{
                            navigation.navigate("shiftSelect", {
                                store_id: locationId,
                                navigation: navigation,
                                reDirectionUrl: "Dashboard",
                              });
                        }
                       

                    }
                });
            }, RoleId)
        };
        forceCheckIn()
        getPermission()
    }, [])
    useEffect(()=>{
        getMultipleCheckinSettings()
    },[isFocused,refreshing])

    const getMultipleCheckinSettings = async ()=>{
        await settingService.getByName(Setting.USER_ROLE_ALLOW_MULTIPLE_CHECKIN,(err,response)=>{           
            setIsUserRoleAllowMultipleCheckIn(response)
        })
      }            

    const getPermission = async () => {
        await Device.isStatusBlocked((devicePendingStatus)=>{
            setDevicePendingStatus(devicePendingStatus)
        });
    }        

    return (
        <View >

            <Card
                title="Attendance"
                viewAllHander={() => navigation.navigate("Attendance")}
                showViewAll
            >
             
                <View style={styles.containers}>
                    {checkIn && checkIn.length > 0 ? (
                        (() => {
                            for (let i = 0; i < checkIn.length; i++) {
                                const item = checkIn[i];    
                                                                                                                            

                                if (item.login && !item.logout) {
                                    return (
                                        <View style={styles.buttonContainer} key={i}>
                                        {!devicePendingStatus && 
                                        <>
                                        <Text style={{ width: '60%', paddingTop: 15 }}>Today's CheckIn: {item?.login}</Text>
                                            <View style={styles.checkInOutContainer}>
                                                <Button  isSubmit = {isSubmit} title={"Check Out"} backgroundColor={Color.RED} onPress={() => {
                                                    checkOut(item?.id, item?.login, item?.shift_id, item?.date);
                                                }} />
                                            </View>
                                            </>
                                            }
                                        </View>
                                    );
                                }else if(Boolean.isTrue(isUserRoleAllowMultipleCheckIn)){
                                    return (
                                            <>
                                            {checkInPermission && !devicePendingStatus && (
                                               <>
                                                <Text style={styles.text1}> No CheckIn Today</Text>
                                                <View style={styles.checkInButtonContainer}>
                                                    <Button isSubmit = {isSubmit} title={"Check-In Now"} backgroundColor={Color.GREEN} onPress={() => {
                                                        CheckIn();
                                                    }} />
                                                </View>
                                                </>
                                                 )}
                                            </>
                                       
                                    );

                                } else {
                                    return (
                                        <React.Fragment key={i}>
                                            <Text style={{ width: '45%', paddingTop: 5, paddingLeft: 8, justifyContent: 'space-between' }}>CheckIn: {item?.login}</Text>
                                            <Text style={{ width:  '100%', paddingRight: 35, justifyContent: 'space-between', paddingTop: 5 }}>CheckOut: {item?.logout}</Text>
                                        </React.Fragment>
                                    );
                                }
                            }
                        })()
                    ) : (
                        <React.Fragment>
                            {checkInPermission && !devicePendingStatus && (
                                <>
                                    <Text style={styles.text1}> No CheckIn Today</Text>
                                    <View style={styles.checkInButtonContainer}>
                                        <Button title={"Check-In Now"} backgroundColor={Color.GREEN} onPress={() => {
                                            CheckIn();
                                        }} />
                                    </View>
                                </>
                            )}
                        </React.Fragment>
                    )}
                </View>



            </Card >

        </View >
    )

}
export default AttendanceCard;
const styles = StyleSheet.create({

    container: {
        borderColor: 'black',
        borderRadius: 5,
        margin: 5,
        flex: 1,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },

    titles: {
        fontSize: 18,
        fontWeight: 'bold',
        paddingTop: 3
    },

    subTitle: {
        fontSize: 16,
    },

    containers: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    buttonContainer: {
        flexDirection: 'row',
        justifyContent: "flex-start"
    },
    checkInButtonContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingTop: 6,

    },
    table: {
        paddingTop: 10,
        marginLeft: 8,
        marginTop: -20

    },
    checkInOutContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingTop: 9,
        paddingLeft: 10

    },
    attendancecontainer: {
        flexDirection: 'row',
        justifyContent: "space-evenly",
    },
    rowContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        marginTop : 10
    },
    circleContainer1: {
        width: 20,
        height: 20,
        borderRadius: 20,
        backgroundColor: Color.BLACK,
        marginRight: 5,
        alignItems: 'center',
        justifyContent: 'space-evenly',
    },
    circleContainer2: {
        width: 20,
        height: 20,
        borderRadius: 20,
        backgroundColor: Color.GREEN,
        marginRight: 20,
        alignItems: 'center',
        justifyContent: 'space-evenly',
    },
    circleContainer3: {
        width: 20,
        height: 20,
        borderRadius: 20,
        backgroundColor: Color.RED,
        marginRight: 25,
        alignItems: 'center',
        justifyContent: 'space-evenly',
    },
    circleText: {
        color: Color.WHITE,
        fontSize: 12,
        alignItems: 'center',
        marginBottom: 2,

    },
    label1: {
        fontSize: 15,
        paddingRight:2,
        marginLeft:30     

      
    },

    label2: {
        fontSize: 15,
        paddingRight:2,
        marginLeft:40      
    },
    label3: {
        fontSize: 15,    
        paddingRight:2,
        marginLeft:45      
    },
    text1: {
        fontWeight: '400',
        fontSize: 13,
        paddingTop: 10,
    }
});
