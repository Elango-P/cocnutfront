import React, { useState, useEffect, useRef } from "react";
import Layout from "../../components/Layout";
import { TouchableOpacity, StyleSheet, View, Button, Text, Image, ScrollView, Dimensions } from "react-native";
import DatePicker from "../../components/DatePicker";
import Currency from "../../components/Currency";
import { useIsFocused } from "@react-navigation/native";
import storeService from "../../services/StoreService";
import shiftService from "../../services/ShiftService";
import userService from "../../services/UserService";
import { useForm } from "react-hook-form";
import { useNavigation } from "@react-navigation/native";
import CurrenCy from "../../lib/Currency";
import Permission from "../../helper/Permission";
import TextField from "../../components/TextBox";
import DateTime from "../../lib/DateTime";
import { Sale } from "../../helper/Sale";
import * as ImagePicker from "expo-image-picker";
import mediaService from "../../services/MediaService";
import saleSettlementService from "../../services/SaleSettlementService";
import Spinner from "../../components/Spinner";
import PermissionService from "../../services/PermissionService";
import VerticalSpace10 from "../../components/VerticleSpace10";
import LocationSelect from "../../components/LocationSelect";
import UserSelect from "../../components/UserSelect"
import ShiftSelect from "../../components/ShiftSelect"
import TabName from '../../helper/Tab';
import Tab from "../../components/Tab";
import ObjectName from "../../helper/ObjectName";
import StatusSelect from "../../components/StatusSelect";
import Card from "../../components/Card";
import style from "../../helper/Styles";
import MediaVisible from "../../helper/MediaVisible";
import { MenuItem } from "react-native-material-menu";
import NoRecordFound from "../../components/NoRecordFound";
import DeleteConfirmationModal from "../../components/Modal/DeleteConfirmationModal";
import HistoryList from "../../components/HistoryList";
import Label from "../../components/Label";
import MediaUploadCard from "../../components/MediaUploadCard";


const SaleSettlementDetail = (props) => {
    let details = props?.route?.params.item;
    const [selectedDate, setSelectedDate] = useState();
    const [isLoading, setIsLoading] = useState(false);
    const [storeList, setStoreList] = useState([]);
    const [shiftList, setShiftList] = useState([]);
    const [userList, setuserList] = useState([]);
    const [amountCash, setAmountCash] = useState();
    const [amountUpi, setAmountUpi] = useState();
    const [totalAmount, setTotalAmount] = useState([""]);
    const [calculatedAmountCash, setCalculatedAmountCash] = useState();
    const [calculatedAmountUpi, setCalculatedAmountUpi] = useState();
    const [totalCalculatedAmount, setTotalCalculatedAmount] = useState([""]);
    const [receivedAmountCash, setReceivedAmountCash] = useState();
    const [receivedAmountUpi, setReceivedAmountUpi] = useState();
    const [totalReceivedAmount, setTotalReceivedAmount] = useState([""]);
    const [selectedStore, setSelectedStore] = useState("");
    const [selectedShift, setSelectedShift] = useState("");
    const [salesexecutive, setsalesExecutive] = useState("");
    const [notes, setNotes] = useState("");
    const [activeTab, setActiveTab] = useState(TabName.SUMMARY);
    const [MediaData, setMediaData] = useState([]);
    const [status, setStatus] = useState()
    const [actionList, setActionList] = useState([])
    const [allowEdit, setEdit] = useState(true);
    const [tab, setTab] = useState(TabName.VIDEO);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [selectedItem, setSelectedItem] = useState(details?.id || "");
    const [visible, setVisible] = useState(false)
    const [historyPermission, setHistoryPermission] = useState("")
    const [isSubmit,setIsSubmit] = useState(false)

    const navigation = useNavigation();

    const isFocused = useIsFocused();


    const renderIndicator = (currentIndex, allSize) => {
        return null;
    };

    const isVideoURL = (url) => {
        const videoExtensions = ['.mp4', '.avi', '.mov', '.mkv'];
        const fileExtension = url.slice(url.lastIndexOf('.')).toLowerCase();
        return videoExtensions.includes(fileExtension);
      };
      
      const videoItems = [];
      const imageItems = [];
      
      try {
        MediaData &&
          MediaData.length > 0 &&
          MediaData.forEach((item) => {
            if (isVideoURL(item.name)) {
              videoItems.push({ url: item.url, fileName: item.file_name});
            } else {
              imageItems.push({ url: item.url,fileName: item.file_name });
            }
          });
      } catch (error) {
        if (error instanceof TypeError) {
          imageItems.push({ url: error.item ? error.item.url : 'unknown' });
        } else {
          console.error('Unhandled error:', error);
        }
      }
      



    useEffect(() => {
        getStoreList();
        getShiftList();
        getSalesExecutiveList();
        getPermission();
    }, [isFocused]);

    useEffect(()=>{
        if(details?.id){
            getMediaList();
        }
    },[isFocused])

    useEffect(() => {
        getActionItems();
    }, [allowEdit])


    const getMediaList = async () => {
        await mediaService.search(details?.id, "SALE_SETTLEMENT", callback => setMediaData(callback?.data?.data))
    }

    const getPermission = async () => {
        const isExist = await PermissionService.hasPermission(Permission.SALE_SETTLEMENT_HISTORY_VIEW);
        setHistoryPermission(isExist)
    }


    const uploadImage = async (file, image) => {
        try {
            if (file) {
                const data = new FormData();
                let files = {
                    type: file?._data?.type,
                    size: file?._data.size,
                    uri: image,
                    name: file?._data.name,
                };
                data.append("media_file", files);
                data.append("media_name", file?._data.name);
                data.append("object", "SALE_SETTLEMENT");
                data.append("object_id", details?.id);
                data.append("media_url", image);
                data.append("media_visibility", MediaVisible.VISIBILITY_PRIVATE);
                data.append("feature", 1);

                let mediaObj = [{
                    url: image
                }];

                if (MediaData && MediaData.length > 0) {
                    let updatedMediaList = [...mediaObj, ...MediaData]
                    setMediaData(updatedMediaList);
                } else {
                    setMediaData(mediaObj)
                }


                await mediaService.uploadMedia(navigation, data, async (error, response) => {
                    if (response) {
                        getMediaList();
                        // addNewEntry()
                    }
                    if (error) setIsLoading(false)

                });
            }
        }
        catch (err) {
        }

    };

    const removeImage = (id) => {
        mediaService.deleteMedia(id, response => {
            getMediaList();
        });
    }


    const takePicture = async () => {

        let permission = await ImagePicker.requestCameraPermissionsAsync()

        let mediaPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permission && permission.status == 'granted' && mediaPermission && mediaPermission.status == 'granted') {
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 1,
            });


            if (result && result.assets && result.assets.length > 0 && result.assets[0].uri) {
                const response = await fetch(result.assets[0].uri);
                if (response) {
                    const blob = await response.blob();


                    if (!result.canceled) {
                        addNewEntry(blob, result.assets[0].uri);
                    }
                }
            }
        }
    }

    const addNewEntry = async (file, image) => {
        await uploadImage(file, image)
    }



    const getShiftList = () => {
        //create new rray
        let shiftListOption = new Array();

        shiftService.getShiftList(null, (error, response) => {
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
        })
    }



    const getSalesExecutiveList = () => {
        //create new rray
        let salesExecutiveList = new Array();
        userService.getSalesExecutiveList((error, response) => {
            let userList = response?.data?.data;
            if (userList && userList.length > 0) {
                for (let i = 0; i < userList.length; i++) {
                    let concatedName
                    if (userList[i].first_name && userList[i].last_name) {
                        concatedName = userList[i].first_name + " " + userList[i].last_name
                    } else if (userList[i].first_name) {
                        concatedName = userList[i].first_name;
                    } else if (userList[i].last_name) {
                        concatedName = userList[i].last_name;
                    }

                    salesExecutiveList.push({
                        label: (concatedName),
                        value: userList[i].id,
                    });
                }
            }
            setuserList(salesExecutiveList);
        })
    }


    const handleStoreOnchange = (data) => {
        setSelectedStore(data);
    };

    const handleShiftOnChange = (value) => {
        setSelectedShift(value.value)

    }

    const handleNotesOnChange = (value) => {
        setNotes(value)
    }

    const handleSalesExecutiveChange = (value) => {
        setsalesExecutive(value.value)
    }


    const handleStatusOnChange = async (value) => {
        setStatus(value)
    }

    const preloadedValues = {
        id: details?.id,
        date: details?.date ? details?.date : selectedDate ? selectedDate : new Date(),
        amount_cash: details?.amount_cash,
        amount_upi: amountUpi ? amountUpi : details?.amount_upi,
        total_amount: details?.total_amount,
        calculated_amount_cash: calculatedAmountCash ? calculatedAmountCash : details?.calculated_amount_cash,
        calculated_amount_upi: calculatedAmountUpi ? calculatedAmountUpi : details?.calculated_amount_upi,
        total_calculated_amount: details?.total_calculated_amount,
        cash_in_store: details?.cash_in_store,
        cash_to_office: details?.cash_to_office,
        discrepancy_amount_cash: discrepancyAmountCash ? discrepancyAmountCash : details?.discrepancy_amount_cash,
        discrepancy_amount_upi: discrepancyAmountUpi ? discrepancyAmountUpi : details?.discrepancy_amount_upi,
        notes: notes ? notes : details?.notes,
        productCount: details?.productCount,
        received_amount_cash: receivedAmountCash ? receivedAmountCash : details?.received_amount_cash,
        received_amount_upi: receivedAmountUpi ? receivedAmountUpi : details?.received_amount_upi,
        salesExecutive: salesexecutive ? salesexecutive : details?.sales_executive,
        shift: selectedShift ? selectedShift : details?.shiftId,
        storeId: selectedStore ? selectedStore : details?.storeId,
        status: status ? status : details?.statusId,
        type: "",
        total_received_amount: details?.total_received_amount,
        productCount: details?.product_count ? details?.product_count.toString() : " "
    };
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: preloadedValues,
    });

    const getStoreList = () => {
        storeService.list({},(error, response) => {
            const storeListOption = new Array();
            let storeList = response?.data?.data;
            if (storeList && storeList.length > 0) {
                for (let i = 0; i < storeList.length; i++) {
                    storeListOption.push({
                        label: storeList[i].name,
                        value: storeList[i].id,
                    });
                }

                setStoreList(storeListOption);
            }

        });
    }

    const UpdateSaleSettlement = (values) => {
        setIsSubmit(true)

        const updateData = {
            
            id: details.id,
            date: selectedDate !== undefined && selectedDate,
            amount_cash: amountCash ? amountCash : details.amount_cash,
            amount_upi: amountUpi ? amountUpi : details.amount_upi,
            total_amount: CurrenCy.Get(amountCash) + CurrenCy.Get(amountUpi) ? CurrenCy.Get(amountCash) + CurrenCy.Get(amountUpi) : CurrenCy.Get(details.amount_cash) + CurrenCy.Get(details.amount),
            calculated_amount_cash: calculatedAmountCash ? calculatedAmountCash : details.calculated_amount_cash ? calculatedAmountCash ? calculatedAmountCash : details.calculated_amount_cash : 0,
            total_calculated_amount: totalCalculatedAmount ? totalCalculatedAmount : details.total_calculated_amount,
            calculated_amount_upi: calculatedAmountUpi ? calculatedAmountUpi : details.calculated_amount_upi ? calculatedAmountUpi ? calculatedAmountUpi : details.calculated_amount_upi : 0,
            cash_in_store: values?.cash_in_store ? values?.cash_in_store : details?.cash_in_store,
            cash_to_office: values.cash_to_office ? values.cash_to_office : details?.cash_to_office,
            discrepancy_amount_cash: discrepancyAmountCash ? discrepancyAmountCash : details.discrepancy_amount_cash ? discrepancyAmountCash ? discrepancyAmountCash : details.discrepancy_amount_cash : 0,
            discrepancy_amount_upi: discrepancyAmountUpi ? discrepancyAmountUpi : details.discrepancy_amount_upi ? discrepancyAmountUpi ? discrepancyAmountUpi : details.discrepancy_amount_upi : 0,
            notes: notes ? notes : details.notes,
            received_amount_cash: receivedAmountCash ? receivedAmountCash : details.received_amount_cash ? receivedAmountCash ? receivedAmountCash : details.received_amount_cash : 0,
            received_amount_upi: receivedAmountUpi ? receivedAmountUpi : details.received_amount_upi ? receivedAmountUpi ? receivedAmountUpi : details.received_amount_upi : 0,
            total_received_amount: totalReceivedAmount ? totalReceivedAmount : details.total_received_amount,
            salesExecutive:  salesexecutive &&  salesexecutive ,
            shift: selectedShift && selectedShift ,
            storeId:  selectedStore && selectedStore,
            status: status && status,
            type: "",
        };
              
        saleSettlementService.update(details?.id, updateData, (response) => {
            
            if(response && response?.data){
                setIsSubmit(false)
                navigation.navigate("SalesSettlement")

            }else{
                setIsSubmit(false)
            }
        })
    }

    const completeSaleSettlement = async () => {
        await saleSettlementService.updateStatus(details?.id, { status: Sale.STATUS_COMPLETE }, callback => {
        });
        navigation.navigate("SalesSettlement");
    };
    const reviewSaleSettlement = async () => {
        await saleSettlementService.updateStatus(details?.id, { status: Sale.STATUS_REVIEW }, callback => {
        });
        navigation.navigate("SalesSettlement");
    }


    const onDateSelect = (date) => {
        //update the selected date
        setSelectedDate(new Date(date));
    }


    const onCashChange = (value) => {
        const cashAmount = value;

        setAmountCash(value)
        if (cashAmount) {
            let totalAmounts = CurrenCy.Get(cashAmount) + CurrenCy.Get(amountUpi)
            setTotalAmount(totalAmounts || "")
        }
        setAmountCash(cashAmount)
    };

    const onUpiChange = (value) => {
        const upiAmount = value;

        if (upiAmount) {
            let total_amount = CurrenCy.Get(amountCash) + CurrenCy.Get(upiAmount)

            setTotalAmount(total_amount || "")
        }
        setAmountUpi(upiAmount)
    };

    const onCalculatedCashChange = (value) => {
        const calculatedCashAmount = value;

        setCalculatedAmountCash(value)
        if (calculatedCashAmount) {
            let totalAmounts = CurrenCy.Get(calculatedCashAmount) + CurrenCy.Get(calculatedAmountUpi)
            setTotalCalculatedAmount(totalAmounts || "")
        }
        setCalculatedAmountCash(calculatedCashAmount)
    };

    const onCalculatedUpiChange = (value) => {
        const calculatedUpiAmount = value;

        if (calculatedUpiAmount) {
            let total_amount = CurrenCy.Get(calculatedAmountCash) + CurrenCy.Get(calculatedUpiAmount)

            setTotalCalculatedAmount(total_amount || "")
        }
        setCalculatedAmountUpi(calculatedUpiAmount)
    };

    const onReceivedCashChange = (value) => {
        const receivedCashAmount = value;

        if (receivedCashAmount) {
            let totalAmounts = CurrenCy.Get(receivedCashAmount) + CurrenCy.Get(receivedAmountUpi)
            setTotalReceivedAmount(totalAmounts || "")
        }
        setReceivedAmountCash(receivedCashAmount)
    };

    const onReceivedUpiChange = (value) => {
        const receivedAmountUpi = value;

        if (receivedAmountUpi) {
            let total_amount = CurrenCy.Get(receivedAmountCash) + CurrenCy.Get(receivedAmountUpi)

            setTotalReceivedAmount(total_amount || "")
        }
        setReceivedAmountUpi(receivedAmountUpi)
    };

    const discrepancyAmountCash = CurrenCy.Get(amountCash ? amountCash : details?.amount_cash) - CurrenCy.Get(receivedAmountCash ? receivedAmountCash : details?.received_amount_cash)
    const discrepancyAmountUpi = CurrenCy.Get(amountUpi ? amountUpi : details?.amount_upi) - CurrenCy.Get(receivedAmountUpi ? receivedAmountUpi : details?.received_amount_upi)
    const totalDiscrepancy = CurrenCy.Get(discrepancyAmountCash) + CurrenCy.Get(discrepancyAmountUpi)

    if (isLoading) {
        return <Spinner />;
    }
    const getActionItems = async () => {
        let actionItems = new Array();

        const editPermission = await PermissionService.hasPermission(
            Permission.SALE_SETTLEMENT_EDIT
        );
        const salesSettlementDeletePermission = await PermissionService.hasPermission(
            Permission.SALE_SETTLEMENT_DELETE
        );
        if (editPermission && !allowEdit) {
            actionItems.push(
                <MenuItem onPress={() => {setEdit(true),setVisible(true)}}>
                    Edit
                </MenuItem>
            )
        }
        if (salesSettlementDeletePermission) {
            actionItems.push(
                <MenuItem onPress={() => {setDeleteModalOpen(true),setVisible(true)}}>
                    Delete
                </MenuItem>
            )
        }

        setActionList(actionItems)
    }
    const deleteModalToggle = () => {
        setDeleteModalOpen(!deleteModalOpen);
    }
    const SalesSettlementDelete = async () => {
        if (selectedItem) {
            saleSettlementService.delete(selectedItem, (error, response) => {
                navigation.navigate("SalesSettlement");
            })
        }
    };

    let title =  [
        {
            title: TabName.SUMMARY,
            tabName: TabName.SUMMARY
        },
        {
            title: TabName.ATTACHMENTS,
            tabName: TabName.ATTACHMENTS
        },
      
    ]
    if(historyPermission){
        title.push({
            title: TabName.HISTORY,
            tabName: TabName.HISTORY
        })
    }

    return (
        <Layout
            title={`Sales Settlement#: ${details?.saleSettlementNumber}`}
            showBackIcon={true}
            backButtonNavigationUrl={"SalesSettlement"}
            buttonOnPress={activeTab === TabName.ATTACHMENTS ? (e) => takePicture(e) : handleSubmit(values => { UpdateSaleSettlement(values); })}
            buttonLabel={activeTab === TabName.ATTACHMENTS ? "Upload" : allowEdit ? "Save" : ""}
            actionItems={actionList}
            closeModal={visible}
            showActionMenu={activeTab === TabName.SUMMARY && actionList && actionList.length > 0 ? true : false}
            isSubmit = {isSubmit}
        >
            <DeleteConfirmationModal
                modalVisible={deleteModalOpen}
                toggle={deleteModalToggle}
                item={selectedItem}
                updateAction={SalesSettlementDelete}
                id={selectedItem}

            />
            <View style={style.tabBar}>
                <Tab
                    title={title}
                    setActiveTab={setActiveTab}
                    defaultTab={activeTab}
                />
            </View>
            {activeTab === TabName.SUMMARY && (
                <>
                    <ScrollView
                        keyboardShouldPersistTaps="handled"
                    >

                        <VerticalSpace10 />

                        <Card>
                            <VerticalSpace10 />


                            <DatePicker
                                title="Date"
                                onDateSelect={onDateSelect}
                                disabled={allowEdit}
                                selectedDate={selectedDate ? selectedDate : DateTime.getDate(details.date)}/>
                            <VerticalSpace10 />
                            <ShiftSelect
                                options={shiftList}
                                label={"Shift"}
                                name={"shift"}
                                data={details?.shiftId ? details?.shiftId : selectedShift}
                                disableSearch
                                disable={!allowEdit}
                                placeholder={"Select Shift"}
                                onChange={handleShiftOnChange}
                                control={control} />
                            <VerticalSpace10 />

                            <StatusSelect
                                label={"Status"}
                                name={"status"}
                                onChange={handleStatusOnChange}
                                object={ObjectName.SALE_SETTLEMENT}
                                control={control}
                                disable={!allowEdit}
                                placeholder={"Select Status"}
                                data={details?.statusId ? Number(details?.statusId) : status}
                                currentStatusId={details?.statusId}
                            />
                        </Card>
                        <VerticalSpace10 />
                        <Card>
                            <VerticalSpace10 />

                            <LocationSelect
                                options={storeList}
                                label={"Location"}
                                name={"storeId"}
                                disable={!allowEdit}
                                data={details?.storeId ? details?.storeId : selectedStore}
                                placeholder={"Select Location"}
                                onChange={handleStoreOnchange}
                                control={control} />



                            <VerticalSpace10 />

                            <UserSelect
                                options={userList}
                                label={"StoreExecutive"}
                                name={"salesExecutive"}
                                selectedUserId={details?.sales_executive ? details?.sales_executive : salesexecutive}
                                placeholder={"Select StoreExecutive"}
                                disable={!allowEdit}
                                userCard
                                onChange={handleSalesExecutiveChange}
                                control={control} />
                        </Card>
                        <VerticalSpace10 />



                        <Card>
                            <VerticalSpace10 />


                            <Currency
                                title={"Amount Cash"}
                                name="amount_cash"
                                control={control}
                                placeholder="Amount Cash"
                                edit={allowEdit}
                                onInputChange={onCashChange} />


                            <VerticalSpace10 />

                            <Currency
                                title={"Amount UPI"}
                                name="amount_upi"
                                control={control}
                                placeholder="Amount UPI"
                                edit={allowEdit}
                                onInputChange={onUpiChange} />

                            <VerticalSpace10 />


                            <Currency
                                title={"Total Amount"}
                                name="total_amount"
                                control={control}
                                placeholder="Total Amount"
                                values={totalAmount.toString()}
                                noEditable />
                            <VerticalSpace10 />
                            <View style={style.direction}>
                                <View style={style.fieldWidth}>
                                    <Currency
                                        name="cash_in_store"
                                        title={"Cash In store"}
                                        control={control}
                                        placeholder="Cash In store"
                                        edit={allowEdit}
                                    />
                                </View>

                                <View style={[style.fieldWidth, { marginLeft: 10 }]}>
                                    <Currency
                                        name="cash_to_office"
                                        title={"Cash To Office"}
                                        control={control}
                                        placeholder="Cash To Office"
                                        edit={allowEdit}
                                    />
                                </View>
                            </View>


                        </Card>

                        <VerticalSpace10 />
                        <Card title="Order Amount">
                            <VerticalSpace10 />


                            <Currency
                                title={"Order Amount(Cash)"}
                                name="order_cash_amount"
                                control={control}
                                placeholder=" Order Amount(Cash)"
                                values={details?.order_cash_amount}
                                noEditable

                            />
                            <VerticalSpace10 />
                            <Currency
                                title={"Order Amount(Upi)"}
                                name="order_upi_amount"
                                control={control}
                                placeholder=" Order Amopiunt(Cash)"
                                values={details?.order_upi_amount}
                                noEditable

                            />
                             <VerticalSpace10 />
                            <Currency
                                title={"Order Amount(Draft)"}
                                name="draft_order_amount"
                                control={control}
                                placeholder="Draft Amount"
                                values={details?.draft_order_amount}
                                noEditable

                            />


                            <VerticalSpace10 />

                            <Currency
                                title={"Order Total Amount"}
                                name="order_total_amount"
                                control={control}
                                placeholder="Order Total Amount"
                                values={details?.order_total_amount}
                                noEditable />
                        </Card>
                        <VerticalSpace10 />
                        <Card title="Received">
                            <VerticalSpace10 />



                            <Currency
                                title={"Received Amount Cash"}
                                name="received_amount_cash"
                                control={control}
                                placeholder=" Received Amount Cash"
                                onInputChange={onReceivedCashChange}
                                edit={allowEdit}

                            />
                            <VerticalSpace10 />

                            <Currency
                                title={"Received Amount UPI"}
                                name="received_amount_upi"
                                control={control}
                                placeholder="Recieved Amount UPI"
                                onInputChange={onReceivedUpiChange}
                                edit={allowEdit}

                            />

                            <VerticalSpace10 />


                            <Currency
                                title={"Total Received Amount"}
                                name="total_received_amount"
                                control={control}
                                placeholder="Total Received Amount"
                                values={totalReceivedAmount.toString()}
                                noEditable />
                            <VerticalSpace10 />



                            <Currency
                                name="discrepancy_amount_cash"
                                title={"Discrepancy Amount Cash"}
                                control={control}
                                placeholder="Discrepancy Amount Cash"
                                values={discrepancyAmountCash.toString()}
                                noEditable />
                            <VerticalSpace10 />

                            <Currency
                                name="discrepancy_amount_upi"
                                title={"Discrepancy Amount UPI"}
                                control={control}
                                placeholder="Discrepancy Amount UPI"
                                values={discrepancyAmountUpi.toString()}
                                noEditable />


                            <VerticalSpace10 />

                            <Currency
                                name="total_discrepancy_amount"
                                title={"Total Discrepancy Amount"}
                                control={control}
                                placeholder="Total Discrepancy Amount"
                                values={totalDiscrepancy.toString()}
                                noEditable />
                        </Card>
                        <VerticalSpace10 />
                        <Card title="Calculated">
                            <VerticalSpace10 />


                            <Currency
                                title={"Calculated Amount Cash"}
                                name="calculated_amount_cash"
                                control={control}
                                placeholder=" Calculated Amount Cash"
                                values={calculatedAmountCash ? calculatedAmountCash : details?.calculated_amount_cash}
                                onInputChange={onCalculatedCashChange}
                                edit={allowEdit}

                            />
                            <VerticalSpace10 />
                            <Currency
                                title={"Calculated Amount UPI"}
                                name="calculated_amount_upi"
                                control={control}
                                placeholder="Calculated Amount UPI"
                                onInputChange={onCalculatedUpiChange}
                                edit={allowEdit}

                            />

                            <VerticalSpace10 />

                            <Currency
                                title={"Total Calculated Amount"}
                                name="total_calculated_amount"
                                control={control}
                                placeholder="Total Calculated Amount"
                                values={totalCalculatedAmount.toString()}
                                noEditable />
                        </Card>
                        <VerticalSpace10 />
                        <Card>
                            <VerticalSpace10 />
                            <TextField
                                name="notes"
                                placeholder="Notes"
                                title="Notes"
                                control={control}
                                onInputChange={handleNotesOnChange}
                                values={details?.notes}
                                editable={allowEdit}

                            />
                        </Card>
                    </ScrollView>

                </>

            )}

{activeTab === TabName.ATTACHMENTS && (
    <View style={{ flex: 1 }}>
        {MediaData && MediaData.length < 1 && (
          <NoRecordFound iconName="receipt" />
        )}
        <Label
          size={14}
          bold
          text={`Sales Report${
            imageItems && imageItems.length > 0
              ? ` (${imageItems.length}):`
              : ""
          }`}
        />
        {imageItems && imageItems.length>0 ?(
        <View style={{ flex: 0.5,alignItems: "center" }}>
          <MediaUploadCard
            mediaData={imageItems}
            swipeContent={2}
            customSwiperHeight
            showDelete
            readOnly

          />
        </View>):( <NoRecordFound paddingVertical={100} iconName="receipt" />)}

      {/* Bottom Section: PayTm Video */}
        <Text style={{ fontWeight: "bold" }}></Text>
        <Label
          size={14}
          bold
          text={`PayTm Video${
            videoItems && videoItems.length > 0
              ? ` (${videoItems.length}):`
              : ""
          }`}
        />
          {videoItems && videoItems.length>0 ?(
        <View style={{ flex: 0.8, top:10,alignItems: "center" }}>
          <MediaUploadCard
            mediaData={videoItems}
            swipeContent={2}
            customSwiperHeight
            showDelete
          />
        </View>):( <NoRecordFound paddingVertical={100}iconName="receipt" />)}
      </View>
  )}
            {activeTab === TabName.HISTORY && (
                <ScrollView>
                    <HistoryList
                        objectName={ObjectName.SALE_SETTLEMENT}
                        objectId={details?.id}
                    />

                </ScrollView>
            )}


        </Layout>
    );
};
export default SaleSettlementDetail;


