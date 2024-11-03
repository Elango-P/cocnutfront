import React, { useEffect, useState, useCallback, useRef } from "react";
import {
    View, ScrollView, StyleSheet, TouchableOpacity, Text
} from "react-native";
import Layout from "../../components/Layout";
import purchaseService from '../../services/PurchaseService';
import { useNavigation, useIsFocused } from "@react-navigation/native";
import apiClient from "../../apiClient";
import { endpoints } from "../../helper/ApiEndPoint";
import PurchaseCard from "./components/PurchaseCard";
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
import asyncStorageService from "../../services/AsyncStorageService";
import Alert from "../../lib/Alert";
import styles from "../../helper/Styles";
import { MenuItem } from "react-native-material-menu";
import DropDownMenu from "../../components/DropDownMenu";

const Purchase = () => {

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
    const [addPermission, setAddPermission] = useState(true)
    const [openFilter, setOpenFilter] = useState(false);
    const [values,setValues] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedEndDate, setSelectedEndDate] = useState("");
    const [statusList, setStatusList] = useState();
    const [accountList, setAccountList] = useState();
    const [locationId, setLocationId] = useState();
    const [visible, setVisible] = useState(false);
    const [loadingStates, setLoadingStates] = useState({});


  

    const stateRef = useRef();


    useEffect(() => {
        let mount = true;
        mount && deletePermission()
        mount && getLocation()

        //cleanup function
        return () => {
            mount = false;
        };
    }, []);
    useEffect(() => {

        GetPurchaseList(values);
        deletePermission()

    }, [isFocused]);
    useEffect(()=>{
      if(refreshing){
        GetPurchaseList(values);

      }

    },[refreshing])
     useEffect(() => {
        getStatusList();
      
        getAccountList();
        
    }, []);

    const getLocation = async () => {
        let locationId = await asyncStorageService.getSelectedLocationId();
        setLocationId(locationId)
    
      }


    const deletePermission = async () => {
        const deletePermission = await PermissionService.hasPermission(Permission.PURCHASE_DELETE);
        setPermission(deletePermission);
        const addPermission = await PermissionService.hasPermission(Permission.PURCHASE_ADD)
        setAddPermission(true)
    }
     const getStatusList = async () => {
        let status = [];
        const response = await StatusService.list(ObjectName.PURCHASE);

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
            accountService.GetList(null,(callback) => { setAccountList(callback) });
            
        }
  
    const GetPurchaseList = async (values) => {
  
      purchase && purchase.length == 0 && setIsLoading(true);
    
        let params = {sort: "purchase_date", sortDir: "DESC"}
         if(values?.status){
          params.status = values.status
         }
         if(values?.account){
          params.account = values?.account
         }
         if(values?.startDate){
          params.startDate =  DateTime.formatDate(values?.startDate)  
          }
         if(values?.endDate){
          params.endDate = DateTime.formatDate(values?.endDate)
         }
        
         await purchaseService.search(params, response => {
          if (response) {
            setPurchase(response);
            setIsLoading(false);
            setRefreshing(false)
            setPage(2);
            setLoadingStates(false)
          }
    
          
        });
      };

      const LoadMoreList = async () => {
        try {
            setIsFetching(true);
    
            let params = {page: page }
            if(values?.status){
              params.status = values.status
             }
             if(values?.account){
              params.account = values?.account
             }
             if(values?.startDate){
              params.startDate =  DateTime.formatDate(values?.startDate)  
              }
             if(values?.endDate){
              params.endDate = DateTime.formatDate(values?.endDate)
             }
    
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
            navigation.navigate("PurchaseAdd",{locationId : locationId})
    }

    const purchaseDelete = async () => {
        if (selectedItem) {
            purchaseService.Delete(selectedItem.id, (error, response) => {
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
          <View
          style={{
            alignItems: "center",
            bottom: 10,
            justifyContent: "center",
            position: "absolute",
            top: 10,
            width: 70,
            backgroundColor: Color.SECONDARY,
            right: 10,
          }}
        >
          <DropDownMenu
          label="More"
          color={Color.WHITE}
          icon="ellipsis-horizontal"
          menuStyle={{ position: "absolute" }}
          MenuItems={[
            ...statusList.map((status) => (
              <MenuItem
                key={status.id}
                onPress={() => {
                  handleChangeStatus(data?.item?.id, status.id);
                  closeRow(rowMap, data?.item.id);
                  setVisible(true);
                }}
              >
                {status.label}
              </MenuItem>
            )),
            <MenuItem
              key="delete"
              onPress={() => {
                setVisible(true);
                purchaseDeleteModalToggle();
                setSelectedItem(data?.item);
                stateRef.selectedItem = data?.item;
                stateRef.selectedRowMap = rowMap;
                closeRow(rowMap, data?.item.id);
              }}
            >
              DELETE
            </MenuItem>,
          ]}
          onPress={visible}
        />
            </View>

        )
    };

    // Define the function to handle status changes
  const handleChangeStatus = (itemId, status) => {
    let data = { status: status };
    setLoadingStates((prev) => ({ ...prev, [itemId]: true }));
    purchaseService.updatePurchase(itemId, data, (res) => {
      if (res) {
        setVisible(false);
        GetPurchaseList();
      }
    });
  };
    const renderItem = data => {
        let item = data?.item;
        let index = data?.index;
        const containerStyle = AlternativeColor.getBackgroundColor(index)
        return (
            <PurchaseCard
                navigation={navigation}
                item={item}
                alternative={containerStyle}
                statusLoading={loadingStates[item?.id] || false}

            />

        );
    };

    return (
        <Layout title="Purchases" 
        isLoading={isLoading} 
        refreshing={refreshing} 
        addButton={addPermission ? true : false} 
        buttonOnPress={onClickNew} 
        showFilter={true}
        onFilterPress={closeDrawer}
        showBackIcon={true}

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
            accountList ={accountList}
            showAccount
            showStatus
            showDate
             handleSubmit={handleSubmit}/>
            <Refresh refreshing={refreshing} setRefreshing={setRefreshing}>
               
                    <View>

                        <DeleteConfirmationModal
                            modalVisible={purchaseDeleteModalOpen}
                            toggle={purchaseDeleteModalToggle}
                            item={selectedItem}
                            updateAction={purchaseDelete}
                            
                            id={selectedItem?.purchaseNumber}

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
                                disableLeftSwipe={permission? false : true}
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
export default Purchase;



