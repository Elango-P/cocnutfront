import { CommonActions, useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import OrderList from "../../components/OrderList";
import AsyncStorageConstants from "../../helper/AsyncStorage";
import Order from "../../helper/Order";
import AsyncStorage from "../../lib/AsyncStorage";
import dateTime from "../../lib/DateTime";
import shiftService from "../../services/ShiftService";
import { useForm } from "react-hook-form";
import Boolean from "../../lib/Boolean";
import orderService from "../../services/OrderService";
import OrderType from "../../helper/OrderType";
import OrderTypeService from "../../services/orderTypeService";
import Response from "../../lib/NetworkStatus";

const Products = (props) => {
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedShift, setSelectedShft] = useState("");
  const [locationName, setlocationName] = useState();
  const [userName, setUserName] = useState();
  const [shiftName, setShiftName] = useState();
  const [locationId, setLocationId] = useState();
  const [orderTypes, setOrderTypes] = useState([]);
  const [enableOrderIcon, setOrderIconEnable] = useState(true);

  const navigation = useNavigation();
  useEffect(() => {
    saveStore();
    getRequiredValues();
  }, []);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({});

  const getRequiredValues = async () => {
    shiftService.getShiftList(null, (error, response) => {
      let shiftList = response?.data?.data;
      if (shiftList && shiftList.length > 0) {
        for (let i = 0; i < shiftList.length; i++) {
          let timeValidation = dateTime.compareTime(
            shiftList[i].start_time,
            shiftList[i].end_time
          );

          if (timeValidation) {
            setSelectedShft(shiftList[i].id);
            setShiftName(shiftList[i].name);
          }
        }
      }
    });

    let userId = await AsyncStorage.getItem(AsyncStorageConstants.USER_ID);

    setSelectedUser(userId);
  };

  const saveStore = async () => {
    try {
      await AsyncStorage.getItem(
        AsyncStorageConstants.SELECTED_LOCATION_ID
      ).then((res) => setLocationId(res));
      await AsyncStorage.getItem(
        AsyncStorageConstants.SELECTED_LOCATION_NAME
      ).then((res) => setlocationName(res));
      await AsyncStorage.getItem(AsyncStorageConstants.USER_NAME).then((res) =>
        setUserName(res)
      );
    } catch (error) {
      console.log(error);
    }
  };

  const AddNew = async () => {
    try{
    setOrderIconEnable(false)
    let orderTypeData = await OrderTypeService.list();

    let orderTypes = orderTypeData.filter(
      (orderType) => orderType.allow_store_order == true
    );

    if (orderTypes && orderTypes.length > 1) {
      props.navigation.navigate("Order/OrderTypeSelect", {
        orderTypeList: orderTypes,
        locationId: locationId,
        locationName: locationName,
        shiftName: shiftName,
        userName: userName,
        selectedUser: selectedUser,
        selectedShift: selectedShift,
        isNewOrder: true,
        collectCustomerInfo: true,
      });
    } else {
      let orderTypeData =
        orderTypes && orderTypes.length == 1 ? orderTypes[0] : null;

      if (Boolean.isTrue(orderTypeData?.show_customer_selection)) {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [
              {
                name: "Order/ProductList",
                params: {
                  storeId: locationId,
                  locationName: locationName,
                  shift: shiftName,
                  ownerName: userName,
                  userId: selectedUser,
                  shiftId: selectedShift,
                  isNewOrder: true,
                  collectCustomerInfo: true,
                  type: orderTypeData,
                },
              },
            ],
          })
        );
      } else {
        let body = { type: orderTypeData && orderTypeData?.id };

        orderService.createOrder(body, (error, response) => {
          if(error && error.status >= Response.STATUS_BAD_REQUEST){
          setOrderIconEnable(true)
          }

          if (response && response.data && response.data.orderId) {
          setOrderIconEnable(true)
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [
                  {
                    name: "Order/ProductList",
                    params: {
                      orderDetail: response.data.orderDetail,
                      orderId: response.data.orderId,
                      storeId: locationId,
                      locationName: locationName,
                      shift: shiftName,
                      ownerName: userName,
                      userId: selectedUser,
                      shiftId: selectedShift,
                      isNewOrder: true,
                      collectCustomerInfo: false,
                      type: orderTypeData,
                    },
                  },
                ],
              })
            );
          }
        });
      }
    }
  }catch(err){
    console.log(err);
    setOrderIconEnable(true)
  }
  };

  const onPress = (item) => {
    navigation.navigate("Order/ProductList", {
      id: item.id,
      totalAmount: item?.total_amount,
      cashAmount: item?.cash_amount,
      upiAmount: item?.upi_amount,
      storeId: item.store_id,
      locationName: item?.locationName,
      shift: item?.shift,
      shiftId: item?.shiftDetail?.id,
      owner: item?.owner,
      date: item?.date,
      status: item.status,
      group: item?.statusDetail?.group,
      status_id: item?.statusDetail?.id,
      allow_edit: item?.statusDetail?.allow_edit,
      orderNumber: item.order_number,
      type: item?.type,
      paymentType: item?.paymentType,
    });
  };

  return (
    <>
      <OrderList
        title={"Orders"}
        type={{ isStoreOrder: OrderType.IS_STORE_ORDER }}
        AddNew={AddNew}
        onPress={onPress}
        showFilter={true}
        enableOrderIcon={enableOrderIcon}
      />
    </>
  );
};

export default Products;
