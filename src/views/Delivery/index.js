import React, { useEffect, useState } from "react";
import OrderList from "../../components/OrderList";
import Order from "../../helper/Order";
import AsyncStorage from "../../lib/AsyncStorage";
import AsyncStorageConstants from "../../helper/AsyncStorage";
import { CommonActions, useNavigation } from "@react-navigation/native";
import Alert from "../../lib/Alert";
import orderService from "../../services/OrderService";
import OrderType from "../../helper/OrderType";
import OrderTypeService from "../../services/orderTypeService";
import Response from "../../lib/NetworkStatus";

const Delivery = (props) => {
  const [locationName, setlocationName] = useState();
  const [userName, setUserName] = useState();
  const [locationId, setLocationId] = useState();
  const [orderTypes, setOrderTypes] = useState([]);

  const [enableOrderIcon, setOrderIconEnable] = useState(true);

  const navigation = useNavigation();

  useEffect(() => {
    saveStore();
    getOrderTypes();
    
  }, []);

  
  const getOrderTypes =async ()=>{
    let orderTypes = await OrderTypeService.list();
    setOrderTypes(orderTypes)
  }
  const onPress = (item) => {
    let deliveryOrderData =
    orderTypes && orderTypes.length >0
      ? orderTypes.find((value) => value.allow_delivery == true)
      : null;
      
    navigation.navigate("Order/ProductList", {
      owner: item?.owner,
      customerId: item.customer_account && item?.customer_account?.id,
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
      status_id: item?.statusDetail?.id,
      allow_edit: item?.statusDetail?.allow_edit,
      orderNumber: item.order_number,
      type: deliveryOrderData,
      customerName: item?.customerName,
      payment_type: item?.paymentType,
      group: item?.statusDetail?.group,
    });
  };

  const onSelectCustomer = async (value) => {
    setOrderIconEnable(false)
    let deliveryOrderData =
      orderTypes && orderTypes.length >0
        ? orderTypes.find((value) => value.allow_delivery == true)
        : null;
        
    let body = { type: deliveryOrderData?.id, customer_account: value?.id };
    orderService.createOrder(body, (error, response) => {
      if(error && error.status >= Response.STATUS_BAD_REQUEST){
        setOrderIconEnable(true)
        }
      if (response && response.data && response.data.orderId) {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [
              {
                name: "Order/ProductList",
                params: {
                  customerId: value?.id,
                  storeId: locationId,
                  locationName: locationName,
                  isNewOrder: true,
                  type: deliveryOrderData,
                  orderDetail: response.data.orderDetail,
                  orderId: response.data.orderId,
                },
              },
            ],
          })
        );
      }
    });
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

  return (
    <OrderList
      title={"Delivery"}
      type={{ isDeliveryOrder: OrderType.IS_DELIVERY_ORDER }}
      showFilter={true}
      AddNew={() =>
        props.navigation.navigate("CustomerSelector", {
          onSelectCustomer: onSelectCustomer,
        })
      }
      onPress={onPress}
      enableOrderIcon={enableOrderIcon}
    />
  );
};
export default Delivery;
