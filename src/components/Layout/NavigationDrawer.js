import React, { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";

import AsyncStorage from "../../lib/AsyncStorage";

import Permission from "../../helper/Permission";

import {
  useIsFocused,
  useNavigation,
  useRoute,
} from "@react-navigation/native";

import SideMenuCard from "../SideMenuCard";

import { Color } from "../../helper/Color";

import { NativeModules } from "react-native";

import Feature from "../../helper/Feature";
import styles from "../../helper/Styles";
import Device from "../../lib/Device";
import Setting from "../../lib/Setting";
import PermissionService from "../../services/PermissionService";
import settingService from "../../services/SettingService";
import VerticalSpace10 from "../VerticleSpace10";
const { BluetoothManager } = NativeModules;

const Menu = (props) => {
  useEffect(() => {
    getPermission();
    getThemeColor();
  }, []);
  const navigation = useNavigation();
  const route = useRoute();
  const routeNameArray = route.name.split("/");
  const [themeColor, setThemeColor] = useState(Color.WHITE);
  const [textColor, setTextColor] = useState(Color.WHITE);
  const [devicePendingStatus, setDevicePendingStatus] = useState(false);
  const [permission, setPermission] = useState({});
  const isFocused = useIsFocused();
  const [otpNotification, setOtpNotification] = useState(false);

  const Logout = async (setSideMenuOpen) => {
    await AsyncStorage.clearAll();
    navigation.navigate("Login");
    setSideMenuOpen && setSideMenuOpen(false);
  };

  let navigator = props?.route?.params?.navigator;

  const getThemeColor = async () => {
    try {
      await settingService.getByName(
        Setting.PORTAL_HEADER_COLOR,
        (err, response) => {
          setThemeColor(response);
        }
      );
      await settingService.getByName(
        Setting.PORTAL_HEADER_TEXT_COLOR,
        (err, response) => {
          setTextColor(response);
        }
      );
      await settingService.getByName(
        Setting.OTP_REQUIRED_FOR_SALARY,
        (err, response) => {
          setOtpNotification(response);
        }
      );
    } catch (error) {
      console.error("Error retrieving settings:", error);
      return null;
    }
  };

  const getPermission = async () => {
    const enableSales = await PermissionService.getFeaturePermission(
      Feature.ENABLE_SALE_SETTLEMENT,
      Permission.SALE_SETTLEMENT_VIEW
    );
    const enablePurchase = await PermissionService.getFeaturePermission(
      Feature.ENABLE_PURCHASE,
      Permission.PURCHASE_VIEW
    );
    const enableAttendance = await PermissionService.getFeaturePermission(
      Feature.ENABLE_ATTENDANCE,
      Permission.ATTENDANCE_VIEW
    );
    const enableProducts = await PermissionService.getFeaturePermission(
      Feature.ENABLE_PRODUCT,
      Permission.PRODUCT_VIEW
    );
    const enableOrders = await PermissionService.getFeaturePermission(
      Feature.ENABLE_ORDER,
      Permission.ORDER_VIEW
    );
    const enableTransfer = await PermissionService.getFeaturePermission(
      Feature.ENABLE_TRANSFER,
      Permission.TRANSFER_VIEW
    );
    const enableStock = await PermissionService.getFeaturePermission(
      Feature.ENABLE_STOCK_ENTRY,
      Permission.STOCK_ENTRY_VIEW
    );
    const enableWishList = await PermissionService.getFeaturePermission(
      Feature.ENABLE_WISH_LIST,
      Permission.WISHLIST_VIEW
    );
    const enableActivity = await PermissionService.getFeaturePermission(
      Feature.ENABLE_ACTIVITY,
      Permission.ACTIVITY_VIEW
    );
    const enableTicket = await PermissionService.getFeaturePermission(
      Feature.ENABLE_TICKET,
      Permission.TICKET_VIEW
    );
    const enableFine = await PermissionService.getFeaturePermission(
      Feature.ENABLE_FINE,
      Permission.FINE_VIEW
    );
    const enableLocation = await PermissionService.getFeaturePermission(
      Feature.ENABLE_LOCATION,
      Permission.LOCATION_VIEW
    );
    const enableCandidate = await PermissionService.getFeaturePermission(
      Feature.ENABLE_CANDIDATE,
      Permission.CANDIDATE_VIEW
    );
    const enableVisitor = await PermissionService.getFeaturePermission(
      Feature.ENABLE_VISITOR,
      Permission.VISITOR_VIEW
    );
    const enableReplenish = await PermissionService.getFeaturePermission(
      Feature.ENABLE_REPLENISHMENT,
      Permission.REPLENISH_VIEW
    );
    const enablePayment = await PermissionService.getFeaturePermission(
      Feature.ENABLE_PAYMENT,
      Permission.PAYMENT_VIEW
    );
    const enableInspection = await PermissionService.getFeaturePermission(
      Feature.ENABLE_INSPECTION,
      Permission.INSPECTION_VIEW
    );
    const enableUser = await PermissionService.getFeaturePermission(
      Feature.ENABLE_USER,
      Permission.USER_VIEW
    );
    const enableBills = await PermissionService.getFeaturePermission(
      Feature.ENABLE_BILL,
      Permission.BILL_VIEW
    );
    const enableLeads = await PermissionService.getFeaturePermission(
      Feature.ENABLE_LEAD,
      Permission.LEADS_VIEW
    );
    const enableAccounts = await PermissionService.getFeaturePermission(
      Feature.ENABLE_ACCOUNT,
      Permission.ACCOUNT_VIEW
    );
    const enableGatePass = await PermissionService.getFeaturePermission(
      Feature.ENABLE_GATE_PASS,
      Permission.GATE_PASS_VIEW
    );
    const enableCustomer = await PermissionService.getFeaturePermission(
      Feature.ENABLE_CUSTOMER,
      Permission.CUSTOMER_VIEW
    );
    const enablePurchaseOrder = await PermissionService.getFeaturePermission(
      Feature.ENABLE_PURCHASE_ORDER,
      Permission.PURCHASE_ORDER_VIEW
    );
    const enableSalary = await PermissionService.getFeaturePermission(
      Feature.ENABLE_SALARY,
      Permission.SALARY_VIEW
    );
    const enableLocationAllocation =
      await PermissionService.getFeaturePermission(
        Feature.ENABLE_LOCATION_ALLOCATION,
        Permission.LOCATION_ALLOCATION_VIEW
      );
    const enableDistribution = await PermissionService.getFeaturePermission(
      Feature.ENABLE_DISTRIBUTION,
      Permission.DISTRIBUTION_VIEW
    );
    const enableSettings = await PermissionService.getFeaturePermission(
      Feature.ENABLE_SETTING,
      Permission.SETTINGS_VIEW
    );
    const enableSync = await PermissionService.getFeaturePermission(
      Feature.ENABLE_SYNC,
      Permission.SYNC_VIEW
    );
    const enableRecurringTask = await PermissionService.getFeaturePermission(
      Feature.ENABLE_RECURRING_TASK,
      Permission.RECURRING_TASK_VIEW
    );
    const enableBulkOrder = await PermissionService.getFeaturePermission(
      Feature.ENABLE_BULK_ORDER,
      Permission.BULK_ORDER_VIEW
    );
    const enableContact = await PermissionService.getFeaturePermission(
      Feature.ENABLE_CONTACT,
      Permission.CONTACT_VIEW
    );
    setPermission({
      enableSales: enableSales,
      enablePurchase: enablePurchase,
      enableAttendance: enableAttendance,
      enableProducts: enableProducts,
      enableOrders: enableOrders,
      enableTransfer: enableTransfer,
      enableStock: enableStock,
      enableWishList: enableWishList,
      enableActivity: enableActivity,
      enableTicket: enableTicket,
      enableFine: enableFine,
      enableLocation: enableLocation,
      enableCandidate: enableCandidate,
      enableVisitor: enableVisitor,
      enableReplenish: enableReplenish,
      enablePayment: enablePayment,
      enableInspection: enableInspection,
      enableUser: enableUser,
      enableBills: enableBills,
      enableLeads: enableLeads,
      enableAccounts: enableAccounts,
      enableGatePass: enableGatePass,
      enableCustomer: enableCustomer,
      enablePurchaseOrder: enablePurchaseOrder,
      enableSalary: enableSalary,
      enableLocationAllocation: enableLocationAllocation,
      enableDistribution: enableDistribution,
      enableSettings: enableSettings,
      enableSync: enableSync,
      enableRecurringTask: enableRecurringTask,
      enableBulkOrder: enableBulkOrder,
      enableContact: enableContact,
    });

    await Device.isStatusBlocked((devicePendingStatus) => {
      setDevicePendingStatus(devicePendingStatus);
    });
  };

  // Render User Profile
  const _renderUserProfile = () => {
    return (
      <View style={{ ...styles.menu, backgroundColor: themeColor }}>
        <Text style={[styles.name, { color: textColor }]}>Menu</Text>
      </View>
    );
  };

  // Render Settings
  const _renderStore = () => {
    const { setSideMenuOpen } = props;
    return (
      <SideMenuCard
        onPress={() => {
          navigator.navigate("Location");
          setSideMenuOpen && setSideMenuOpen(false);
        }}
        name={"Location"}
        Icon="warehouse"
      />
    );
  };

  const _renderAccounts = () => {
    const { setSideMenuOpen } = props;
    return (
      <SideMenuCard
        onPress={() => {
          navigator.navigate("Accounts");
          setSideMenuOpen && setSideMenuOpen(false);
        }}
        name={"Vendors"}
        Icon={"bank"}
        MaterialCommunityIcon
      />
    );
  };

  const renderContactScreen = () => {
    const { setSideMenuOpen } = props;
    return (
      <SideMenuCard
        onPress={() => {
          navigator.navigate("ContactList");
          setSideMenuOpen && setSideMenuOpen(false);
        }}
        name={"Contacts"}
        Icon={"contacts"}
        MaterialCommunityIcon
      />
    );
  };

  const _renderUser = () => {
    const { setSideMenuOpen } = props;
    return (
      <SideMenuCard
        onPress={() => {
          navigator.navigate("Users");
          setSideMenuOpen && setSideMenuOpen(false);
        }}
        name={"Users"}
        Icon="user"
      />
    );
  };

  // Render Dashboard

  // Render Bill Entry
  const _renderBillEntry = () => {
    const { setSideMenuOpen } = props;
    return (
      <SideMenuCard
        onPress={() => {
          navigator.navigate("Order");
          setSideMenuOpen && setSideMenuOpen(false);
        }}
        name={"Sales"}
        Icon="receipt"
      />
    );
  };

  // render Products
  const _renderProducts = () => {
    const { setSideMenuOpen } = props;
    return (
      <SideMenuCard
        onPress={() => {
          navigator.navigate("BrandAndCategoryList");
          setSideMenuOpen && setSideMenuOpen(false);
        }}
        name={"Products"}
        Icon="box-open"
      />
    );
  };

  const _renderBills = () => {
    const { setSideMenuOpen } = props;
    return (
      <SideMenuCard
        onPress={() => {
          navigator.navigate("Bills");
          setSideMenuOpen && setSideMenuOpen(false);
        }}
        name={"Bills"}
        Icon="money-bill-wave-alt"
      />
    );
  };
  // Render Bill
  const _renderPurchase = () => {
    const { setSideMenuOpen } = props;
    return (
      <SideMenuCard
        onPress={() => {
          navigator.navigate("Purchase");
          setSideMenuOpen && setSideMenuOpen(false);
        }}
        name={"Purchases"}
        Icon="store"
      />
    );
  };

  const _renderPayments = () => {
    const { setSideMenuOpen } = props;
    return (
      <SideMenuCard
        onPress={() => {
          navigator.navigate("Payments");
          setSideMenuOpen && setSideMenuOpen(false);
        }}
        name={"Payments"}
        Icon="dollar-sign"
      />
    );
  };

  const _customer = () => {
    const { setSideMenuOpen } = props;
    return (
      <SideMenuCard
        onPress={() => {
          navigator.navigate("Customers");
          setSideMenuOpen && setSideMenuOpen(false);
        }}
        name={"Customer"}
        Icon={"user"}
      />
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: Color.NAVIGATION_BAR_BACKGROUND }}>
      {_renderUserProfile()}
      <View style={{ flex: 1 }}>
        <ScrollView style={{ height: "100%" }}>
          {permission?.enableAccounts && _renderAccounts()}
          {permission?.enablePurchase && _renderPurchase && _renderPurchase()}

          {permission?.enableBills && _renderBills && _renderBills()}
          {permission?.enableOrders &&
            !devicePendingStatus &&
            _renderBillEntry &&
            _renderBillEntry()}
          {permission?.enablePayment && _renderPayments() && _renderPayments()}

          {permission?.enableCustomer && _customer && _customer()}
          {permission?.enableContact &&
            renderContactScreen &&
            renderContactScreen()}

          {permission?.enableProducts &&
            !devicePendingStatus &&
            _renderProducts &&
            _renderProducts()}
          {permission?.enableUser && _renderUser && _renderUser()}
        </ScrollView>
        <VerticalSpace10 />
      </View>
    </View>
  );
};

export default Menu;
