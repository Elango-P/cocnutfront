// Import React and Component
import { useIsFocused } from "@react-navigation/native";
import React, { useEffect, useState, useRef } from "react";
import {
    Keyboard,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import AlternativeColor from "../../components/AlternativeBackground";
import Layout from "../../components/Layout";
import NoRecordFound from "../../components/NoRecordFound";
import Refresh from "../../components/Refresh";
import { Color } from "../../helper/Color";
import PaymentService from "../../services/PaymentService";
import PaymentCard from "./PaymentCard";
import DeleteConfirmationModal from "../../components/Modal/DeleteConfirmationModal";
import { SwipeListView } from "react-native-swipe-list-view";
import ShowMore from "../../components/ShowMore";
import StatusService from "../../services/StatusServices";
import ObjectName from "../../helper/ObjectName";
import accountService from "../../services/AccountService";
import FilterDrawer from "../../components/Filter";
import PaymentAccountService from "../../services/PaymentAccountService";
import userService from "../../services/UserService";
import DateTime from "../../lib/DateTime";
import Permission from "../../helper/Permission";
import PermissionService from "../../services/PermissionService";
import styles from "../../helper/Styles";





const Payments = (props) => {
    const [paymentList, setPaymentList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [permission, setPermission] = useState("")
    const [refreshing, setRefreshing] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false)
    const [selectedItem, setSelectedItem] = useState("");
    const [isFetching, setIsFetching] = useState(false);
    const [values,setValues] = useState("");
    const [statusList, setStatusList] = useState();
    const [vendorList, setVendorList] = useState();
    const [paymentAccountList, setPaymentAccountList] = useState();
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedEndDate, setSelectedEndDate] = useState("");
    const [openFilter, setOpenFilter] = useState(false);
    const [addPermission, setAddPermission] = useState(false);


    //setting tha initial page
    const [page, setPage] = useState(2);
    //we need to know if there is more data
    const [HasMore, setHasMore] = useState(true);
    const isFocused = useIsFocused();
    const stateRef = useRef();

    useEffect(() => {
        let mount = true;
        mount && getPaymentsList(values);

        getPermission();

        return () => {
            mount = false;
        };
    }, [isFocused]);
    useEffect(() => {
        if(refreshing){
            getPaymentsList(values);

        }
    }, [refreshing]);

    useEffect(()=>{
        getStatusList();
        getAccountList();
        getPaymentAccount();
    },[])


    const getPermission = async () => {

        const permission = await PermissionService.hasPermission(Permission.PAYMENT_ADD);

        setAddPermission(permission);
    }
    
    const getPaymentsList = async (values) => {
        paymentList && paymentList.length == 0 && setIsLoading(true)
        try {
            Keyboard.dismiss();
            setPage(2);
            setHasMore("0");

            let params = {sort : "id",sortDir : "DESC", page : 1}
            if(values?.status){
                params.status = values.status
               }
               if(values?.account){
                params.account = values?.account
               }
               if(values?.paymentAccount){
                params.paymentAccount = values?.paymentAccount
               }
             if(values?.startDate){
                params.startDate = DateTime.formatDate(values?.startDate)  
                }
               if(values?.endDate){
                params.endDate = DateTime.formatDate(values?.endDate)
               }
            PaymentService.search(params, (response) => {
                let payment = response?.data?.data;
                setIsLoading(false);
                setRefreshing(false)
                // Set response in state
                setPaymentList(payment);
            })
        } catch (err) {
            console.log(err);
            setIsLoading(false);
        }
    }

    const deleteToggle = () => {
        setDeleteModal(!deleteModal)
    }

    const paymentDelete = () => {
        PaymentService.delete(selectedItem?.id, (error, response) => {
            getPaymentsList();
        })
    }

    const renderItem = data => {
        let item = data?.item;
        let index = data?.index
        const containerStyle = AlternativeColor.getBackgroundColor(index)

        return (
            <PaymentCard
                item={item}
                alternative={containerStyle}
                onPress={() => props.navigation.navigate("Payments/Form", { item: item })}
            />
        );
    };

    const closeRow = (rowMap, rowKey) => {
        if (rowMap[rowKey]) {
            rowMap[rowKey].closeRow();
        }
    }
    const closeDrawer = () => {
        setOpenFilter(!openFilter);
    }

    const getStatusList = async () => {
        let status = [];
        const response = await StatusService.list(ObjectName.PAYMENT);

        response && response.forEach((statusList) => {
            status.push({
                label: statusList.name,
                value: statusList.status_id,
                id: statusList.status_id
            });
        });

        setStatusList(status);
    }


    const getAccountList = ()=>{
        accountService.GetList(null,(callback) => { setVendorList(callback) });

    }
    const getPaymentAccount = async () => {
        await PaymentAccountService.search(setPaymentAccountList)
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
      const paymentAccountOnSelect = (value) => {
        if (value) {
          setValues((prevValues) => ({
            ...prevValues,
            paymentAccount: value
          }));
        } else {
          setValues((prevValues) => ({
            ...prevValues,
            paymentAccount: ""
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
    const handleSubmit = () => {
        getPaymentsList(values)
        closeDrawer()
      }; 



    const renderHiddenItem = (data, rowMap) => {
        return (
            <View style={styles.swipeStyle}>
                <TouchableOpacity
                    style={[styles.actionDeleteButton]}
                    onPress={() => {
                        deleteToggle()
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


    const LoadMoreList = async () => {
        try {
            setIsFetching(true);

            let params = { page: page,sort : "id",sortDir : "DESC" }
            if(values?.status){
                params.status = values.status
               }
             
               if(values?.account){
                params.account = values?.account
               }
               if(values?.paymentAccount){
                params.paymentAccount = values?.paymentAccount
               }
             if(values?.startDate){
                params.startDate = DateTime.formatDate(values?.startDate)  
                }
               if(values?.endDate){
                params.endDate = DateTime.formatDate(values?.endDate)
               }

            PaymentService.search(params, (response) => {

                let payments = response?.data?.data;

                // Set response in state
                setPaymentList((prevTitles) => {
                    return [...new Set([...prevTitles, ...payments])];
                });
                setPage((prevPageNumber) => prevPageNumber + 1);
                setHasMore(payments.length > 0);
                setIsFetching(false);
            });
        } catch (err) {
            console.log(err);
            setIsLoading(false);
        }
    };

    return (
        <Layout
            title={"Payments"}
            isLoading={isLoading}
            refreshing={refreshing}
            addButton={addPermission ? true : false}
            buttonOnPress={() => props.navigation.navigate("Payments/Form")}
            
            showFilter={true}
            onFilterPress={closeDrawer}
        >
             <FilterDrawer 
            values={values}
            isOpen={openFilter} 
            closeDrawer={closeDrawer} 
            accountOnSelect={accountOnSelect} 
            paymentAccountOnSelect={paymentAccountOnSelect}
            statusOnSelect={statusOnSelect}  
            onDateSelect={onDateSelect}
            onEndDateSelect={onEndDateSelect}
            selectedEndDate={selectedEndDate}
            selectedDate={selectedDate}
            statusList={statusList}
            vendorList ={vendorList}
            paymentAccountList={paymentAccountList}
            accountLabel={"Select Account"}
            showAccount
            showStatus
            showPaymentAccount
            showDate           
            handleSubmit={handleSubmit}/>
            <Refresh refreshing={refreshing} setRefreshing={setRefreshing}>
                {deleteModal && (
                    <DeleteConfirmationModal
                        modalVisible={deleteModal}
                        toggle={deleteToggle}
                        item={selectedItem}
                        id={selectedItem?.id}
                        updateAction={paymentDelete}
                    />
                )}
                {paymentList && paymentList.length > 0 ? (

                    <SwipeListView
                        data={paymentList}
                        renderItem={renderItem}
                        renderHiddenItem={renderHiddenItem}
                        rightOpenValue={-70}
                        previewOpenValue={-40}
                        previewOpenDelay={3000}
                        disableRightSwipe={true}
                        closeOnRowOpen={true}
                        keyExtractor={item => String(item.id)}
                    />
                ) : (
                    <NoRecordFound iconName="box-open" />
                )}
                <ShowMore List={paymentList} isFetching={isFetching} HasMore={HasMore} onPress={LoadMoreList} />


            </Refresh>
        </Layout>
    );
};

export default Payments;


