import React, { useEffect, useState, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { ScrollView, View } from "react-native";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { MenuItem } from "react-native-material-menu";

// Components
import Layout from "../../components/Layout";
import VerticalSpace10 from "../../components/VerticleSpace10";
import AddressSelect from "../../components/AddressSelect";
import AccountSelect from "../../components/AccountSelect";
import DatePicker from "../../components/DatePicker";
import Currency from "../../components/Currency";
import Tab from "../../components/Tab";
import MediaList from "../../components/MediaList";
import StatusSelect from "../../components/StatusSelect";
import UserSelect from "../../components/UserSelect";
import TextArea from "../../components/TextArea";
import TextInput from "../../components/TextInput";
import HistoryList from "../../components/HistoryList";
import DeleteConfirmationModal from "../../components/Modal/DeleteConfirmationModal";

// Services
import accountService from "../../services/AccountService";
import addressServices from "../../services/AddressService";
import PermissionService from "../../services/PermissionService";
import billService from "../../services/BillService";
import mediaService from "../../services/MediaService";

// Helpers
import Permission from "../../helper/Permission";
import TabName from '../../helper/Tab';
import ObjectName from "../../helper/ObjectName";
import Media from "../../helper/Media";

// lib
import CurrenCy from "../../lib/Currency";
import Number from "../../lib/Number";


const BillForm = (props) => {
    const params = props?.route?.params?.item
    const param = props?.route?.params
    let id = params?.id
    const [addressList, setAddressList] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [billingName, setBillingName] = useState(params?.billing_name || "");
    const [accountName, setAccountName] = useState(params?.account_id || "");
    const [netAmount, setNetAmount] = useState("");
    const [taxAmount, setTaxAmount] = useState(params?.gstAmount || "");
    const [activeTab, setActiveTab] = useState(TabName.SUMMARY);
    const [MediaData, setMediaData] = useState([]);
    const [invoiceAmount, setInvoiceAmount] = useState("")
    const [rejectedAmount, setRejectedAmount] = useState(params?.rejectedProductAmount || "")
    const [expiryReturnedProductAmount, setExpiryReturnedProductAmount] = useState(params?.expiryReturnedProductAmount || "")
    const [otherDeduction, setOtherDeduction] = useState(params?.otherDeductionAmount || "")
    const [cashDiscountPercentage, setCashDiscountPercentage] = useState(parseFloat(params?.cashDiscountPercentage) || "")
    const [cashDiscountAmount, setCashDiscountAmount] = useState(params && params?.cashDiscountAmount || "")
    const [selectedDueDate, setSelectedDueDate] = useState(new Date())
    const [selecteUser, setSelectedUser] = useState("");
    const [notes, setNotes] = useState(params?.notes || "");
    const [status,setStatus] = useState("");
    const [allowEdit, setEdit] = useState(!params ? true : false);
    const [actionList, setActionList] = useState([])
    const [visible, setVisible] = useState(false)
    const [paymentAmount, setPaymentAmount] = useState("");
    const [billHistoryViewPermission,setBillHistoryViewPermission] = useState("")
    const [deleteModalOpen, setDeleteModalOpen] = useState("")
    const [isSubmit,setIsSubmit] = useState(false)
   const [billStatus,setBillStatus] = useState(params?.statusDetails?.id || "")
    const isFocused = useIsFocused();
    const navigation = useNavigation();

    const preloadedValues = {
        id: params?.id,
        billing_name: addressList.find(value => value.label == billingName),
        account_id: accountName ? accountName : params?.account_id,
        amount: params?.amount || "",
        invoice_number: params?.invoiceNumber,
        net_amount:netAmount? Number.GetFloat(netAmount) :params?.netAmount ,
        returnedItemAmount: params?.rejectedProductAmount,
        other_deduction_amount:params?.otherDeductionAmount,
        cash_discount_percentage:  addressList.find(value => value.cash_discount == cashDiscountPercentage),
        cash_discount_amount: cashDiscountAmount?cashDiscountAmount:params?.cashDiscountAmount,
        date: params?.date ? params?.date : selectedDate,
        due_date: params?.due_date ? params?.due_date : selectedDueDate,
        deductionAmount:params?.deductionAmount || "",
        grossAmount:params?.grossAmount || "",
        notes : notes,
        status : billStatus ? billStatus : params?.statusDetails?.id,
        gst_status : status ? status : params?.gst_status_id
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

    const billDataRef = useRef({
        invoiceAmount: null,
        discountPercentage: null,
        cashDiscountAmountUse: null,
        otherDeductionAmount: null,
        rejectedItemAmount: null,
        paybleAmount: null,
        billId: params?.id ? params?.id : null,
        expiryReturnedProductAmount: null,
    });    

    useEffect(() => {
        let mount = true;
        mount && updateDateValues();
        mount && getBillPermission();
        mount && getMediaList();

        mount && addressServices.search({}, callback => { setAddressList(callback); })


        //cleanup function
        return () => {
            mount = false;
        };
    }, [isFocused])
    const takePicture = async (e) => {
        setIsSubmit(true)
        const image = await Media.getImage();
        if (image && image.assets) {
            const response = await fetch(image.assets[0].uri);
            const blob = await response.blob();
            await Media.uploadImage(params?.id ? params?.id : param?.id, blob, image.assets[0].uri, ObjectName.BILL, null, null, async (response) => {
                if (response) {
                    setIsSubmit(false)
                    getMediaList();
                }
            })
        }
    };
    const getMediaList = async () => {
        if(params?.id){
            await mediaService.search(params?.id, ObjectName.BILL, (callback) => setMediaData(callback.data.data))

        }
    }


    const getBillPermission = async () => {
        const billHistoryViewPermission = await PermissionService.hasPermission(Permission.BILL_HISTORY_VIEW)
        setBillHistoryViewPermission(billHistoryViewPermission)
    }

    const handleVendorChange = (value) => {
        setAccountName(value)
        setCashDiscountPercentage(value.cash_discount )
        setBillingName(value?.billing_name );
        billDataRef.current.discountPercentage = value?.cash_discount?value?.cash_discount:"";
        const data = paymentAmount * (value?.cash_discount / 100);
        billDataRef.current.cashDiscountAmountUse = data;
        updateBillData();
    }

    const updateBillData = () => {
        try {
            const invoiceAmountUse = billDataRef.current.invoiceAmount
                ? Number.GetFloat(billDataRef.current.invoiceAmount)
                : Number.GetFloat(params?.invoiceAmount);



            const rejectAmountUse =
                (billDataRef.current.rejectedItemAmount == "" ||
                    billDataRef.current.rejectedItemAmount !== "") &&
                    billDataRef.current.rejectedItemAmount !== null
                    ? Number.GetFloat(billDataRef.current.rejectedItemAmount)
                    : params?.rejectedProductAmount
                        ? Number.GetFloat(params?.rejectedProductAmount)
                        : 0;

                        const expiryAmountUse =
                        (billDataRef.current.expiryReturnedProductAmount == "" ||
                            billDataRef.current.expiryReturnedProductAmount !== "") &&
                            billDataRef.current.expiryReturnedProductAmount !== null
                            ? Number.GetFloat(billDataRef.current.expiryReturnedProductAmount)
                            : params?.expiryReturnedProductAmount
                                ? Number.GetFloat(params?.expiryReturnedProductAmount)
                                : 0;

            const otherDeductionAmountUse =
                (billDataRef.current.otherDeductionAmount == "" ||
                    billDataRef.current.otherDeductionAmount !== "") &&
                    billDataRef.current.otherDeductionAmount !== null
                    ? Number.GetFloat(billDataRef.current.otherDeductionAmount)
                    : params?.otherDeductionAmount
                        ? Number.GetFloat(params?.otherDeductionAmount)
                        : 0;

            const paybleAmountuse =
                invoiceAmountUse -
                (  otherDeductionAmountUse + rejectAmountUse + expiryAmountUse);
            setPaymentAmount(paybleAmountuse);

            let discountPercent =
                billDataRef &&
                    (billDataRef.current.discountPercentage == "" ||
                        billDataRef.current.discountPercentage !== "") &&
                    billDataRef.current.discountPercentage !== null
                    ? billDataRef.current.discountPercentage
                    : params && params?.cashDiscountPercentage
                        ? params && params?.cashDiscountPercentage
                        : "";

            const data = paybleAmountuse * (discountPercent / 100);
            setCashDiscountAmount(data);
           

            let NetAmount =(discountPercent !== null && discountPercent !== "")
            ? paybleAmountuse - data
                : paybleAmountuse;
            setNetAmount(NetAmount);
        } catch (err) {
            console.log(err);
        }
    };
    const onDateSelect = (value) => {
        setSelectedDate(new Date(value));
    }
    const onDueDateSelect = (value) => {
        setSelectedDueDate(new Date(value));
    }
    const updateDateValues = () => {
        let date = params?.date;
        let dueDate = params?.due_date;
        if (date) {
            setSelectedDate(new Date(date));
        }
        if(dueDate){
            setSelectedDueDate(new Date(dueDate))
        }
    }
    const handleBilllingNameChange = (label) => {
        setBillingName(label && label?.label)
    }
    const onNetAmountChange = (value) => {
        setNetAmount(value)
    };
    const onTaxAmountChange = (value) => {
        setTaxAmount(value)
    };

    const onInvoiceAmountChange = (value) => {
        const invoiceAmount = value
        setInvoiceAmount(value)
        billDataRef.current.invoiceAmount = invoiceAmount;
        updateBillData();
    };

    const onExpiryReturnAmount = (value) => {
        const expiryReturnedProductAmount = value
        if(expiryReturnedProductAmount){
            let total_amount = (CurrenCy.Get(invoiceAmount) - CurrenCy.Get(expiryReturnedProductAmount))
            setNetAmount(total_amount|| "")
        }
        setExpiryReturnedProductAmount(value)
        billDataRef.current.expiryReturnedProductAmount = value;

        updateBillData();
    };
    const onRejectedProductAmount = (value) => {
        const returnAmount = value
        if(returnAmount){
            let total_amount = (CurrenCy.Get(invoiceAmount) - CurrenCy.Get(returnAmount))
            setNetAmount(total_amount|| "")
        }
        setRejectedAmount(value)
        billDataRef.current.rejectedItemAmount = value;

        updateBillData();
    };
    const onOtherDeduction = (value) => {
        setOtherDeduction(value)
        billDataRef.current.otherDeductionAmount = value;
        updateBillData();
    };
    const onCashDiscount = (value) => {

        setCashDiscountPercentage(value)
        billDataRef.current.discountPercentage = value;
        updateBillData();
    };
    const onNotesChange = (value) => {
        setNotes(value);
    };


    const onStatusChange = async (value) => {
        setBillStatus(value?.id)
        let status = {
            status: value?.id
        }

        await billService.updatStatus(params?.id, status, (err, response) => {
        })
    }
   const onChangeGstStatus = async(value)=>{    
    setStatus(value)
   }
    const createBill = async (values) => {
        setIsSubmit(true)
        const updateData = {

            invoice_number: values.invoice_number ? values.invoice_number : params?.invoiceNumber,

            net_amount: netAmount ? Number.GetFloat(netAmount) : params?.netAmount,

            invoice_amount: invoiceAmount ? Number.GetFloat(invoiceAmount) : params?.invoiceAmount,

            rejectedProductAmount: values?.rejectedProductAmount ? values?.rejectedProductAmount : params?.rejectedProductAmount,

            expiryReturnedProductAmount: values?.expiryReturnedProductAmount ? values?.expiryReturnedProductAmount : params?.expiryReturnedProductAmount,

            otherDeductionAmount: values.other_deduction_amount ? Number.GetFloat(values.other_deduction_amount) : params?.otherDeductionAmount,



            date: selectedDate,

            notes : values?.notes && values?.notes ,
            gst_status : values?.gst_status ? values?.gst_status?.id : params?.gst_status_id,

            gstAmount : values?.gst_amount ? values?.gst_amount : params?.gstAmount,

            cash_discount_percentage: cashDiscountPercentage?Number.GetFloat(cashDiscountPercentage):params?.cashDiscountPercentage,

            cash_discount_amount: Number.GetFloat(cashDiscountAmount) ? Number.GetFloat(cashDiscountAmount) : params?.cashDiscountAmount,


            billing_name: billingName ? billingName : "",

            account_id: values.account_id ? values.account_id.value : params?.account_id,

            due_date: selectedDueDate,
            owner : values.owner ? values?.owner?.value : params?.owner_id
        }
          
        if (params) {
            await billService.update(params?.id, updateData, (err, response) => {
                if (response) {
                    setIsSubmit(false)
                    navigation.navigate("Bills")
                }else{
                    setIsSubmit(false)
                }
            })
        } else {
            billService.create(updateData, (err, response) => {
                if (response && response.data) {
                    setIsSubmit(false)
                    navigation.navigate("Bills")

                }else{
                    setIsSubmit(false)
                }
            })
        }


    }
    const getActionItems = async () => {
        let actionItems = new Array();

        const editPermission = await PermissionService.hasPermission(
            Permission.BILL_EDIT
        );

        const deletePermission = await PermissionService.hasPermission(
            Permission.BILL_DELETE
        );

        if (editPermission && !allowEdit) {
            actionItems.push(
                <MenuItem onPress={() => {
                    setEdit(true);
                    setVisible(true);
                    setTimeout(() => setVisible(true), 0);
                }}>
                    Edit
                </MenuItem>

            )
        }

        if (deletePermission) {
            actionItems.push(
                <MenuItem
                    onPress={() => {
                        setDeleteModalOpen(true);
                        setVisible(false);
                        setTimeout(() => setVisible(true), 0);
                    }}
                >
                    Delete
                </MenuItem>
            );
        }
        setActionList(actionItems)
    }

    let  title=
        [
            {
                title: TabName.SUMMARY,
                tabName: TabName.SUMMARY
            },
            {
                title: TabName.ATTACHMENTS,
                tabName: TabName.ATTACHMENTS
            },
        ]

        if(billHistoryViewPermission){
            title.push({
            title: TabName.HISTORY,
            tabName: TabName.HISTORY
        })
    }

    const billDelete = async () => {
        if (params?.id) {
            billService.Delete(params?.id, (res) => {
                if (res) {
                    navigation.navigate("Bills")
                }
            })
        }
    };

    const deleteModalToggle = () => {
        setDeleteModalOpen(!deleteModalOpen);
        setVisible(false);
    }

    return (
        <Layout
            title={params ? `Bill#: ${params?.bill_number}` : "Add Bill"}
            showBackIcon={true}
            buttonLabel2={activeTab === TabName.SUMMARY && allowEdit && params ? "Save" : !params ? "Add" : ""}
            closeModal={visible}
            buttonLabel={activeTab === TabName.ATTACHMENTS && "Upload"}
            buttonOnPress={() => { takePicture() }}
            button2OnPress= {handleSubmit(values => { createBill(values) })}
            showActionMenu={activeTab === TabName.SUMMARY && params && !allowEdit && actionList && actionList.length > 0 ? true : false}
            actionItems={actionList}
            isSubmit = {isSubmit}

        >
            <DeleteConfirmationModal
                modalVisible={deleteModalOpen}
                toggle={deleteModalToggle}
                item={params?.id}
                updateAction={billDelete}
                id={params?.id}
            />
            {params && (
                    <>
                        <Tab
                            title={title}
                            setActiveTab={setActiveTab}
                            defaultTab={activeTab}
                        />
                    </>
            )}
            {activeTab === TabName.SUMMARY && (
                <ScrollView >
                    <VerticalSpace10 />

                    <AccountSelect
                        label="Account"
                        name="account_id"
                        required={true}
                        control={control}
                        onChange={handleVendorChange}
                        data={params?.account_id ? params?.account_id : accountName}
                        placeholder="Select Vendor"
                        disable={!allowEdit}

                    />
                    <VerticalSpace10 paddingTop={5} />

                    <TextInput
                        title="Vendor Invoice# "
                        name="invoice_number"
                        required={true}
                        control={control}
                        editable={allowEdit}
                    />
                    <VerticalSpace10 paddingTop={5} />
                    <DatePicker
                        title="Invoice Date"
                        onDateSelect={onDateSelect}
                        disabled={allowEdit}
                        selectedDate={new Date(params?.date) ? selectedDate : selectedDate}
                    />
                    <VerticalSpace10 />

                    <AddressSelect
                        label="Billing Name"
                        name="billing_name"
                        options={addressList}
                        required={billingName !=="" ? false : true}
                        onChange={handleBilllingNameChange}
                        control={control}
                        data={preloadedValues &&preloadedValues?.billing_name &&preloadedValues?.billing_name?.id }
                        placeholder="Select Billing Name"
                        disable={!allowEdit}
                    />
                    <VerticalSpace10 />
                    {params && (
                        <>
                            <StatusSelect
                                label={"Status"}
                                name="status"
                                control={control}
                                placeholder={"Select Status"}
                                object={ObjectName.BILL}
                                currentStatusId={billStatus ? billStatus : params?.statusDetails?.id}
                                disable={!allowEdit}
                                onChange={(value) => onStatusChange(value)}
                            />
                            <VerticalSpace10 />
                        </>
                    )}

                    <Currency
                        title="Invoice Amount"
                        name="invoice_amount"
                        control={control}
                        showBorder={true}
                        edit={allowEdit}
                        onInputChange={onInvoiceAmountChange}
                        values={invoiceAmount ? invoiceAmount:params?.invoiceAmount}
                    />
                    {params && (
                        <>
                            <VerticalSpace10 />

                            <Currency
                                title="Tax Amount"
                                name="gst_amount"
                                control={control}
                                showBorder={true}
                                edit={allowEdit}
                                onInputChange={onTaxAmountChange}
                                values={taxAmount.toString()}
                            />
                        </>
                    )}

                    <VerticalSpace10 />


                    <Currency
                        name="rejectedProductAmount"
                        title="Rejected Items Amount"
                        control={control}
                        placeholder="Rejected Items Amount"
                        onInputChange={onRejectedProductAmount}
                        edit={allowEdit}
                        values={rejectedAmount.toString()}

                    />
                    <VerticalSpace10 />

                     <Currency
                        name="expiryReturnedProductAmount"
                        title="Expiry Returned Amount"
                        control={control}
                        placeholder="Expiry Returned Amount"
                        onInputChange={onExpiryReturnAmount}
                        edit={allowEdit}
                        values={expiryReturnedProductAmount.toString()}

                    />
                    <VerticalSpace10 />

                    <Currency
                        name="other_deduction_amount"
                        control={control}
                        title="Other Deduction Amount"
                        placeholder="Other Deduction Amount"
                        onInputChange={onOtherDeduction}
                        edit={allowEdit}
                        values={otherDeduction.toString()}
                    />
                    <VerticalSpace10 />

                    <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <View style={{ width: "50%", padding: 3 }}>
                      <Currency
                        showPlaceHolder={false}
                        title="Total Deduction Amount"
                        name="deductionAmount"
                        control={control}
                        noEditable
                        values={
                            params?.deductionAmount? params?.deductionAmount.toString() : ""
                        }
                      />
                    </View>
                    <VerticalSpace10 paddingTop={5} />
                    <View style={{ width: "50%", padding: 3 }}>
                      <Currency
                        showPlaceHolder={false}
                        title="Gross Amount"
                        name="grossAmount"
                        control={control}
                        noEditable
                        values={
                            params && params?.grossAmount ? params?.grossAmount.toString() : ""
                        }
                      />
                    </View>
                  </View>
                  <VerticalSpace10 />
                    <Currency
                        name="cash_discount_percentage"
                        title="Cash Discount %"
                        control={control}
                        placeholder="Cash Discount"
                        onInputChange={onCashDiscount}
                        edit={allowEdit}
                        values={ cashDiscountPercentage && cashDiscountPercentage.toString()}
                        percentage

                    />
                    <VerticalSpace10 />
                   
                    <Currency
                        name="cash_discount_amount"
                        control={control}
                        title="Cash Discount Amount"
                        placeholder="Cash Discount Amount"
                        noEditable
                        values={ Number.isNotNull(cashDiscountAmount ) ? cashDiscountAmount.toString() : (Number.isNotNull(params?.cashDiscountAmount)  ? params.cashDiscountAmount.toString() : '') }
                        />
                    <VerticalSpace10 />
                    <Currency
                        title="Net Amount"
                        name="net_amount"
                        control={control}
                        onInputChange={onNetAmountChange}
                        values={netAmount ? netAmount.toString() :params?.netAmount}
                        noEditable
                        required
                    />
                    <VerticalSpace10 />
                    <DatePicker
                        title="Due Date"
                        onDateSelect={onDueDateSelect}
                        disabled={allowEdit}
                        selectedDate={new Date(params?.due_date) ? selectedDueDate : selectedDueDate}
                    />

                    <VerticalSpace10 />
                    {params && (
                        <>
                            <VerticalSpace10 />
                            <StatusSelect
                                label={"GST Status"}
                                name="gst_status"
                                control={control}
                                placeholder={"Select Status"}
                                object={ObjectName.BILL_GST_STATUS}
                                currentStatusId={params?.gst_status_id}
                                onChange={(value) => onChangeGstStatus(value.value)}
                                disable={!allowEdit}
                            />
                            <VerticalSpace10 />

                            <UserSelect
                                label="Owner"
                                selectedUserId={params?.owner_id}
                                name={"owner"}
                                onChange={(value) => setSelectedUser(value.value)}
                                control={control}
                                placeholder="Select Owner"
                                disable={!allowEdit}


                            />
                            <VerticalSpace10 />
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
                            <VerticalSpace10 />
                        </>
                    )}
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
                        objectName={ObjectName.BILL}
                        objectId={params?.id}
                    />

                </ScrollView>
            )}
        </Layout>
    )
}
export default BillForm;