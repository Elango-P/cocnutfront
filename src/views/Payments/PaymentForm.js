import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { View, StyleSheet } from "react-native";
import { ScrollView } from "react-native";
import { MenuItem } from "react-native-material-menu";

// Components
import Layout from "../../components/Layout";
import Currency from "../../components/Currency";
import DatePicker from "../../components/DatePicker";
import PaymentAccountSelect from "../../components/PaymentAccountSelect";
import Select from "../../components/Select";
import VerticalSpace10 from "../../components/VerticleSpace10";
import UserSelect from "../../components/UserSelect";
import Tab from "../../components/Tab";
import MediaList from "../../components/MediaList";
import TextInput from "../../components/TextInput";
import TextArea from "../../components/TextArea";

// Services
import accountService from "../../services/AccountService";
import mediaService from '../../services/MediaService';
import PermissionService from "../../services/PermissionService";
import StatusService from "../../services/StatusServices";
import PaymentService from "../../services/PaymentService";

// Helpers
import TabName from '../../helper/Tab';
import Media from '../../helper/Media';
import ObjectName from "../../helper/ObjectName";
import Permission from "../../helper/Permission";
import { Color } from "../../helper/Color";
import Number from "../../lib/Number";
import HistoryList from "../../components/HistoryList";
import styles from "../../helper/Styles";

const PaymentForm = (props) => {
    const params = props?.route?.params?.item
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [accountList, setAccountList] = useState([]);
    const [amount, setAmount] = useState(params?.amount || "")
    const [activeTab, setActiveTab] = useState(TabName.SUMMARY);
    const [MediaData, setMediaData] = useState([]);
    const [selectedUser, setSelectedUser] = useState(params?.owner_id  || null);
    const [selectedDueDate, setSelectedDueDate] = useState(new Date())
    const [status, setStatus] = useState(params?.statusId || null);
    const [notes, setNotes] = useState(params?.notes || "");
    const [id, setId] = useState("")
    const [account, setAccount] = useState("")
    const [paymentAccount, setPaymentAccount] = useState("");
    const [statusList, setStatusList] = useState([])
    const [allowEdit, setEdit] = useState(true);
    const [visible, setVisible] = useState(false)
    const [actionList, setActionList] = useState([])
    const [accountName,setAccountName] = useState()
    const [paymentHistoryViewPermission, setPaymentHistoryViewPermission] = useState("")
    const [isSubmit,setIsSubmit] = useState(false)
    const preloadedValues = {
        amount: params && parseInt(params?.amount),
        account: params?.accountId,
        payment_account: params?.paymentAccountId,
        invoice_number: params?.invoice_number,
        due_date: params?.due_date ? params?.due_date : selectedDueDate,
        date: params?.date ? params?.date : selectedDate,
        notes: notes,
        status : params?.statusId,
        owner_id : selectedUser ? Number.Get(selectedUser):params?.owner_id

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
    useEffect(()=>{
        getPermission()
    },[])

    useEffect(() => {
        let mount = true
        mount && accountService.GetList(null, (callback) => { setAccountList(callback) })
        mount && getMediaList()
        mount && getStatus()
        mount && updateDateValues()
        return () => {
            mount = false
        }
    }, [])
    useEffect(() => {
        if (accountList.length > 0) {
            const accountExists = accountList && accountList.filter(data => data.value === params?.accountId);
            if (accountExists.length === 0) {
                setAccountName(params?.account);
            }
        }
    }, [accountList]);




    const changeOwner = (value) => {
        if (value && value?.id) {
            setSelectedUser(value && value?.id)
        }

    }
    const onDueDateSelect = (value) => {
        setSelectedDueDate(new Date(value));
    }
    const onDateSelect = (value) => {
        setSelectedDate(new Date(value));
    }

    const onNotesChange = (value) => {
        setNotes(value)
        if (value == "") {
            params.notes = "";
        }
    }
    const updateDateValues = () => {
        let date = params?.date;
        if (date) {
            setSelectedDate(new Date(date));
        }
        let due_date = params?.due_date;
        if (due_date) {
            setSelectedDueDate(new Date(due_date));
        }

    }


    const statusOnSelect = (value) => {
        setStatus(value?.value)

    }
    const getPermission = async () => {
        const isExist = await PermissionService.hasPermission(Permission.PAYMENT_HISTORY_VIEW);
        setPaymentHistoryViewPermission(isExist)
    }

    const getActionItems = async () => {
        let actionItems = new Array();
        const editPermission = await PermissionService.hasPermission(
            Permission.PAYMENT_EDIT
        );

        if (editPermission && !allowEdit) {
            actionItems.push(
                <MenuItem onPress={() => {
                    setEdit(true);
                    setVisible(true);
                }}>
                    Edit
                </MenuItem>
            )
        }

        setActionList(actionItems)
    }


    const handleAccountChange = (value) => {
        setAccount(value),
            setPaymentAccount(value.payment_account)
    }


    const getStatus = async () => {
        let status = [];
        const response = await StatusService.list(ObjectName.PAYMENT);

        response && response.forEach((statusList) => {
            status.push({
                label: statusList.name,
                value: statusList.status_id,
                id: statusList.status_id,
                default_owner: statusList?.default_owner,
            });
        });

        setStatusList(status);

    }

    const addPayment = async (values) => {
        setIsSubmit(true)
        let createData = {
            date: selectedDate,
            amount: values.amount ? values.amount : parseInt(params.amount),
            account: values.account.value ? values.account.value : values.account ? values.account : params?.account,
            payment_account: values?.payment_account?.value ? values?.payment_account?.value : values?.payment_account ? values?.payment_account : paymentAccount ? paymentAccount : params?.paymentAccount,
            invoice_number: values.invoice_number ? values.invoice_number : params?.invoice_number,
            owner_id: selectedUser ? selectedUser : values.owner_id?.value ? values.owner_id?.value : values.owner_id && values.owner_id,
            due_date: selectedDueDate,
            notes: values?.notes ? values?.notes : "",
            account_id: values.account ? values.account : values?.account?.value ? values?.account?.value : "",
            payment_account_id: values?.payment_account?.value ? values?.payment_account?.value : params?.payment_account,
        }
        if (params) {
            await PaymentService.update(params?.id, createData, (err, response) => {
                if (response) {
                    setIsSubmit(false)
                    props.navigation.navigate("Payments")
                } else {
                    setIsSubmit(false)
                }
            })
        } else {
            await PaymentService.create(createData, (err, response) => {
                if (response) {
                    setId(response.data.id)
                    setActiveTab(TabName.ATTACHMENTS)
                    setIsSubmit(false)
                } else {
                    setIsSubmit(false)
                }
            })
        }

    }
    const takePicture = async (e) => {
        setIsSubmit(true)
        const image = await Media.getImage();
        if (image && image.assets) {
            const response = await fetch(image.assets[0].uri);
            const blob = await response.blob();
            await Media.uploadImage(id ? id : params?.id, blob, image.assets[0].uri, ObjectName.PAYMENT, null, null, async (response) => {
                if (response) {
                    getMediaList();
                    setIsSubmit(false)

                }
            })
        }
    };


    const getMediaList = async () => {
        if (id || params?.id) {
            await mediaService.search(id ? id : params?.id, ObjectName.PAYMENT, (callback) => setMediaData(callback.data.data))
        }
    }
    let title = [
        {
            title: TabName.SUMMARY,
            tabName: TabName.SUMMARY
        },
        {
            title: TabName.ATTACHMENTS,
            tabName: TabName.ATTACHMENTS
        },
    ]
    if(params && paymentHistoryViewPermission){
        title.push({
            title: TabName.HISTORY,
            tabName: TabName.HISTORY
        })
    }

    return (
        <Layout
            title={params ? `Payment Detail#: ${params?.id}` : " Add Payment "}
            showBackIcon
            buttonLabel={activeTab === TabName.ATTACHMENTS && "Upload"}
            buttonLabel2={activeTab === TabName.SUMMARY && allowEdit && params ? "Save" :activeTab === TabName.SUMMARY &&  !params ? "Add" : ""}
            button2OnPress={handleSubmit(values => { addPayment(values) })}
            buttonOnPress={() => takePicture()}
            showActionMenu={activeTab === TabName.SUMMARY && params && !allowEdit && actionList && actionList.length > 0 ? true : false}
            actionItems={actionList}
            closeModal={visible}
            isSubmit={isSubmit}

        >
            {params &&
                <View style={styles.tabBar}>
                    <Tab
                        title={title}
                        setActiveTab={setActiveTab}
                        defaultTab={activeTab}
                    />
                </View>
            }

            {activeTab === TabName.SUMMARY && (
                <ScrollView>
                    <View style={{ marginTop: 10, padding: 10 }}>
                        <DatePicker
                            title="Date"
                            onDateSelect={onDateSelect}
                            disabled={allowEdit}
                            selectedDate={new Date(params?.date) ? selectedDate : selectedDate}
                        />
                        <VerticalSpace10 />
                        <>
                            <Select
                                control={control}
                                required={true}
                                options={accountList}
                                name="account"
                                label="Account"
                                placeholder={accountName ? accountName : "Select Account"}
                                placeholderTextColor={accountName ? Color.DROPDOWN_TEXT : Color.PLACEHOLDER_TEXT}
                                disable={!allowEdit}
                                getDetails={(value) => handleAccountChange(value)}

                            />
                            <VerticalSpace10 />
                            <PaymentAccountSelect
                                control={control}
                                data={paymentAccount ? paymentAccount : params?.payment_account}
                                name="payment_account"
                                label="Payment Account"
                                placeholder={"Select Payment Account"}
                                disable={!allowEdit}
                            />
                            <VerticalSpace10 />

                        </>
                        <TextInput
                            title="Invoice Number "
                            name="invoice_number"
                            required={true}
                            control={control}
                            editable={allowEdit}
                        />
                        <VerticalSpace10 />
                        <Currency
                            name="amount"
                            title={"Amount"}
                            control={control}
                            edit={allowEdit}
                            onInputChange={(values) => setAmount(values)}
                            values={amount}
                            required={true}
                            placeholder="Amount" />
                        <>
                            <VerticalSpace10 />

                            <Select
                                label={"Status"}
                                name="status"
                                control={control}
                                options={statusList}
                                required={true}
                                placeholder={"Select Status"}
                                getDetails={statusOnSelect}
                                disable={!allowEdit}
                            />


                            <VerticalSpace10 />

                            <UserSelect
                                label="Owner"
                                name={"owner_id"}
                                getDetails={(value) => {setSelectedUser(value.value)}}
                                control={control}
                                placeholder="Select Owner"
                                disable={!allowEdit}
                                onChange={changeOwner}

                            />
                            <VerticalSpace10 />
                            <DatePicker
                                title="Due Date"
                                onDateSelect={onDueDateSelect}
                                disabled={allowEdit}
                                selectedDate={new Date(params?.due_date) ? selectedDueDate : selectedDueDate}
                            />
                            <VerticalSpace10 />
                            <TextArea
                                name="notes"
                                title="Notes"
                                control={control}
                                showBorder={true}
                                values={notes}
                                editable={allowEdit}
                                onInputChange={onNotesChange}
                            />
                            <VerticalSpace10 />
                        </>

                    </View>
                </ScrollView>

            )}

            {activeTab === TabName.ATTACHMENTS && (
                <MediaList
                    mediaData={MediaData}
                    getMediaList={getMediaList}
                />
            )}
            {activeTab === TabName.HISTORY && (
                <ScrollView>
                    <HistoryList
                        objectName={ObjectName.PAYMENT}
                        objectId={params?.id}
                    />

                </ScrollView>
            )}


        </Layout>
    )

}
export default PaymentForm

