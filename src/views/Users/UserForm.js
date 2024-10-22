

import React, { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { ScrollView, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MenuItem } from "react-native-material-menu";

// Components
import Name from "../../components/Name";
import Layout from "../../components/Layout";
import DatePicker from "../../components/DatePicker";
import PhoneNumber from "../../components/PhoneNumber";
import VerticalSpace10 from "../../components/VerticleSpace10";
import Email from "../../components/Email";
import Password from "../../components/Password";
import UserRoleSelect from "../../components/UserRoleSelect";
import DeleteConfirmationModal from "../../components/Modal/DeleteConfirmationModal";
import TimeZoneSelect from "../../components/TimeZoneSelect";
import SystemStatusSelect from "../../components/SystemStatusSelect";
import Tab from "../../components/Tab";
import HistoryList from "../../components/HistoryList";

// Services
import userService from "../../services/UserService";
import PermissionService from "../../services/PermissionService";

// Lib
import DateTime from "../../lib/DateTime";

// Helpers
import Permission from "../../helper/Permission";
import styles from "../../helper/Styles";
import TabName from "../../helper/Tab";
import ObjectName from "../../helper/ObjectName";
import { formatMobileNumber } from "../../lib/Format";
import NetworkStatus from "../../lib/NetworkStatus";
import String from "../../lib/String";
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import AppID from "../../lib/AppID";
import apiClient from "../../apiClient";
import { endpoints } from "../../helper/ApiEndPoint";
import LoginService from "../../services/LoginService";

const expoProjectId = Constants?.expoConfig?.extra?.eas?.projectId;


const UserForm = (props) => {
    const params = props?.route?.params?.item
    let id = params?.id
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [phoneNumber, setPhoneNumber] = useState(params?.mobileNumber || "")
    const [role, setRole] = useState(params?.role_id || "")
    const [type, setType] = useState(params?.type || "");
    const [allowEdit, setEdit] = useState(false);
    const [userDeleteModalOpen, setUserDeleteModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(params?.id || "");
    const [actionList, setActionList] = useState([])
    const [status, setStatus] = useState(params?.status || "");
    const [visible, setVisible] = useState(false);
    const [activeTab, setActiveTab] = useState(TabName.SUMMARY);
    const [historyPermission, setHistoryPermission] = useState("");
    const [isSubmit,setIsSubmit] = useState(false)

    const navigation = useNavigation();
    const stateRef = useRef();
    const preloadedValues = {
        id: params?.id,
        email: params?.email,
        firstName: params?.firstName,
        lastName: params?.lastName ? params?.lastName : "",
        mobileNumber: params?.mobileNumber && formatMobileNumber(params?.mobileNumber),
        timeZone: params?.timeZone,
        data: selectedDate,
        role: role,
        type: type,
        status:status,


    }

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: preloadedValues
    });

    useEffect(() => {
        getActionItems();
    }, [allowEdit])

    useEffect(() => {
        getPermission();
    }, []);

    const onDateSelect = (value) => {
        setSelectedDate(new Date(value));
    }

    const handlePhoneNumberChange = (value) => {
        setPhoneNumber(value)
    }

    const handleTypeChange = (value) => {
        setType(value)
    }
    const statusOnSelect = (value) => {
        setStatus(value)
    }
    const updateResetMobileData = async ()=>{
        let bodyData = { userIds: [params?.id], reset_mobile_data: true };

        await userService.bulkUpdate(bodyData, (err, response) => {
            if (response) {
                navigation.navigate("Users")
            }
        })
    }
    const loginAs = async ()=>{
        try{

    const token = (await Notifications.getExpoPushTokenAsync({ projectId: expoProjectId })).data;

        let bodyData = { userIds: [params?.id], reset_mobile_data: true , pushNotificationToken: token,isCustomerApp: AppID.isZunoMart() ? true : false, nameSpace: AppID.getAppId()};

        apiClient.post(
            `${endpoints().UserAPI}/loginByAdmin/${params?.id}`,
            bodyData,
            async (error, response) => {
            if(response && response?.data){
            await LoginService.getDeviceInfo(response?.data,navigation)           
            }else {
                console.error("Login failed: No data in response");
              }
 })
        }catch(err){
            console.log(err);
        }
    }

    const getPermission = async () => {
        const value = await PermissionService.hasPermission(
            Permission.USER_HISTORY_VIEW
        );
        setHistoryPermission(value);
    };


    const createUser = async (values) => {
        setIsSubmit(true)
        const updateData = {
            first_name: values.firstName ? values.firstName : params?.firstName,

            last_name: values.lastName ? values.lastName : params?.lastName,

            date: DateTime.formatDate(selectedDate),

            role: role ? role : params?.role,

            password: values.password ? values.password : params?.password,

            type: type ? type : params?.type,

            email: values.email ? values.email : "",

            mobileNumber1: values.mobileNumber ? values.mobileNumber :"",

            roleId: role.value ? role.value : params?.role,


            timeZone: values?.timeZone?.label ? values?.timeZone?.label : values?.timeZone ? values?.timeZone : "",

            status: values?.status?.value ? values?.status?.value : params?.status

        }
        if (params) {
            await userService.update(params?.id, updateData, (err, response) => {

                if (response && response?.data) {
                    setIsSubmit(false)
                    navigation.navigate("Users")
                }else if(response && response?.status == NetworkStatus.STATUS_BAD_REQUEST) {
                    setIsSubmit(false)
                }else{
                    setIsSubmit(false)
                }
            })
        } else {
            userService.create(updateData, (err, response) => {
                if (response && response.data) {
                    setIsSubmit(false)
                    navigation.navigate("Users")
                }else if(response && response?.status == NetworkStatus.STATUS_BAD_REQUEST) {
                    setIsSubmit(false)
                }else{
                    setIsSubmit(false)
                }
            })
        }


    }

    const userDelete = async () => {
        if (selectedItem) {
            userService.Delete(selectedItem, (error, response) => {
                navigation.navigate("Users")
            })
        }
    };

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
                closeRow(selectedRowMap, selectedItem.id)
                setSelectedItem("");
                stateRef.selectedItem = "";
                stateRef.selecredRowMap = "";
            }
        }
    }

    const userDeleteModalToggle = () => {
        setUserDeleteModalOpen(!userDeleteModalOpen);
        clearRowDetail();
    }

    const getActionItems = async () => {
        let actionItems = new Array();
        const deletePermission = await PermissionService.hasPermission(
            Permission.USER_DELETE
        );
        const editPermission = await PermissionService.hasPermission(
            Permission.USER_EDIT
        );
        const allowLoginAs = await PermissionService.hasPermission(
            Permission.ALLOW_IMPERSONATE_LOGIN
        );
        if (editPermission && !allowEdit) {
            actionItems.push(
                <MenuItem onPress={() => {setEdit(true),setVisible(true)}}>
                    Edit
                </MenuItem>
            )
        }
        if(editPermission){
            actionItems.push(
                <MenuItem onPress={() => {updateResetMobileData(),setVisible(true)}}>
                    Reset Mobile Data
                </MenuItem>
            )
        }
        if(editPermission && allowLoginAs){
            actionItems.push(
                <MenuItem onPress={() => {loginAs(),setVisible(true)}}>
                   Login As
                </MenuItem>
            )
        }


        if (deletePermission) {
            actionItems.push(
                <MenuItem onPress={() => {setUserDeleteModalOpen(true),setVisible(true)}}>
                    Delete
                </MenuItem>

            )

        }
        setActionList(actionItems)
    }

    let title = [];

    title.push({
        title: TabName.SUMMARY,
        tabName: TabName.SUMMARY,
    });

    title.push({
        title: TabName.HISTORY,
        tabName: TabName.HISTORY,
    });

    return (
        <Layout
            title={params ? `${params?.fullname}` : "Add User"}
            showBackIcon={true}
            buttonLabel={allowEdit ? "Save" : !params ? "Add" : ""}
            buttonOnPress={handleSubmit(values => { createUser(values) })}
            actionItems={actionList}
            showActionMenu={params && actionList && actionList.length > 0 ? true : false}
            closeModal={visible}
            isSubmit={isSubmit}


        >
            <DeleteConfirmationModal
                modalVisible={userDeleteModalOpen}
                toggle={userDeleteModalToggle}
                item={selectedItem}
                updateAction={userDelete}
                name={String.concatName(params?.firstName, params?.lastName)}

            />

            {params && historyPermission && (
                <View style={styles.tabBar}>
                    <Tab
                        title={title}
                        setActiveTab={setActiveTab}
                        defaultTab={activeTab}
                    />
                </View>
            )}

            {activeTab === TabName.SUMMARY && (
                <ScrollView >
                    <VerticalSpace10 />

                    <Name
                        title={"First Name"}
                        name="firstName"
                        control={control}
                        required={true}
                        editable={allowEdit}

                    />
                    <VerticalSpace10 />

                    <Name
                        title={"Last Name"}
                        name="lastName"
                        control={control}
                        editable={allowEdit}

                    />
                    <VerticalSpace10 />
                    <Email
                        title={"Email"}
                        name="email"
                        control={control}
                        editable={allowEdit}
                    />
                    <VerticalSpace10 />
                    <PhoneNumber
                        title="Mobile Number"
                        name="mobileNumber"
                        control={control}
                        onInputChange={handlePhoneNumberChange}
                        editable={allowEdit}
                    />
                    <VerticalSpace10 />

                    {!params && (
                        <>
                            <Password
                                title={"Password"}
                                name="password"
                                control={control}
                                required={true}

                            />

                            <VerticalSpace10 />
                        </>
                    )}


                    <UserRoleSelect
                        control={control}
                        label="Role"
                        name={"role"}
                        placeholder={"Select Role"}
                        onChange={(value) => { setRole(value) }}
                        required={true}
                        disable={!allowEdit}

                    />
                    {!params && (
                        <>
                            <VerticalSpace10 />
                            <DatePicker
                                title="Date of joining"
                                onDateSelect={onDateSelect}
                                selectedDate={selectedDate}
                            />
                        </>
                    )}
                    <VerticalSpace10 />

                    <SystemStatusSelect
                        label={"Status"}
                        name="status"
                        control={control}
                        placeholder={"Select Type"}
                        getDetails={statusOnSelect}
                        disable={!allowEdit}
                    />
                    <VerticalSpace10 />
                    <TimeZoneSelect
                        name="timeZone"
                        label="Time Zone"
                        placeholder
                        control={control}
                        disable={!allowEdit}
                    />

                    <VerticalSpace10 paddingTop={80} />

                </ScrollView>
            )}

            {activeTab === TabName.HISTORY && (
                <ScrollView>
                    <HistoryList objectName={ObjectName.USER} objectId={params?.id} />
                </ScrollView>
            )}
        </Layout>
    )

}
export default UserForm;