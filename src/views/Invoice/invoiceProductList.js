import React, { useState, useEffect, useRef } from "react";
import { View, TouchableOpacity, BackHandler, ScrollView } from "react-native";

import Layout from "../../components/Layout";

import { useNavigation } from "@react-navigation/native";

import { useIsFocused } from "@react-navigation/native";

import Spinner from "react-native-loading-spinner-overlay";

import ProductCard from "../../components/ProductCard";

import { SwipeListView } from "react-native-swipe-list-view";

import Order from "../../helper/Order";

import Permission from "../../helper/Permission";

import AsyncStorageService from "../../services/AsyncStorageService";

import { MenuItem } from "react-native-material-menu";

import { FontAwesome5 } from "@expo/vector-icons";

import { Color } from "../../helper/Color";

import { CommonActions } from "@react-navigation/native";

import AlternativeColor from "../../components/AlternativeBackground";
import Label from "../../components/Label";
import PermissionService from "../../services/PermissionService";
import { useForm } from "react-hook-form";

import Number from "../../lib/Number";
import styles from "../../helper/Styles";
import invoiceService from "../../services/invoiceService";
import Alert from "../../lib/Alert";
import invoiceProductService from "../../services/invoiceProductService";

const invoiceProductList = (props) => {
  const id = props?.route?.params?.id;
  const params = props?.route?.params;
  const [modalVisible, setScanModalVisible] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [invoiceProducts, setInvoiceProducts] = useState([]);
  const [manageOther, setManageOther] = useState(false);
  const [orderId, setOrderId] = useState(id ? id : params?.orderId);
  const [searchPhrase, setSearchPhrase] = useState("");
  const [orderNumber, setOrderNumber] = useState(
    params && params.orderDetail ? params.orderDetail.order_number : null
  );
  const [permission, setPermission] = useState("");

  const [actionList, setActionList] = useState([]);
  const [list, setList] = useState([]);

  const [visible, setVisible] = useState(false);
  const [items, setItems] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const [selectedItems, setSelectedItems] = useState([]);

  const IsFocused = useIsFocused();

  const orderRef = useRef({
    selectedItems: [],
  });

  const navigation = useNavigation();
  useEffect(() => {
    if (params.status == Order.STATUS_DRAFT || params?.isNewOrder) {
      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          return true;
        }
      );
      return () => backHandler.remove();
    }
  }, []);

  useEffect(() => {
    //get order products
    getInvoiceProducts();
    getAction();
  }, [IsFocused, props]);

  useEffect(() => {
    getDetails();
  }, [refreshing]);

  useEffect(() => {
    getActionItems();
  }, [IsFocused, props]);

  useEffect(() => {
    let mount = true;
    //get permission
    mount && getPermission(), editPermission();
    return () => {
      mount = false;
    };
  }, []);
  const handleSelectAll = () => {
    const refundableItems = invoiceProducts.filter(item => item.allowRefundRequest);

    const newSelectedItems = refundableItems.reduce((selected, item) => {
      selected[item.orderProductId] = true;
      return selected;
    }, {});

    setSelectedItems(newSelectedItems);
    orderRef.current.selectedItems = newSelectedItems;
  };
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({});

  useEffect(() => {
    if (params?.isNewOrder) {
      toggle();
    }
  }, [navigation]);

  function getOrderTotalAmount(orderProductList) {
    let totalAmount = 0;
    for (let i = 0; i < orderProductList.length; i++) {
      if (orderProductList[i].cancelledAt == null) {
        totalAmount +=
          Number.GetFloat(
            orderProductList[i].manual_price
              ? orderProductList[i].manual_price
              : orderProductList[i].sale_price,
            0
          ) * Number.Get(orderProductList[i].quantity, 0);
      }
    }
    return totalAmount;
  }

  const editPermission = async () => {
    const editPermission = await PermissionService.hasPermission(
      Permission.ORDER_EDIT
    );
    setPermission(editPermission);
  };



  const getDetails = () => {
    if (id) {
      invoiceService.search({ orderId: id }, (error, response) => {
        let orders = response && response?.data && response?.data?.data;
        setItems(orders[0]);
      });
    }
  };

  const getInvoiceProducts = async (UpdatedOrderId, callback) => {
    try {
      setSelectedItems("");
      let orderIdValue = orderId ? orderId : id ? id : UpdatedOrderId;

      let param = { orderId: orderIdValue, pagination: false,type:params?.type };

      if (orderIdValue) {
        //ge order products
        await invoiceProductService.search(
          param,
          (invoiceProducts, amount, totalQuantity) => {
            let filteredOrderProdcts = invoiceProducts.filter(
              (product) => product.status !== Order.STATUS_CANCEL
            );
            callback && callback(invoiceProducts);

            //set order products
            setInvoiceProducts(invoiceProducts);

            const totalAmount = getOrderTotalAmount(invoiceProducts);

            setTotalAmount(totalAmount);
          }
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getPermission = async () => {
    let permissionList = await AsyncStorageService.getPermissions();
    if (permissionList) {
      permissionList = JSON.parse(permissionList);
      if (permissionList && permissionList.length > 0) {
        let manageOther =
          permissionList &&
          permissionList.find(
            (option) =>
              option.role_permission === Permission.ORDER_MANAGE_OTHERS
          )
            ? true
            : false;

        let orderProductCancel =
          permissionList &&
          permissionList.find(
            (option) =>
              option.role_permission === Permission.ORDER_PRODUCT_CANCEL
          )
            ? true
            : false;

        setManageOther(manageOther);
      }
    }
  };

  const toggle = () => {
    //close the scan modal
    setScanModalVisible(!modalVisible);
  };

  const handleItemLongPress = (itemId) => {
    setSelectedItems((prevSelectedItems) => {
      const newSelectedItems = {
        ...prevSelectedItems,
        [itemId]: !prevSelectedItems[itemId] || false,
      };

      orderRef.current.selectedItems = newSelectedItems; // Update the ref here
      return newSelectedItems;
    });
  };

  const createRefundRequest = async (id) => {
    setVisible(false);

    let selectedItems = orderRef.current.selectedItems;
    const selectedIds = [];
    for (const ids in selectedItems) {
      if (selectedItems[ids]) {
        selectedIds.push(ids);
      }
    }
    const updateData = {
      orderId: id,
      selectedIds: selectedIds,
    };
    if (selectedIds && selectedIds.length > 0) {
      await invoiceService.create(updateData, (err, response) => {
        if (response && response.data) {
          setSelectedItems([]);
          orderRef.current.selectedItems = [];
        }
      });
    } else {
      Alert.Error("Please Select Atleast One Item");
    }
    setVisible(true);
  };
  const renderItem = (data) => {
    let item = data?.item;
    let index = data?.index;

    const containerStyle = AlternativeColor.getBackgroundColor(index);
    return (
      <View style={[containerStyle, styles.leadContainer]}>
        {item && (
          <ProductCard
            size={item.size}
            unit={item.unit}
            name={item.product_name}
            image={null}
            brand={item.brand_name}
            sale_price={
              item?.manual_price ? item?.manual_price : item.sale_price
            }
            mrp={item.mrp}
            id={item.id}
            onLongPress={() => handleItemLongPress(item.orderProductId)}
            item={item}
            quantity={item.quantity}
            status={item.status}
            QuantityField
            editable
            alternative={containerStyle}
          />
        )}
        {selectedItems && params?.status === Order.STATUS_COMPLETED && item?.allowRefundRequest &&  (
          <View>
            <FontAwesome5
              name={
                selectedItems[item.orderProductId] ? "check-square" : "square"
              }
              size={24}
              color="black"
              onPress={() => handleItemLongPress(item.orderProductId)}
            />
          </View>
        )}
      </View>
    );
  };
  const getActionItems = async () => {
    let actionItems = new Array();

    const cancelPermission = await PermissionService.hasPermission(
      Permission.ORDER_CANCEL
    );

    if (params.isNewOrder) {
      null;
    } else {
      actionItems.push(
        <MenuItem
          onPress={() => {
            createRefundRequest(orderId);

            setVisible(true);
          }}
        >
          Create Refund Request
        </MenuItem>
      );
    }

    setActionList(actionItems);
  };
  const getAction = async () => {
    let actionItems = new Array();

    const editPermission = await PermissionService.hasPermission(
      Permission.ORDER_EDIT
    );

    setList(actionItems);
  };
  const handleCancelSelection = () => {
    setSelectedItems("");
  };

  return (
    <Layout
      title={"Invoice"}
      closeModal={visible}
      showActionMenu={true}
      actionItems={actionList}
      showBackIcon={
        params?.isNewOrder || params?.status == Order.STATUS_DRAFT
          ? false
          : true
      }
      defaultFooter={
        params?.status == Order.STATUS_DRAFT || params?.isNewOrder
          ? true
          : false
      }
      emptyMenu={
        params?.status == Order.STATUS_DRAFT || params?.isNewOrder
          ? true
          : false
      }
      HideSideMenu={
        params?.status == Order.STATUS_DRAFT || params?.isNewOrder
          ? true
          : false
      }
    >
      {selectedItems && params?.status === Order.STATUS_COMPLETED && (
        <View style={styles.direction}>
          <TouchableOpacity onPress={handleCancelSelection}>
            <Label text={"Cancel"} size={16} bold={true} />
          </TouchableOpacity>
          <View style={styles?.alingCount}>
            <TouchableOpacity onPress={handleSelectAll}>
              <Label text={"Select All"} size={16} bold={true} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={{ flex: 1 }}>
        <View
          style={
            invoiceProducts && invoiceProducts.length > 0
              ? { flex: 0.8 }
              : { flex: 0.8, justifyContent: "center", alignItems: "center" }
          }
        >
          {!searchPhrase && invoiceProducts && invoiceProducts.length > 0 ? (
            <>
              <ScrollView>
                <SwipeListView
                  data={invoiceProducts}
                  renderItem={renderItem}
                  rightOpenValue={
                    params?.status == Order.STATUS_DRAFT || params?.isNewOrder
                      ? -150
                      : -80
                  }
                  previewOpenValue={-40}
                  previewOpenDelay={3000}
                  closeOnRowOpen={true}
                  keyExtractor={(item) => String(item.id)}
                  disableLeftSwipe={false}
                  disableRightSwipe={true}
                />
              </ScrollView>
            </>
          ) : invoiceProducts && invoiceProducts.length == 0 ? (
            <View style={{ alignItems: "center" }}>
              <FontAwesome5 name="box-open" size={20} color={Color.PRIMARY} />
              <Label text="No Products Added Yet" bold={true} />
            </View>
          ) : (
            <Spinner />
          )}
        </View>
      </View>
    </Layout>
  );
};
export default invoiceProductList;
