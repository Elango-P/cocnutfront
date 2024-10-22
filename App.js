import React from "react";

import { NativeModules } from "react-native";

import { NavigationContainer, useRoute } from "@react-navigation/native";

import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { SafeAreaProvider } from "react-native-safe-area-context";

import Login from "./src/views/Login";

import Signup from "./src/views/Signup";

import Dashboard from "./src/views/dashboard/Dashboard";

import StockEntry from "./src/views/stockEntry";

import ProductList from "./src/views/stockEntry/ProductList";

import Attendance from "./src/views/attendance";

import AttendanceForm from "./src/views/attendance/AttendanceForm";

import AttendanceDetail from "./src/views/attendance/AttendanceForm";

import Order from "./src/views/order";

import Products from "./src/views/product";

import AddProducts from "./src/views/product/AddProduct";

import ProductDetails from "./src/views/product/Detail";

import OrderProductList from "./src/views/order/OrderProductList";
import OrderTypeSelect from "./src/views/order/OrderTypeSelect";

import Purchase from "./src/views/Purchase";

import PurchaseForm from "./src/views/Purchase/components/PurchaseForm";

import OrderAddProduct from "./src/views/order/AddProduct";

import ShiftSelector from "./src/views/attendance/ShiftSelector";

import Activity from "./src/views/activity/Index";

import Sync from "./src/components/Sync";

import Media from "./src/components/MediaList";

import UserSelector from "./src/views/order/components/UserSelector";

import PurchaseMedia from "./src/views/Purchase/components/Media";

import OwnerSelector from "./src/views/stockEntry/components/OwnerSelection";

const { BluetoothManager } = NativeModules;

let BluetoothSetting;

if (BluetoothManager) {
  BluetoothSetting = require("./src/views/settings/Bluetooth");
}

import PurchaseAdd from "./src/views/Purchase/PurchaseAdd";

import Settings from "./src/views/settings";

import StoreSetting from "./src/views/settings/Location";

import ActivityUser from "./src/views/activity/Components/ActivityUser";

import Location from "./src/views/location";

import LocationDetail from "./src/views/location/detail";

import ChatUsers from "./src/views/Messages";

import NewChat from "./src/views/Messages/newMessage";

import NoInternetConnection from "./src/components/NoInternetScreen";

import Payments from "./src/views/Payments";

import ForgotPassword from "./src/views/ForgotPassword";

const Stack = createNativeStackNavigator();

import { navigationRef } from "./src/lib/RootNavigation";

import Reports from "./src/views/reports";

import LocationSelector from "./src/views/location/LocationSelector";

import Invoice from "./src/views/order/Invoice";

import Users from "./src/views/Users";

import UserForm from "./src/views/Users/UserForm";

import PaymentForm from "./src/views/Payments/PaymentForm";

import Bills from "./src/views/Bills";

import BillForm from "./src/views/Bills/BillForm";

import MediaUpload from "./src/components/MediaUpload";

import OrderSalesSettlementDiscrepancyReport from "./src/views/OrderSalesSettlementDiscrepancyReport";

import PurchaseRecommendationReport from "./src/views/PurchaseRecommendationReport";

import Report from "./src/views/Report/Reports";

import AttendanceReport from "./src/views/Report/AttendanceReport";

import OrderProductReport from "./src/views/Report/OrderProductReport";

import OrderSummaryReport from "./src/views/Report/OrderSummaryReport";

import OrderProduct from "./src/views/orderProduct/orderProduct";

import Accounts from "./src/views/Accounts/Accounts";

import AccountForm from "./src/views/Accounts/AccountForm";

import BulkOrder from "./src/views/order/BulkOrder/BulkOrder";

import BulkOrderCart from "./src/views/order/BulkOrder/BulkOrderCart";

import Customers from "./src/views/Customers";
import AccountAdd from "./src/views/Accounts/AccountAdd";
import TransferProductReportUserWise from "./src/views/Report/transferProductReportUserWise";
import StockEntryReport from "./src/views/Report/StockEntryReport";
import LocationConfirmation from "./src/views/attendance/LocationConfirmation";
import PriceForm from "./src/views/product/PriceForm";
import MessagePage from "./src/views/Messages/detail";
import BrandAndCategoryList from "./src/views/product/BrandAndCategoryList";
import CameraScreen from "./src/components/CameraScreen";
import SalaryListPage from "./src/views/Salary";
import SalaryDetailPage from "./src/views/Salary/detailPage";
import AttendanceLocationSelector from "./src/views/attendance/components/LocationSelector";
import BottomToolBar from "./src/components/Layout/bottomToolBar";
import Menu from "./src/components/Layout/NavigationDrawer";
import ActivityTypeScreen from "./src/views/activity/Components/ActivityScreen";

import Home from "./src/views/home";

import HomeProductList from "./src/views/home/ProductList";

import HomeProductCart from "./src/views/home/ProductCart";

import MyAccount from "./src/views/customerDashboard";
import MyOrder from "./src/views/customerDashboard/MyOrder";
import EditAccount from "./src/views/customerDashboard/EditAccount";
import AddCustomerAddress from "./src/views/customerDashboard/AddAddress";
import CustomerAddressList from "./src/views/customerDashboard/AddressList";
import CustomerOrderProductList from "./src/views/customerDashboard/OrderProductList";
import AppID from "./src/lib/AppID";
import JobSelector from "./src/components/JobSelector";
import SuccessScreen from "./src/components/SuccessScreen";
import ReplenishmentReport from "./src/views/Report/ReplenishmentReport";
import asyncStorageService from "./src/services/AsyncStorageService";
import AsyncStorage from "./src/helper/AsyncStorage";
import { useState } from "react";
import { useEffect } from "react";
import ApplyLeave from "./src/views/attendance/ApplyLeave";
import invoiceProductList from "./src/views/Invoice/invoiceProductList";
import LocationAdd from "./src/views/location/locationAdd";
import ContactList from "./src/views/contact";
import ContactForm from "./src/views/contact/components/ContactForm";
import EditProfile from "./src/views/userProfile";
import AddressForm from "./src/views/userProfile/AddressForm";
import AttendanceMonthWiseList from "./src/views/attendance/components/AttendanceMonthWiseList";
import OTPScreen from "./src/components/OtpScreen";

export default function App(props) {
  const [initialRoute, setInitialRoute] = useState("Login");

  useEffect(() => {
    const checkSessionToken = async () => {
      const sessionToken = await asyncStorageService.getSessionToken(
        AsyncStorage.SESSION_TOKEN
      );
      if (sessionToken) {
        setInitialRoute("Dashboard");
      }
    };
    checkSessionToken();
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            animation: "none",
          }}
          initialRouteName={AppID.isZunoMart() ? "Home" : initialRoute}
        >
          <Stack.Screen name="Home" component={Home} />

          <Stack.Screen name="HomeProductList" component={HomeProductList} />
          <Stack.Screen name="OtpScreen" component={OTPScreen} />

          <Stack.Screen name="HomeProductCart" component={HomeProductCart} />

          <Stack.Screen name="MyAccount" component={MyAccount} />

          <Stack.Screen name="EditAccount" component={EditAccount} />

          <Stack.Screen
            name="AddCustomerAddress"
            component={AddCustomerAddress}
          />

          <Stack.Screen
            name="CustomerAddressList"
            component={CustomerAddressList}
          />

          <Stack.Screen
            name="CustomerOrderProductList"
            component={CustomerOrderProductList}
          />

          <Stack.Screen name="MyOrder" component={MyOrder} />

          {/* STORE ROUTES */}
          <Stack.Screen name="Login" component={Login} />

          <Stack.Screen name="Signup" component={Signup} />

          <Stack.Screen name="ForgotPassword" component={ForgotPassword} />

          <Stack.Screen name="Dashboard" component={Dashboard} />

          <Stack.Screen name="NoInternet" component={NoInternetConnection} />

          <Stack.Screen name="StockEntry" component={StockEntry} />

          <Stack.Screen name="StockEntry/Product" component={ProductList} />

          <Stack.Screen
            name="StockEntry/OwnerSelect"
            component={OwnerSelector}
          />

          {/* Attendance */}
          <Stack.Screen name="Attendance" component={Attendance} />

          <Stack.Screen name="/Attendance/form" component={AttendanceForm} />

          <Stack.Screen
            name="/Attendance/Detail"
            component={AttendanceDetail}
          />

          <Stack.Screen name="/Attendance/applyLeave" component={ApplyLeave} />

          <Stack.Screen
            name="LocationConfirmation"
            component={LocationConfirmation}
          />

          {/* Products  */}
          <Stack.Screen name="Products" component={Products} />

          <Stack.Screen
            name="BrandAndCategoryList"
            component={BrandAndCategoryList}
          />

          <Stack.Screen name="Products/Add" component={AddProducts} />

          <Stack.Screen name="Products/Details" component={ProductDetails} />

          {/* Order  */}
          <Stack.Screen name="Order/ProductList" component={OrderProductList} />
          <Stack.Screen
            name="Order/OrderTypeSelect"
            component={OrderTypeSelect}
          />

          <Stack.Screen
            name="Order/OrderProductAdd"
            component={OrderAddProduct}
          />

          <Stack.Screen name="Order" component={Order} />

          <Stack.Screen name="shiftSelect" component={ShiftSelector} />

          <Stack.Screen name="Order/userSelect" component={UserSelector} />

          <Stack.Screen name="Order/Invoice" component={Invoice} />

          <Stack.Screen name="BulkOrder" component={BulkOrder} />

          <Stack.Screen name="BulkOrderCart" component={BulkOrderCart} />

          {/* {Order Product} */}

          <Stack.Screen name="OrderProduct" component={OrderProduct} />

          <Stack.Screen name="MediaUpload" component={MediaUpload} />

          {/* Bill */}
          <Stack.Screen name="Purchase" component={Purchase} />

          <Stack.Screen name="PurchaseForm" component={PurchaseForm} />

          <Stack.Screen name="PurchaseAdd" component={PurchaseAdd} />

          <Stack.Screen name="PurchaseMedia" component={PurchaseMedia} />

          {/* {Attachment} */}

          <Stack.Screen name="MediaList" component={Media} />

          {/* Activity */}
          <Stack.Screen name="ActivityList" component={Activity} />

          <Stack.Screen name="ActivityUserSelector" component={ActivityUser} />

          <Stack.Screen name="Sync" component={Sync} />

          <Stack.Screen
            name="/ActivityTypeScreen"
            component={ActivityTypeScreen}
          />

          {/* Price */}
          <Stack.Screen name="PriceForm" component={PriceForm} />

          {/* Settings */}
          <Stack.Screen name="Settings" component={Settings} />

          <Stack.Screen name="Users" component={Users} />
          <Stack.Screen name="UserForm" component={UserForm} />

          {/* {Bills} */}

          <Stack.Screen name="Bills" component={Bills} />
          <Stack.Screen name="BillForm" component={BillForm} />

          {/* {OrderSales Report} */}

          <Stack.Screen
            name="OrderSalesSettlementDiscrepancyReport"
            component={OrderSalesSettlementDiscrepancyReport}
          />

          <Stack.Screen
            name="PurchaseRecommendationReport"
            component={PurchaseRecommendationReport}
          />

          {/* Payments */}
          <Stack.Screen name="Payments" component={Payments} />

          <Stack.Screen name="Payments/Form" component={PaymentForm} />

          {/* Accounts */}
          <Stack.Screen name="Accounts" component={Accounts} />

          <Stack.Screen name="AccountForm" component={AccountForm} />

          <Stack.Screen name="AccountAdd" component={AccountAdd} />

          {/* Customers */}
          <Stack.Screen name="Customers" component={Customers} />

          {/* Sub Settings */}
          {BluetoothSetting && (
            <Stack.Screen
              name="Bluetooth/Setting"
              component={BluetoothSetting}
            />
          )}

          <Stack.Screen name="Settings/SelectStore" component={StoreSetting} />

          <Stack.Screen name="Location" component={Location} />

          <Stack.Screen name="LocationAdd" component={LocationAdd} />

          <Stack.Screen name="StoreDetail" component={LocationDetail} />

          <Stack.Screen name="Reports" component={Reports} />

          <Stack.Screen name="Messages/Detail" component={MessagePage} />

          <Stack.Screen name="Messages" component={ChatUsers} />

          <Stack.Screen name="Messages/New" component={NewChat} />

          <Stack.Screen name="StoreSelector" component={LocationSelector} />

          <Stack.Screen name="Report" component={Report} />

          <Stack.Screen name="AttendanceReport" component={AttendanceReport} />

          <Stack.Screen
            name="OrderProductReport"
            component={OrderProductReport}
          />

          <Stack.Screen
            name="OrderSummaryReport"
            component={OrderSummaryReport}
          />

          <Stack.Screen
            name="TransferProductReportUserWise"
            component={TransferProductReportUserWise}
          />

          <Stack.Screen name="StockEntryReport" component={StockEntryReport} />
          <Stack.Screen
            name="Invoice/invoiceProductList"
            component={invoiceProductList}
          />

          <Stack.Screen
            name="AttendanceMonthWiseList"
            component={AttendanceMonthWiseList}
          />

          {/* Gate Pass */}
          <Stack.Screen name="CameraScreen" component={CameraScreen} />
          <Stack.Screen name="Salary" component={SalaryListPage} />
          <Stack.Screen name="SalaryDetailPage" component={SalaryDetailPage} />
          <Stack.Screen
            name="AttendanceLocationSelector"
            component={AttendanceLocationSelector}
          />
          <Stack.Screen name="Menu" component={Menu} />

          {/* ✴---Jobs---✴ */}
          <Stack.Screen name="jobSelector" component={JobSelector} />
          <Stack.Screen name="SuccessScreen" component={SuccessScreen} />
          <Stack.Screen
            name="ReplenishmentReport"
            component={ReplenishmentReport}
          />

          {/* ✴---Contact---✴ */}
          <Stack.Screen name="ContactList" component={ContactList} />
          <Stack.Screen name="ContactForm" component={ContactForm} />

          <Stack.Screen name="editProfile" component={EditProfile} />
          <Stack.Screen name="addressForm" component={AddressForm} />
        </Stack.Navigator>
        <BottomToolBar {...props} />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
