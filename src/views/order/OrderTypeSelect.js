import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { View, ScrollView } from "react-native";
import styles from "../../helper/Styles";
import {
  CommonActions,
  useIsFocused,
  useNavigation,
} from "@react-navigation/native";
import OrderTypeSelectComponent from "../../components/OrderTypeSelect";
import orderService from "../../services/OrderService";
import Boolean from "../../lib/Boolean";

const OrderTypeSelect = (props) => {
  const params = props?.route?.params;

  const [list, setList] = useState(params?.orderTypeList);

  const navigation = useNavigation();

  const onPress = (value) => {
    if (Boolean.isTrue(value?.show_customer_selection)) {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            {
              name: "Order/ProductList",
              params: {
                storeId: params?.locationId,
                locationName: params?.locationName,
                shift: params?.shiftName,
                ownerName: params?.userName,
                userId: params?.selectedUser,
                shiftId: params?.selectedShift,
                isNewOrder: params?.isNewOrder,
                collectCustomerInfo: value?.show_customer_selection,
                type: value,
              },
            },
          ],
        })
      );
    } else {
      let body = { type: value?.id };

      orderService.createOrder(body, (error, response) => {
        if (response && response.data && response.data.orderId) {
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [
                {
                  name: "Order/ProductList",
                  params: {
                    orderDetail: response.data.orderDetail,
                    orderId: response.data.orderId,
                    storeId: params?.locationId,
                    locationName: params?.locationName,
                    shift: params?.shiftName,
                    ownerName: params?.userName,
                    userId: params?.selectedUser,
                    shiftId: params?.selectedShift,
                    isNewOrder: params?.isNewOrder,
                    collectCustomerInfo: value?.show_customer_selection,
                    type: value,
                  },
                },
              ],
            })
          );
        }
      });
    }
  };

  return (
    <Layout title={"Select Type"}>
      <ScrollView style={{ marginTop: 10 }}>
        <View style={styles.container}>
          <OrderTypeSelectComponent onPress={onPress} customTypeList={list} />
        </View>
      </ScrollView>
    </Layout>
  );
};

export default OrderTypeSelect;
