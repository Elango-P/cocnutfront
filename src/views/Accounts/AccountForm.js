import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ScrollView, View } from "react-native";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { MenuItem } from "react-native-material-menu";

// Components
import Layout from "../../components/Layout";
import Select from "../../components/Select";
import TextInput from "../../components/TextInput";
import TextArea from "../../components/TextArea";
import Currency from "../../components/Currency";
import Tab from "../../components/Tab";
import Name from "../../components/Name";
import AlternativeColor from "../../components/AlternativeBackground";
import PurchaseCard from "../Purchase/components/PurchaseCard";
import Refresh from "../../components/Refresh";
import NoRecordFound from "../../components/NoRecordFound";
import ShowMore from "../../components/ShowMore";
import PhoneNumber from "../../components/PhoneNumber";
import DeleteConfirmationModal from "../../components/Modal/DeleteConfirmationModal";
import PaymentAccountSelect from "../../components/PaymentAccountSelect";
import VerticalSpace10 from "../../components/VerticleSpace10";

// Service
import PermissionService from "../../services/PermissionService";
import purchaseService from "../../services/PurchaseService";
import accountService from "../../services/AccountService";

// Helpers
import { Account } from "../../helper/Account";
import Status from "../../helper/Status";
import Permission from "../../helper/Permission";
import styles from "../../helper/Styles";
import TabName from '../../helper/Tab';
import AccountTypeSelect from "../../components/AccountTypeSelect";
import AccountTypeService from "../../services/AccountTypeService";
import HistoryList from "../../components/HistoryList";
import ObjectName from "../../helper/ObjectName";


const AccountForm = (props) => {
    const params = props?.route?.params?.item
    const redirectionUrl = props?.route?.params && props?.route?.params?.redirectionUrl
    const id = params?.id
    const [vendorList, setVendorList] = useState();
    const isFocused = useIsFocused();
    const [accountName, setAccountName] = useState("");
    const [type, setType] = useState(params?.typeId || "");
    const [status, setStatus] = useState(params?.statusId || "");

    const [notes, setNotes] = useState(params?.notesText || "");
    const [payment, setPayment] = useState(params?.payment_terms || "");
    const [returnTerm, setReturnTerm] = useState(params?.return_terms || "");
    const [cash, setCash] = useState(params?.cash_discount || "");
    const [paymentAccount, setPaymentAccount] = useState(params?.payment_account || "");
    const [allowEdit, setEdit] = useState(false)
    const [actionList, setActionList] = useState([])
    const [activeTab, setActiveTab] = useState(TabName.SUMMARY);
    const [purchase, setPurchase] = useState();
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(2);
    const [HasMore, setHasMore] = useState(true);
    const [isFetching, setIsFetching] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState(params?.mobile_number || "")
    const [visible, setVisible] = useState(false)
    const [accountDeleteModalOpen, setAccountDeleteModalOpen] = useState("")
    const [selectedItem, setSelectedItem] = useState(params?.id || "");
    const [category, setCategory] = useState();
    const [accountHistoryViewPermission, setAccountHistoryViewPermission] = useState("")
    const [isSubmit, setIsSubmit] = useState(false)

    const navigation = useNavigation();

    useEffect(() => {
        GetPurchaseList();
        getAccountPermission()
        getList()
    }, []);

    useEffect(() => {
        getActionItems();
    }, [allowEdit]);

    useEffect(() => {
        let mount = true;
        mount && accountService.GetList(null, (callback) => { setVendorList(callback) })
        //cleanup function
        return () => {
            mount = false;
        };
    }, [isFocused]);

    const preloadedValues = {
        notes: params?.notesText && Array.isArray(params?.notesText) ? params?.notesText.join() : params?.notesText,
        vendor_url: params?.vendorUrl,
        gst_number: params?.gst_number,
        status: params?.statusId,
        vendor_name: params?.vendorName,
        type: params?.typeId,
        payment_account: params?.payment_account ? params?.payment_account : paymentAccount,
        mobile: params?.mobile_number,
        status: params?.statusId
    }

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: preloadedValues
    });

    const handlePhoneNumberChange = (value) => {
        setPhoneNumber(value);
    };
    const getList = async () => {
        try {
            AccountTypeService.list({}, (response) => {
                const filteredList = response.filter(data => data.id == params?.typeId);
                const category = filteredList.map(category => category.category);
                setCategory(category[0]);
            });
        } catch (err) {
            console.log(err);
        }
    };
    const getAccountPermission = async () => {
        const accountHistoryViewPermission = await PermissionService.hasPermission(Permission.ACCOUNT_HISTORY_VIEW)
        setAccountHistoryViewPermission(accountHistoryViewPermission)
    }

    const typeOnSelect = (value) => {
        setType(value);
        setCategory(value && value.category)
    };

    const statusOnSelect = (value) => {
        setStatus(value);
    };

    const onNotesChange = (value) => {
        setNotes(value)
    };

    const onPaymentChange = (value) => {
        setPayment(value)
    }
    const onPaymentAccountChange = (value) => {
        setPaymentAccount(value)
    }
    const onReturnChange = (value) => {

        setReturnTerm(value)

    }
    const onCashDiscount = (value) => {
        setCash(value)
    }

    const AccountDeleteModalToggle = () => {
        setAccountDeleteModalOpen(!accountDeleteModalOpen);
    }

    const typeOption = [
        {
            value: Account.TYPE_CUSTOMER,
            label: Account.ACCOUNT_CUSTOMER_TEXT,
        },
        {
            value: Account.TYPE_EMPLOYEE,
            label: Account.ACCOUNT_EMPLOYEE_TEXT,
        },
        {
            value: Account.TYPE_VENDOR,
            label: Account.ACCOUNT_VENDOR_TEXT,
        },
    ];

    const Options = [
        {
            value: Status.ACTIVE,
            label: Status.ACTIVE_TEXT,
        },
        {
            value: Status.INACTIVE,
            label: Status.INACTIVE_TEXT,
        }
    ]
    const updateAccount = async (values) => {
        setIsSubmit(true)
        const updateData = {
            vendor_name: values?.vendor_name,
            type: values?.type?.value ? values?.type?.value : params?.typeId,
            notes: values.notes,
            mobile: values?.mobile,
            status: status === Status.ACTIVE ? Status.ACTIVE : status === Status.INACTIVE ? Status.INACTIVE : params?.statusId,
            gst_number: values?.gst_number,
            payment_account: values?.payment_account?.value ? values?.payment_account.value : values?.payment_account ? values?.payment_account : params?.payment_account,
            vendor_url: values && values?.vendor_url,
            payment_terms: values && values?.payment_terms ? values?.payment_terms : params?.payment_terms,
            return_terms: values && values?.return_terms ? values?.return_terms : params?.return_terms,
            cash_discount: values?.cash_discount_percentage ? values?.cash_discount_percentage : cash ? cash : null,
        }
        await accountService.update(id, updateData, async (err, response) => {
            if (response) {
                setIsSubmit(false)
                redirectionUrl ? navigation.navigate(redirectionUrl) : navigation.navigate("Accounts")
            } else {
                setIsSubmit(false)
            }

        })
    }

    const getActionItems = async () => {
        let actionItems = new Array();
        const editPermission = await PermissionService.hasPermission(
            Permission.ACCOUNT_EDIT
        );
        const deletePermission = await PermissionService.hasPermission(
            Permission.ACCOUNT_DELETE
        );
        if (editPermission && !allowEdit) {
            actionItems.push(
                <MenuItem onPress={() => { setEdit(true), setVisible(true) }}>
                    Edit
                </MenuItem>
            )
        }
        if (deletePermission) {
            actionItems.push(
                <MenuItem onPress={() => {
                    setAccountDeleteModalOpen(true),
                        setVisible(true)
                }
                }>
                    Delete
                </MenuItem>
            )
        }
        setActionList(actionItems)
    }

    const GetPurchaseList = async (values) => {

        setIsLoading(true);
        let param = { vendor: params?.id, sort: "purchase_date", sortDir: "DESC" }
        await purchaseService.search(param, response => {
            if (response) {
                setPurchase(response);
                setIsLoading(false);
                setPage(2);

            }


        });
    };

    const accountDelete = async () => {
        if (selectedItem) {
            accountService.delete(selectedItem, (response) => {
                if (response) {
                    navigation.navigate("Accounts")
                }
            })
        }
    };

    const LoadMoreList = async () => {
        try {
            setIsFetching(true);

            let params = { page: page }

            purchaseService.search(params, (response) => {

                let purchase = response

                // Set response in state
                setPurchase((prevTitles) => {
                    return [...new Set([...prevTitles, ...purchase])];
                });
                setPage((prevPageNumber) => prevPageNumber + 1);
                setHasMore(purchase.length > 0);
                setIsFetching(false);
            });
        } catch (err) {
            console.log(err);
            setIsLoading(false);
        }
    };

    let title =
        [
            {
                title: TabName.SUMMARY,
                tabName: TabName.SUMMARY
            }
        ]
    if (category === Account.ACCOUNT_CATEGORY_VENDOR) {
        title.push({
            title: TabName.PURCHASES,
            tabName: TabName.PURCHASES
        })
    }

    if (accountHistoryViewPermission) {
        title.push({
            title: TabName.HISTORY,
            tabName: TabName.HISTORY
        })
    }




    return (
        <Layout
            title={params ? `Accounts#: ${params?.id}` : "Account"}
            showBackIcon
            buttonLabel={activeTab === TabName.SUMMARY && allowEdit ? "Save" : !params ? "Save" : ""}
            buttonOnPress={handleSubmit(values => { updateAccount(values); })}
            showActionMenu={activeTab === TabName.SUMMARY && params && !allowEdit && actionList && actionList.length > 0 ? true : false}
            actionItems={actionList}
            isLoading={isLoading}
            refreshing={refreshing}
            closeModal={visible}
            isSubmit={isSubmit}

        >
            <DeleteConfirmationModal
                modalVisible={accountDeleteModalOpen}
                toggle={AccountDeleteModalToggle}
                item={selectedItem}
                updateAction={accountDelete}
                name={params && params?.vendorName}
            />
            {params && (
                <View style={styles.tabBar}>
                    <>
                        <Tab
                            title={title}
                            setActiveTab={setActiveTab}
                            defaultTab={activeTab}
                        />
                    </>
                </View>
            )}
            {activeTab === TabName.SUMMARY && (
                <ScrollView>
                    <VerticalSpace10 />
                    <Name
                        title={"Name"}
                        name="vendor_name"
                        control={control}
                        required={true}
                        editable={allowEdit}
                    />

                    <VerticalSpace10 />
                    <AccountTypeSelect
                        label={"Type"}
                        name="type"
                        control={control}
                        showBorder={true}
                        placeholder={"Select Type"}
                        onChange={typeOnSelect}
                        disable={!allowEdit}
                    />

                    <VerticalSpace10 />


                    <Select
                        label={"Status"}
                        name="status"
                        control={control}
                        options={Options}
                        showBorder={true}
                        placeholder={"Select Status"}
                        OnSelect={statusOnSelect}
                        disable={!allowEdit}

                    />

                    <VerticalSpace10 />
                    <TextInput
                        title="Website"
                        name="vendor_url"
                        control={control}
                        editable={allowEdit}
                    />
                    <VerticalSpace10 />
                    {category === Account.ACCOUNT_CATEGORY_CUSTOMER && (
                        <>
                            <TextInput
                                title="GST Number"
                                name="gst_number"
                                control={control}
                                editable={allowEdit}


                            />
                            <VerticalSpace10 />
                            <PhoneNumber
                                title="Phone Number"
                                name="mobile"
                                control={control}
                                required
                                values={phoneNumber}
                                onInputChange={handlePhoneNumberChange}
                                editable={allowEdit}
                            />
                        </>
                    )}
                    {category == Account.ACCOUNT_CATEGORY_VENDOR && (
                        <>
                            <PaymentAccountSelect
                                control={control}
                                name="payment_account"
                                label="Payment Account"
                                placeholder={"Select Payment Account"}
                                onChange={onPaymentAccountChange}
                                disable={!allowEdit}

                            />
                            <VerticalSpace10 />
                            <Currency
                                name="cash_discount_percentage"
                                title="Cash Discount %"
                                control={control}
                                placeholder="Cash Discount"
                                onInputChange={onCashDiscount}
                                edit={allowEdit}
                                values={cash.toString()}
                                percentage

                            />
                            <VerticalSpace10 />

                            <TextArea
                                name="payment_terms"
                                title="Payment Terms"
                                control={control}
                                values={payment}
                                onInputChange={onPaymentChange}
                                editable={allowEdit}

                            />
                            <VerticalSpace10 />

                            <TextArea
                                name="return_terms"
                                title="Return Terms"
                                control={control}
                                values={returnTerm}
                                onInputChange={onReturnChange}
                                editable={allowEdit}
                            />
                            <VerticalSpace10 />
                        </>
                    )}

                    <TextArea
                        name="notes"
                        title="Notes"
                        control={control}
                        values={notes}
                        onInputChange={onNotesChange}
                        editable={allowEdit}

                    />
                </ScrollView>
            )}
            <Refresh refreshing={refreshing} setRefreshing={setRefreshing}>
                <View>
                    {activeTab === TabName.PURCHASES && purchase && purchase.length > 0 ? (
                        purchase.map((item, index) => {
                            const containerStyle = AlternativeColor.getBackgroundColor(index);

                            return (
                                <PurchaseCard
                                    navigation={navigation}
                                    item={item}
                                    alternative={containerStyle}
                                    key={index}
                                />
                            );
                        })
                    ) : (
                        activeTab === TabName.PURCHASES && (
                            <>
                                <NoRecordFound iconName={"receipt"} styles={styles.noRecordfound} />
                            </>
                        )
                    )}

                    {activeTab === TabName.PURCHASES && (
                        <ShowMore List={purchase} isFetching={isFetching} HasMore={HasMore} onPress={LoadMoreList} />
                    )
                    }
                </View>
                {activeTab === TabName.HISTORY && (
                    <ScrollView>
                        <HistoryList
                            objectName={ObjectName.ACCOUNT}
                            objectId={id}
                        />

                    </ScrollView>
                )}

            </Refresh>


        </Layout>
    )
}
export default AccountForm;