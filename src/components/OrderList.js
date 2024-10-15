// Import React and Component
import { useIsFocused, useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { MenuItem } from "react-native-material-menu";
import { SwipeListView } from "react-native-swipe-list-view";
import DropDownMenu from "../components/DropDownMenu";
import Layout from "../components/Layout";
import DeleteConfirmationModal from "../components/Modal/DeleteConfirmationModal";
import NoRecordFound from "../components/NoRecordFound";
import Refresh from "../components/Refresh";
import ShowMore from "../components/ShowMore";
import AsyncStorageConstants from "../helper/AsyncStorage";
import { Color } from "../helper/Color";
import { Filter } from "../helper/Filter";
import ObjectName from "../helper/ObjectName";
import Order from "../helper/Order";
import Permission from "../helper/Permission";
import TabName from "../helper/Tab";
import AsyncStorage from "../lib/AsyncStorage";
import { default as DateTime } from "../lib/DateTime";
import OrderService from "../services/OrderService";
import PermissionService from "../services/PermissionService";
import shiftService from "../services/ShiftService";
import StatusService from "../services/StatusServices";
import storeService from "../services/StoreService";
import userService from "../services/UserService";
import OrderAmountCard from "../views/order/components/OrderAmountCard";
import OrderCard from "../views/order/components/OrderCard";
import DateFilter from "./DateFilter";
import FilterDrawer from "./Filter";
import styles from "../helper/Styles";
import OrderType from "../helper/OrderType";
import OrderTypeService from "../services/orderTypeService";

const OrderList = ({ title, type, AddNew, onPress, showFilter,enableOrderIcon}) => {

    const [isLoading, setIsLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [page, setPage] = useState(2);
    const [HasMore, setHasMore] = useState(true);
    const [OrderDeleteModalOpen, setOrderDeleteModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState("");
    const [manageOther, setManageOther] = useState(false);
    const [todayList, setTodayList] = useState([]);
    const [visible, setVisible] = useState(false);
    const [openFilter, setOpenFilter] = useState(false);
    const [values, setValues] = useState({        
            startDate: "",
            endDate:"",
            selectedDate: Filter.TODAY_VALUE
        });
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedEndDate, setSelectedEndDate] = useState("");
    const [statusList, setStatusList] = useState();
    const [userList, setUserList] = useState();
    const [locationList, setLocationList] = useState();
    const [shiftList, setShiftList] = useState();
    const[permission,setPermission] = useState(false)
    const[totalCash,setTotalCash] = useState("")
    const[totalUpi,setTotalUpi] = useState("")
    const[totalAmount,setTotalAmount] = useState("")
    const [search, setSearch] = useState("");
    const stateRef = useRef();
    const isFocused = useIsFocused();
    const route = useRoute()
    const navigation = useNavigation();
    useEffect(() => {
        // Only run the effect when the screen is focused
        if (!isFocused) return;
    
        // Check if it's the camera screen
        if (route.name === 'CameraScreen') {
          return;
        }
    
        const storedFilterValues = values;
        if (Object.keys(storedFilterValues).length > 0) {
            setValues(storedFilterValues);
        }
            getAllList(values);
    }, [isFocused, route.name]);

    useEffect(() => {
        if(refreshing){
        getAllList(values);
    }
}, [refreshing]);



    useEffect(() => {
        getUserList();
        getStoreList();
        getShiftList();
        getStatusList()
    }, [isFocused]);

    useEffect(() => {
        let mount = true;
        mount && getPermission();
        //get permission
        return () => {
            mount = false;
        };
    }, [isFocused]);



    const getStatusList = async () => {
        let status = [];
        let orderTypeData = await OrderTypeService.list()
        let orderTypeIds = []
        // Check if it's a store order
      if (type && type?.isStoreOrder === OrderType.IS_STORE_ORDER) {
      orderTypeIds = orderTypeData && orderTypeData.length > 0 
        ? orderTypeData
              .filter((value) => value.allow_store_order === true) // Only keep those with store order allowed
              .map((value) => value.id) // Map to the relevant field, such as ID
        : [];
      } 

// Check if it's a delivery order
if (type && type?.isDeliveryOrder === OrderType.IS_DELIVERY_ORDER) {
     orderTypeIds = orderTypeData && orderTypeData.length > 0 
        ? orderTypeData
              .filter((value) => value.allow_delivery === true) // Only keep those with delivery allowed
              .map((value) => value.id) // Map to the relevant field, such as ID
        : [];
    
}
        //let orderTypeIds = orderTypeData && orderTypeData.length>0 ?orderTypeData.map((value=>value?))
        const response = await StatusService.list(ObjectName.ORDER_TYPE,orderTypeIds);

        response && response.forEach((statusList) => {
            status.push({
                label: statusList.name,
                value: statusList.status_id,
                id: statusList.status_id
            });
        });

        setStatusList(status);
    }
    const getUserList = () => {
        userService.list(null, (callback) => { setUserList(callback) });

    }
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

                setLocationList(storeListOption);
            }

        });
    }

    const getShiftList = () => {
        let shiftListOption = new Array();

        shiftService.getShiftList({ showAllowedShift: true }, (error, response) => {
            let shiftList = response?.data?.data;
            if (shiftList && shiftList.length > 0) {
                for (let i = 0; i < shiftList.length; i++) {
                    shiftListOption.push({
                        label: shiftList[i].name,
                        value: shiftList[i].id,
                    });
                }
                setShiftList(shiftListOption);
            }
        })
    }

    const getPermission = async () => {
        //get permission list
        let permissionList = await AsyncStorage.getItem(
            AsyncStorageConstants.PERMISSIONS
        );
        //validate permission list exist or not
        if (permissionList) {
            //convert string to JSON
            permissionList = JSON.parse(permissionList);
            //validate permission list exist or not
            if (permissionList && permissionList.length > 0) {
                //get permission
                let manageOther =
                    permissionList &&
                        permissionList.find(
                            (option) => option.role_permission === Permission.ORDER_DELETE
                        )
                        ? true
                        : false;
                //set all user
                setManageOther(manageOther);
            }
        }
        const addOrder = await PermissionService.hasPermission(Permission.ORDER_ADD);

        const manageOthers = await PermissionService.hasPermission(Permission.ORDER_MANAGE_OTHERS);

        setPermission({ orderAdd: addOrder, manageOthers: manageOthers})

    };


    const getAllList = async (values) => {
        try {
            
            let param

            param = { sort: "createdAt", sortDir: "DESC", };

                if (values?.startDate) {
                    param.startDate = DateTime.formatDate(values?.startDate);
                }
                if (values?.endDate) {
                    param.endDate = DateTime.formatDate(values?.endDate);
                }
                if(type &&  type?.isStoreOrder == OrderType.IS_STORE_ORDER){
                    param.isStoreOrder = OrderType.IS_STORE_ORDER
                }
               
                if(type &&  type?.isDeliveryOrder == OrderType.IS_DELIVERY_ORDER){
                    param.isDeliveryOrder = OrderType.IS_DELIVERY_ORDER
                }

            if (values?.status) {
                param.status = values?.status;
            }
                param.search = search;
           
            if (values?.user) {
                param.user = values?.user;
            }
            if (values?.location) {
                param.location = values?.location;
            }
            if (values?.shift) {
                param.shift = values?.shift;
            }
             
                if(values?.selectedDate){
               param.orderDate = values.selectedDate
               param.showTotalAmount= true
        
            }
            if (values?.paymentType) {
                param.paymentType = values?.paymentType;
            }
            
            todayList && todayList.length == 0 && setIsLoading(true);

            OrderService.searchOrder(param, (error, response) => {
                let orders = response && response?.data && response?.data?.data;
                
                setTodayList(orders);
                setIsLoading(false);
                setTotalCash( response.data.totalCash)
                setTotalUpi( response.data.totalUpi)
                setTotalAmount(response.data.totalAmount)
            });
            getStatusList()

        } catch (err) {
            console.log(err);

        }
    };

    const closeDrawer = () => {
        setOpenFilter(!openFilter);
    };

    const closeRow = (rowMap, rowKey) => {
        if (rowMap[rowKey]) {
            rowMap[rowKey].closeRow();
        }
    };

    const clearRowDetail = () => {
        if (stateRef) {
            const selectedItem = stateRef.selectedItem;
            const selectedRowMap = stateRef.selecredRowMap;
            if (selectedItem && selectedRowMap) {
                closeRow(selectedRowMap, selectedItem.id);
                setSelectedItem("");
                stateRef.selectedItem = "";
                stateRef.selecredRowMap = "";
            }
        }
    };

    const orderDeleteModalToggle = () => {
        setOrderDeleteModalOpen(!OrderDeleteModalOpen);
        clearRowDetail();
    };


    const renderHiddenItem = (data, rowMap) => {
        return (
            <>
                <View style={styles.moreMenu}>
                    <DropDownMenu
                        label="More"
                        color={Color.WHITE}
                        icon="ellipsis-horizontal"
                        menuStyle = {{position: 'absolute'}}
                        MenuItems={[
                            <MenuItem
                                onPress={() => {
                                    setVisible(true), orderDeleteModalToggle();
                                    setSelectedItem(data?.item);
                                    stateRef.selectedItem = data?.item;
                                    stateRef.selecredRowMap = rowMap;
                                    closeRow(rowMap, data?.item.id);
                                }}
                            >
                                DELETE
                            </MenuItem>,
                        ]}
                        onPress={visible}
                    />
                </View>
                <View style={styles.swipeStyle}>
                    <TouchableOpacity
                        style={styles.viewInvoiceButton}
                        onPress={() => {
                            navigation.navigate("Order/Invoice", { item: data.item });
                        }}
                    >
                        <Text style={styles.btnText}>View Invoice</Text>
                    </TouchableOpacity>
                </View>
            </>
        );
    };

    const renderItem = ({ item, index }) => {
        return (
            <View style={styles.container}>
                {type && type?.isDeliveryOrder == OrderType.IS_DELIVERY_ORDER ? (
                    <OrderCard
                        order_number={item.order_number !== null ? item.order_number : ""}
                        date={item.date}
                        customerName={item.customerName}
                        status={item.statusDetail?.name}
                        statusColor={item?.statusDetail?.color_code}
                        firstName = {item?.owner_firstName}
                        lastName = {item?.owner_lastName}
                        mediaUrl = {item?.owner_media_url}
                        payment_type={item.payment_type}
                        total_amount={item.total_amount}
                        index={index}
                        onPress={() => onPress && onPress(item)}
                        data={item}
                    />
                ) : <OrderCard
                    order_number={item.order_number !== null ? item.order_number : ""}
                    date={item.date}
                    locationName={item.locationName}
                    status={item.status}
                    statusColor={item?.statusDetail?.color_code}
                    payment_type={item.payment_type}
                    total_amount={item.total_amount}
                    shift={item.shift}
                    index={index}
                    onPress={() => onPress && onPress(item)}
                    data={item}
                />}

            </View>
        );
    };
  const handleSubmit = async () => {
    getAllList({...values, search:search});
    closeDrawer();
};
    const statusOnSelect = (value) => {
        if (value) {
            setValues((prevValues) => ({
                ...prevValues,
                status: value,
            }));
        } else {
            setValues((prevValues) => ({
                ...prevValues,
                status: "",
            }));
        }
    };
    const userOnSelect = (value) => {
        if (value) {
            setValues((prevValues) => ({
                ...prevValues,
                user: value.value,
            }));
        } else {
            setValues((prevValues) => ({
                ...prevValues,
                user: "",
            }));
        }
    };
    const locationOnSelect = (value) => {
        if (value) {
            setValues((prevValues) => ({
                ...prevValues,
                location: value,
            }));
        } else {
            setValues((prevValues) => ({
                ...prevValues,
                location: "",
            }));
        }
    };
    const shiftOnSelect = (value) => {
        if (value) {
            setValues((prevValues) => ({
                ...prevValues,
                shift: value,
            }));
        } else {
            setValues((prevValues) => ({
                ...prevValues,
                shift: "",
            }));
        }
    };

    const paymentOnSelect = (value) => {
        if (value) {
            setValues((prevValues) => ({
                ...prevValues,
                paymentType: value,
            }));
        } else {
            setValues((prevValues) => ({
                ...prevValues,
                paymentType: "",
            }));
        }
    };

    const onDateSelect = (value) => {
        if (value) {
            setValues((prevValues) => ({
                ...prevValues,
                startDate: DateTime.Today(value),
            }));
            setSelectedDate(DateTime.Today(value));
        } else {
            setValues((prevValues) => ({
                ...prevValues,
                startDate: "",
            }));
            setSelectedDate("");
        }
    };
    const onEndDateSelect = (value) => {
        if (value) {
            setValues((prevValues) => ({
                ...prevValues,
                endDate: DateTime.Today(value),
            }));
            setSelectedEndDate(DateTime.Today(value));
        } else {
            setValues((prevValues) => ({
                ...prevValues,
                endDate: "",
            }));
            setSelectedEndDate("");
        }
    };

    const TodayLoadMoreList = async () => {
        try {
            setIsFetching(true);

            let params;

            params = {
                page: page,
                search: search?search : "",
                sort: "createdAt",
                sortDir: "DESC",
            };
            
            if(type &&  type?.isStoreOrder == OrderType.IS_STORE_ORDER){
                params.isStoreOrder = OrderType.IS_STORE_ORDER
            }
           
            if(type &&  type?.isDeliveryOrder == OrderType.IS_DELIVERY_ORDER){
                params.isDeliveryOrder = OrderType.IS_DELIVERY_ORDER
            }
            if (values?.status) {
                params.status = values?.status;
            }

            if (values?.user) {
                params.user = values?.user;
            }
            if (values?.location) {
                params.location = values?.location;
            }
            if (values?.shift) {
                params.shift = values?.shift;
            }
            if (values?.paymentType) {
                params.paymentType = values?.paymentType;
            }
            if (values?.startDate) {
                params.startDate = DateTime.formatDate(values?.startDate);
            }
            if (values?.endDate) {
                params.endDate = DateTime.formatDate(values?.endDate);
            }
                params.orderDate =  values?.selectedDate
                params.showTotalAmount= true

            OrderService.searchOrder(params, (error, response) => {
                let orders = response?.data?.data;

                // Set response in state
                setTodayList((prevTitles) => {
                    return [...new Set([...prevTitles, ...orders])];
                });
                setPage((prevPageNumber) => prevPageNumber + 1);
                setHasMore(orders.length > 0);

                setIsFetching(false);
            });
        } catch (err) {
            console.log(err);
            setIsLoading(false);
        }
    };

    const {
        control,
        formState: { errors },
    } = useForm();

    const OrderDelete = async () => {
        if (selectedItem) {
            OrderService.DeleteOrder(selectedItem.id, (error, response) => {
                getAllList({...values,search: search})
            });
        }
    };
    const handleChange = async (value) => {
        setSearch(value);
    };

    const handleDateFilterChange = (value) => {
        setValues({
            selectedDate: value
        })
          getAllList({
            startDate: values?.startDate,
            endDate: values?.endDate,
            selectedDate: value
          })
    
      }

    return (
        <>
      <Layout
        title={title}
        addButton={permission && permission.orderAdd ? true : false}
        buttonOnPress={permission && permission.orderAdd ? AddNew : ""}
        isAddButtonDisabled={!enableOrderIcon}
        refreshing={refreshing}
        showFilter={showFilter}
        onFilterPress={closeDrawer}
        showBackIcon={false}
        closeModal={visible}
        filter={
            <DateFilter
              handleDateFilterChange={handleDateFilterChange}
              control={control}
              data={values?.selectedDate}
              showCloseIcon={false}
            />}
      >

        <FilterDrawer
          values={values}
          isOpen={openFilter}
          ObjectName={ObjectName.ORDER}
          closeDrawer={closeDrawer}
          paymentOnSelect={paymentOnSelect}
          shiftOnSelect={shiftOnSelect}
          locationOnSelect={locationOnSelect}
          statusOnSelect={statusOnSelect}
          userOnSelect={userOnSelect}
          onDateSelect={onDateSelect}
          onEndDateSelect={onEndDateSelect}
          selectedEndDate={selectedEndDate}
          selectedDate={selectedDate}
          statusList={statusList}
          userList={userList}
          locationList={locationList}
          shiftList={shiftList}
          showLocation
          showStatus
          showUser={permission && permission.manageOthers}
          showPayment
          showShift
          showDate={true}
          showSearch
          handleSubmit={handleSubmit}
          clearFilter={() => {
            setValues("");
            getAllList();
            closeDrawer();
          }}
          applyFilter={(value) => applyFilter(value)}
          handleSearchChange={handleChange}
          searchParam={search}
          handleClearSearch={() => {
           setSearch("")
          }}
        />
      
          <DeleteConfirmationModal
            modalVisible={OrderDeleteModalOpen}
            toggle={orderDeleteModalToggle}
            item={selectedItem}
            updateAction={OrderDelete}
          />

          <>
        

           <Refresh refreshing={refreshing} isLoading={isLoading} setRefreshing={setRefreshing}>

                {todayList && todayList.length > 0 ? (
                  <>
                    <SwipeListView
                      data={todayList}
                      renderItem={renderItem}
                      renderHiddenItem={renderHiddenItem}
                      rightOpenValue={-140}
                      previewOpenValue={-40}
                      previewOpenDelay={3000}
                      disableRightSwipe={true}
                      disableLeftSwipe={manageOther ? false : true}
                      closeOnRowOpen={true}
                      keyExtractor={(item) => String(item.id)}
                    />
                  </>
                ) : (
                  <NoRecordFound iconName="receipt" />
                )}
                <ShowMore
                  List={todayList}
                  isFetching={isFetching}
                  HasMore={HasMore}
                  onPress={TodayLoadMoreList}
                />
            </Refresh>
          </>
      </Layout>
      {type &&  type?.isStoreOrder == OrderType.IS_STORE_ORDER && todayList && todayList.length > 0 && 
        <OrderAmountCard totalCash = {totalCash} totalUpi = {totalUpi} totalAmount={totalAmount}/>
      }
         </>
    );
};

export default OrderList;
