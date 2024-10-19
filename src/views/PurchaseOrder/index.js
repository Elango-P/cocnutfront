import React, { useEffect, useState, useCallback, useRef } from "react";
import {
    View, ScrollView, StyleSheet, TouchableOpacity, Text
} from "react-native";
import Layout from "../../components/Layout";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import apiClient from "../../apiClient";
import { endpoints } from "../../helper/ApiEndPoint";
import ShowMore from "../../components/ShowMore";
import Refresh from "../../components/Refresh";
import { SwipeListView } from "react-native-swipe-list-view";
import NoRecordFound from "../../components/NoRecordFound";
import DeleteConfirmationModal from "../../components/Modal/DeleteConfirmationModal";
import PermissionService from "../../services/PermissionService";
import Permission from "../../helper/Permission";
import AlternativeColor from "../../components/AlternativeBackground";
import { Color } from "../../helper/Color";
import DateTime from "../../lib/DateTime";
import ObjectName from "../../helper/ObjectName";
import style from "../../helper/Styles";
import FilterDrawer from "../../components/Filter";
import StatusService from "../../services/StatusServices";
import accountService from "../../services/AccountService";
import styles from "../../helper/Styles";
import purchaseOrderService from "../../services/PurchaseOrderService";
import PurchaseOrderCard from "./Components/PurchaseOrderCard";

const PurchaseOrder = () => {

    const [purchase, setPurchase] = useState([]);
    const isFocused = useIsFocused();
    const [isLoading, setIsLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [page, setPage] = useState(2);
    const [HasMore, setHasMore] = useState(true);
    const [purchaseDeleteModalOpen, setPurchaseDeleteModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState("");
    const [permission, setPermission] = useState("")
    const [addPermission, setAddPermission] = useState(false)
    const [openFilter, setOpenFilter] = useState(false);
    const [values, setValues] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedEndDate, setSelectedEndDate] = useState("");
    const [statusList, setStatusList] = useState();
    const [vendorList, setAccountList] = useState();

    const stateRef = useRef();


    useEffect(() => {
        let mount = true;
        mount && deletePermission()
        mount && GetPurchaseList(values);

        //cleanup function
        return () => {
            mount = false;
        };
    }, [isFocused]);
    useEffect(() => {   
        if(refreshing){
            GetPurchaseList(values);

        }
    }, [refreshing]);
    useEffect(() => {
        getStatusList();

        getAccountList();

    }, []);

    const deletePermission = async () => {
        const deletePermission = await PermissionService.hasPermission(Permission.PURCHASE_ORDER_DELETE);
        setPermission(deletePermission);
        const addPermission = await PermissionService.hasPermission(Permission.PURCHASE_ORDER_ADD)
        setAddPermission(addPermission)
    }
    const getStatusList = async () => {
        let status = [];
        const response = await StatusService.list(ObjectName.PURCHASE_ORDER);

        response && response.forEach((statusList) => {
            status.push({
                label: statusList.name,
                value: statusList.status_id,
                id: statusList.status_id
            });
        });

        setStatusList(status);
    }

    const getAccountList = () => {
        accountService.GetList((callback) => { setAccountList(callback) });

    }

    const GetPurchaseList = async (values) => {

        purchase && purchase.length == 0 && setIsLoading(true);

        let params = { sort: "id", sortDir: "DESC" }
        if (values?.status) {
            params.status = values.status
        }
        if (values?.account) {
            params.account = values?.account
        }
        if (values?.startDate) {
            params.startDate = DateTime.formatDate(values?.startDate)
        }
        if (values?.endDate) {
            params.endDate = DateTime.formatDate(values?.endDate)
        }

        await purchaseOrderService.search(params, response => {
            if (response) {
                setPurchase(response);
                setIsLoading(false);
                setRefreshing(false)
                setPage(2);

            }


        });
    };

    const LoadMoreList = async () => {
        try {
            setIsFetching(true);

            let params = { page: page }
            if (values?.status) {
                params.status = values.status
            }
            if (values?.account) {
                params.account = values?.account
            }
            if (values?.startDate) {
                params.startDate = DateTime.formatDate(values?.startDate)
            }
            if (values?.endDate) {
                params.endDate = DateTime.formatDate(values?.endDate)
            }

            purchaseOrderService.search(params, (response) => {

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

    const closeDrawer = () => {
        setOpenFilter(!openFilter);
    }
    const handleSubmit = () => {
        GetPurchaseList(values)
        closeDrawer()
    };

    const accountOnSelect = (value) => {
        if (value) {
            setValues((prevValues) => ({
                ...prevValues,
                account: value
            }));
        } else {
            setValues((prevValues) => ({
                ...prevValues,
                account: ""
            }));
        }

    }
    const statusOnSelect = (value) => {
        if (value) {
            setValues((prevValues) => ({
                ...prevValues,
                status: value
            }));
        } else {
            setValues((prevValues) => ({
                ...prevValues,
                status: ""
            }));
        }
    }
    const onDateSelect = (value) => {
        if (value) {
            setValues((prevValues) => ({
                ...prevValues,
                startDate: new Date(value)
            }));
            setSelectedDate(new Date(value));
        } else {
            setValues((prevValues) => ({
                ...prevValues,
                startDate: ""
            }));
            setSelectedDate("");
        }
    }
    const onEndDateSelect = (value) => {
        if (value) {
            setValues((prevValues) => ({
                ...prevValues,
                endDate: new Date(value)
            }));
            setSelectedEndDate(new Date(value));
        } else {
            setValues((prevValues) => ({
                ...prevValues,
                endDate: ""
            }));
            setSelectedEndDate("");
        }
    }
    const navigation = useNavigation();

    const onClickNew = () => {
        navigation.navigate("PurchaseOrderAdd")
    }

    const purchaseDelete = async () => {
        if (selectedItem) {
            purchaseOrderService.Delete(selectedItem.id, (error, response) => {
                GetPurchaseList()
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
    const purchaseDeleteModalToggle = () => {
        setPurchaseDeleteModalOpen(!purchaseDeleteModalOpen);
        clearRowDetail();
    }


    const renderHiddenItem = (data, rowMap) => {
        return (
            <View style={styles.swipeStyle}>
                <TouchableOpacity
                    style={styles.actionDeleteButton}
                    onPress={() => {
                        purchaseDeleteModalToggle()
                        setSelectedItem(data?.item);
                        stateRef.selectedItem = data?.item;
                        stateRef.selecredRowMap = rowMap;
                        closeRow(rowMap, data?.item.id);
                    }}
                >
                    <Text style={styles.btnText}>Delete</Text>
                </TouchableOpacity>
            </View>

        )
    };

    const renderItem = data => {
        let item = data?.item;
        let index = data?.index;
        const containerStyle = AlternativeColor.getBackgroundColor(index)
        return (
            <PurchaseOrderCard
                navigation={navigation}
                item={item}
                alternative={containerStyle}

            />

        );
    };

    return (
        <Layout title="Purchase Orders"
            isLoading={isLoading}
            refreshing={refreshing}
            addButton = {addPermission ? true : false}
            buttonOnPress={onClickNew}
            showFilter={true}
            onFilterPress={closeDrawer}
            showBackIcon={false}

        >
            <FilterDrawer
                values={values}
                isOpen={openFilter}
                closeDrawer={closeDrawer}
                accountOnSelect={accountOnSelect}
                statusOnSelect={statusOnSelect}
                onDateSelect={onDateSelect}
                onEndDateSelect={onEndDateSelect}
                selectedEndDate={selectedEndDate}
                selectedDate={selectedDate}
                statusList={statusList}
                vendorList={vendorList}
                showAccount
                showStatus
                showDate
                handleSubmit={handleSubmit} />
            <Refresh refreshing={refreshing} setRefreshing={setRefreshing}>

                <View>

                    <DeleteConfirmationModal
                        modalVisible={purchaseDeleteModalOpen}
                        toggle={purchaseDeleteModalToggle}
                        item={selectedItem}
                        updateAction={purchaseDelete}
                        
                        id={selectedItem?.id}

                    />


                    {purchase && purchase.length > 0 ?
                        <SwipeListView
                            data={purchase}
                            renderItem={renderItem}
                            renderHiddenItem={renderHiddenItem}
                            rightOpenValue={-70}
                            previewOpenValue={-40}
                            previewOpenDelay={3000}
                            disableRightSwipe={true}
                            disableLeftSwipe={permission ? false : true}
                            closeOnRowOpen={true}
                            keyExtractor={item => String(item.id)}
                        />

                        :
                        <NoRecordFound iconName={"receipt"} styles={style.noRecordfound} />
                    }


                    <ShowMore List={purchase} isFetching={isFetching} HasMore={HasMore} onPress={LoadMoreList} />
                </View>
            </Refresh>
        </Layout >
    )
}
export default PurchaseOrder;



