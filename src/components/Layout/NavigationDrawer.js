import React, { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";

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
const homeIcon = require("../../assets/seller.png");
const productIcon = require("../../assets/box.png");
const customerIcon = require("../../assets/customer-review.png");
const userIcon = require("../../assets/profile.png");
const paymentIcon = require("../../assets/payment.png");
const saleIcon = require("../../assets/sale.png");
const purchaseIcon = require("../../assets/online-shop.png");
const locationIcon = require("../../assets/location.png");

const Menu = (props) => {
  useEffect(() => {
    getPermission();
    getThemeColor();
  }, []);
  const route = useRoute();
  const routeNameArray = route.name.split("/");
  const [themeColor, setThemeColor] = useState(Color.WHITE);
  const [textColor, setTextColor] = useState(Color.BLACK);
  const [devicePendingStatus, setDevicePendingStatus] = useState(false);
  const [permission, setPermission] = useState({});
  const isFocused = useIsFocused();
  const [otpNotification, setOtpNotification] = useState(false);

  let navigator = props?.route?.params?.navigator;

  const getThemeColor = async () => {
    try {
      // await settingService.getByName(
      //   Setting.PORTAL_HEADER_COLOR,
      //   (err, response) => {
      //     setThemeColor(response);
      //   }
      // );
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
    const enablePurchase = await PermissionService.getFeaturePermission(
      Feature.ENABLE_PURCHASE,
      Permission.PURCHASE_VIEW
    );

    const enableProducts = await PermissionService.getFeaturePermission(
      Feature.ENABLE_PRODUCT,
      Permission.PRODUCT_VIEW
    );
    const enableOrders = await PermissionService.getFeaturePermission(
      Feature.ENABLE_ORDER,
      Permission.ORDER_VIEW
    );

    const enablePayment = await PermissionService.getFeaturePermission(
      Feature.ENABLE_PAYMENT,
      Permission.PAYMENT_VIEW
    );

    const enableUser = await PermissionService.getFeaturePermission(
      Feature.ENABLE_USER,
      Permission.USER_VIEW
    );

    const enableAccounts = await PermissionService.getFeaturePermission(
      Feature.ENABLE_ACCOUNT,
      Permission.ACCOUNT_VIEW
    );

    const enableCustomer = await PermissionService.getFeaturePermission(
      Feature.ENABLE_CUSTOMER,
      Permission.CUSTOMER_VIEW
    );

    const enableContact = await PermissionService.getFeaturePermission(
      Feature.ENABLE_CONTACT,
      Permission.CONTACT_VIEW
    );
    setPermission({
      enablePurchase: enablePurchase,
      enableProducts: enableProducts,
      enableOrders: enableOrders,
      enablePayment: enablePayment,
      enableUser: enableUser,
      enableAccounts: enableAccounts,
      enableCustomer: enableCustomer,
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
        imageSource={locationIcon}
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
        imageSource={homeIcon}
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
        imageSource={"contacts"}
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
        imageSource={userIcon}
      />
    );
  };

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
        imageSource={saleIcon}
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
        imageSource={productIcon}
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
        imageSource={purchaseIcon}
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
        imageSource={paymentIcon}
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
        imageSource={customerIcon}
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

          {permission?.enableOrders &&
            !devicePendingStatus &&
            _renderBillEntry &&
            _renderBillEntry()}
          {permission?.enablePayment && _renderPayments() && _renderPayments()}

          {permission?.enableCustomer && _customer && _customer()}
          {permission?.enableContact &&
            renderContactScreen &&
            renderContactScreen()}
          {_renderStore && _renderStore()}
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
