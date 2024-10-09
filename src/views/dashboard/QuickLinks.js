import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from "react-native";  // Import ScrollView
import { Color } from "../../helper/Color";
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import Card from "../../components/Card";
import Permission from "../../helper/Permission";
import PermissionService from "../../services/PermissionService";
import { useIsFocused } from "@react-navigation/native";
import QuickLinksIcon from "../../components/QuickLinksIcon";
import Device from "../../lib/Device";

const QuickLinks = ({
  AddNewOrder,
  CheckIn,
  addNewTransfer,
  addNewSalesSettlement,
  addNewActivity,
  bulkOrder,
  ScanProductbarcode,
}) => {
  const [orderViewPermission, setOrderViewPermission] = useState();
  const [transferViewPermission, setTransferViewPermission] = useState();
  const [salesSettlementViewPermission, setSalesSettlementViewPermission] =
    useState();
  const [bulkOrderViewPermission, setBulkOrderViewPermission] = useState();
  const [devicePendingStatus, setDevicePendingStatus] = useState(false);
  const [activityViewPermission, setActivityViewPermission] = useState();
  const [checkPermissionView,setCheckPriceViewPermission] = useState()
  const [orderAddPermission, setOrderAddPermission] = useState();
  const [transferAddPermission, setTransferAddPermission] = useState();
  const [salesSettlementAddPermission, setSalesSettlementAddPermission] =useState();
  const [activityAddPermission, setActivityAddPermission] = useState();
  const [permission, setPermission] = useState([])

  const focused = useIsFocused();

  useEffect(() => {
    getPermission();
  }, [focused]);

  const getPermission = async () => {
    const orderViewPermission = await PermissionService.hasPermission(
      Permission.QUICK_LINK_NEW_ORDER
    );
    const orderAdd = await PermissionService.hasPermission(Permission.ORDER_ADD)
    setOrderViewPermission(orderViewPermission);
    setOrderAddPermission(orderAdd)
    const transferViewPermission = await PermissionService.hasPermission(
      Permission.QUICK_LINK_NEW_TRANSFER
    );
    const transferAdd = await PermissionService.hasPermission(Permission.TRANSFER_ADD)
    setTransferAddPermission(transferAdd)
    setTransferViewPermission(transferViewPermission);
    const salesSettlementViewPermission = await PermissionService.hasPermission(
      Permission.QUICK_LINK_NEW_SALES_SETTLEMENT
    );
    const salesSettlementAdd = await PermissionService.hasPermission(Permission.SALE_SETTLEMENT_ADD)
    setSalesSettlementAddPermission(salesSettlementAdd)
    setSalesSettlementViewPermission(salesSettlementViewPermission);
    const bulkOrderViewPermission = await PermissionService.hasPermission(
      Permission.QUICK_LINK_BULK_ORDER
    );
    setBulkOrderViewPermission(bulkOrderViewPermission);
    const activityViewPermission = await PermissionService.hasPermission(
      Permission.QUICK_LINK_NEW_ACIVITY
    );
    const activityAdd = await PermissionService.hasPermission(Permission.ACTIVITY_ADD)
    setActivityAddPermission(activityAdd)
    setActivityViewPermission(activityViewPermission);
    const checkPriceViewPermission = await PermissionService.hasPermission(
      Permission.QUICK_LINK_CHECK_PRICE
    );
    setCheckPriceViewPermission(checkPriceViewPermission)
    let permission = new Array()
    if (transferViewPermission && transferAddPermission) {
      permission.push(transferViewPermission)
    }
    if (salesSettlementViewPermission && salesSettlementAdd) {
      permission.push(salesSettlementViewPermission)
    }
    if (bulkOrderViewPermission) {
      permission.push(bulkOrderViewPermission)
    }
    if (orderViewPermission && orderAddPermission) {
      permission.push(orderViewPermission)
    }
    if (activityViewPermission && activityAddPermission) {
      permission.push(activityViewPermission)
    }
    if (checkPriceViewPermission) {
      permission.push(checkPriceViewPermission)
    }
    
    setPermission(permission);
    await Device.isStatusBlocked((devicePendingStatus) => {
      setDevicePendingStatus(devicePendingStatus);
    });
  };
  if (permission && permission.length > 0) {
  return (
    <View style={styles.container}>
      <Card title={"Quick Links"}>
          <View style={styles.bottomContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator = {false}>
            {orderViewPermission && !devicePendingStatus && orderAddPermission && (
              <QuickLinksIcon
                iconName="receipt"
                label="New Order"
                onPress={() => {
                  AddNewOrder();
                }}
              />
            )}

            {transferViewPermission && !devicePendingStatus && transferAddPermission && (
              <QuickLinksIcon
                iconName="truck-moving"
                label="New Transfer"
                onPress={() => {
                  addNewTransfer();
                }}
              />
            )}
            {salesSettlementViewPermission && salesSettlementAddPermission && (
              <QuickLinksIcon
                iconName="file-invoice"
                label="New Sales"
                label1="Settlement"
                onPress={() => {
                  addNewSalesSettlement();
                }}
              />
            )}
            {activityViewPermission && activityAddPermission && (
              <QuickLinksIcon
                iconName="chart-line"
                label="New Activity"
                onPress={() => {
                  addNewActivity();
                }}
              />
            )}
            {checkPermissionView && (
                 <QuickLinksIcon
                 iconName="barcode"
                 label="Check Price"
                 onPress={() => {
                 ScanProductbarcode();
              }}
/>
            )}
           

            {bulkOrderViewPermission && (
              <QuickLinksIcon
                iconName="shopping-cart"
                label="Bulk Order"
                onPress={() => {
                  bulkOrder();
                }}
              />
            )}
           
            </ScrollView>
          </View>
      </Card>
    </View>
  );
};
}
  

export default QuickLinks;

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
  },
  bottomContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: 20,
  },
});
