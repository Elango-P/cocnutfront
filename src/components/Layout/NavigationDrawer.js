import React, { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  View
} from "react-native";


import AsyncStorage from "../../lib/AsyncStorage";


import Permission from "../../helper/Permission";

import { useIsFocused, useNavigation, useRoute } from "@react-navigation/native";

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
  }, [])
  const navigation = useNavigation();
  const route = useRoute();
  const routeNameArray = route.name.split('/');
  const [themeColor,setThemeColor] = useState(Color.WHITE);
  const [textColor,setTextColor] = useState(Color.WHITE)
  const [devicePendingStatus, setDevicePendingStatus]=useState(false)
  const [permission, setPermission]=useState({})
  const isFocused = useIsFocused();
  const [otpNotification, setOtpNotification]=useState(false)

  const Logout = async (setSideMenuOpen) => {
    await AsyncStorage.clearAll();
    navigation.navigate("Login");
    setSideMenuOpen && setSideMenuOpen(false)
  };

  let navigator= props?.route?.params?.navigator

  const getThemeColor = async () => {
    try {
          await settingService.getByName(Setting.PORTAL_HEADER_COLOR,(err,response)=>{
            setThemeColor(response)
          })
          await settingService.getByName(Setting.PORTAL_HEADER_TEXT_COLOR,(err,response)=>{
            setTextColor(response)
          })
          await settingService.getByName(Setting.OTP_REQUIRED_FOR_SALARY,(err,response)=>{
            setOtpNotification(response)
          })
        
        
    } catch (error) {
        console.error("Error retrieving settings:", error);
        return null;
    }
};



  const getPermission = async () => {

    const enableSales = await PermissionService.getFeaturePermission(Feature.ENABLE_SALE_SETTLEMENT,Permission.SALE_SETTLEMENT_VIEW);
    const enablePurchase = await PermissionService.getFeaturePermission(Feature.ENABLE_PURCHASE,Permission.PURCHASE_VIEW);
    const enableAttendance = await PermissionService.getFeaturePermission(Feature.ENABLE_ATTENDANCE,Permission.ATTENDANCE_VIEW);
    const enableProducts = await PermissionService.getFeaturePermission(Feature.ENABLE_PRODUCT,Permission.PRODUCT_VIEW);
    const enableOrders = await PermissionService.getFeaturePermission(Feature.ENABLE_ORDER,Permission.ORDER_VIEW);
    const enableTransfer = await PermissionService.getFeaturePermission(Feature.ENABLE_TRANSFER,Permission.TRANSFER_VIEW);
    const enableStock = await PermissionService.getFeaturePermission(Feature.ENABLE_STOCK_ENTRY,Permission.STOCK_ENTRY_VIEW);
    const enableWishList = await PermissionService.getFeaturePermission(Feature.ENABLE_WISH_LIST,Permission.WISHLIST_VIEW);
    const enableActivity = await PermissionService.getFeaturePermission(Feature.ENABLE_ACTIVITY,Permission.ACTIVITY_VIEW);
    const enableTicket = await PermissionService.getFeaturePermission(Feature.ENABLE_TICKET,Permission.TICKET_VIEW);
    const enableFine = await PermissionService.getFeaturePermission(Feature.ENABLE_FINE,Permission.FINE_VIEW);
    const enableLocation = await PermissionService.getFeaturePermission(Feature.ENABLE_LOCATION,Permission.LOCATION_VIEW);
    const enableCandidate = await PermissionService.getFeaturePermission(Feature.ENABLE_CANDIDATE,Permission.CANDIDATE_VIEW);
    const enableVisitor = await PermissionService.getFeaturePermission(Feature.ENABLE_VISITOR,Permission.VISITOR_VIEW);
    const enableReplenish = await PermissionService.getFeaturePermission(Feature.ENABLE_REPLENISHMENT,Permission.REPLENISH_VIEW);
    const enablePayment = await PermissionService.getFeaturePermission(Feature.ENABLE_PAYMENT,Permission.PAYMENT_VIEW);
    const enableInspection = await PermissionService.getFeaturePermission(Feature.ENABLE_INSPECTION,Permission.INSPECTION_VIEW);
    const enableUser = await PermissionService.getFeaturePermission(Feature.ENABLE_USER,Permission.USER_VIEW);
    const enableBills = await PermissionService.getFeaturePermission(Feature.ENABLE_BILL,Permission.BILL_VIEW);
    const enableLeads = await PermissionService.getFeaturePermission(Feature.ENABLE_LEAD,Permission.LEADS_VIEW);
    const enableAccounts = await PermissionService.getFeaturePermission(Feature.ENABLE_ACCOUNT,Permission.ACCOUNT_VIEW);
    const enableGatePass = await PermissionService.getFeaturePermission(Feature.ENABLE_GATE_PASS,Permission.GATE_PASS_VIEW);
    const enableCustomer = await PermissionService.getFeaturePermission(Feature.ENABLE_CUSTOMER,Permission.CUSTOMER_VIEW);
    const enablePurchaseOrder = await PermissionService.getFeaturePermission(Feature.ENABLE_PURCHASE_ORDER,Permission.PURCHASE_ORDER_VIEW);
    const enableSalary = await PermissionService.getFeaturePermission(Feature.ENABLE_SALARY,Permission.SALARY_VIEW);
    const enableLocationAllocation = await PermissionService.getFeaturePermission(Feature.ENABLE_LOCATION_ALLOCATION,Permission.LOCATION_ALLOCATION_VIEW);
    const enableDistribution = await PermissionService.getFeaturePermission(Feature.ENABLE_DISTRIBUTION,Permission.DISTRIBUTION_VIEW);
    const enableSettings = await PermissionService.getFeaturePermission(Feature.ENABLE_SETTING,Permission.SETTINGS_VIEW);
    const enableSync = await PermissionService.getFeaturePermission(Feature.ENABLE_SYNC,Permission.SYNC_VIEW);
    const enableRecurringTask = await PermissionService.getFeaturePermission(Feature.ENABLE_RECURRING_TASK,Permission.RECURRING_TASK_VIEW);
    const enableBulkOrder = await PermissionService.getFeaturePermission(Feature.ENABLE_BULK_ORDER,Permission.BULK_ORDER_VIEW);
    const enableContact = await PermissionService.getFeaturePermission(Feature.ENABLE_CONTACT,Permission.CONTACT_VIEW);
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
      enableContact: enableContact
    })

    await Device.isStatusBlocked((devicePendingStatus)=>{
      setDevicePendingStatus(devicePendingStatus)
  });
  }

  // Render User Profile
  const _renderUserProfile = () => {
    return (
      <View
      style={{ ...styles.menu, backgroundColor: themeColor }}
      >
        <Text style={[styles.name,{color: textColor}]}>Menu</Text>
        
      </View>
    );
  };

  const syncNavigation = async () => {
    navigation.navigate("Sync", { syncing: true });
  }


  // Render Settings
  const _renderStore = () => {
    const {  setSideMenuOpen } = props;
    return (
      <SideMenuCard
        onPress={() => {
          navigator.navigate("Location")
          setSideMenuOpen && setSideMenuOpen(false)
        }}
        name={"Location"}
        Icon="warehouse"
      />
    );
  };

  const locationAllocation = () => {
    const {  setSideMenuOpen } = props;
    return (
      <SideMenuCard
        onPress={() => {
          navigator.navigate("LocationAllocation")
          setSideMenuOpen && setSideMenuOpen(false)
        }}
        name={"Location Allocation"}
        Icon="location-arrow"
      />
    );
  };

  const _renderOrderSalesSettlementDiscrepancyReport = () => {
    const { setSideMenuOpen } = props;
    return (
      <SideMenuCard
        onPress={() => {
          navigator.navigate("OrderSalesSettlementDiscrepancyReport")
          setSideMenuOpen && setSideMenuOpen(false)
        }}
        name={"Order SalesSelttement Discrepancy Report"}
        Icon="list"
      />
    );
  };

  // Render Stocks
  const _renderStocks = () => {
    const { setSideMenuOpen } = props;
    return (
      <SideMenuCard
        onPress={() => {
          navigator.navigate("StockEntry")
          setSideMenuOpen && setSideMenuOpen(false)
        }}
        name={"Stock Entry"}
        Icon="list"
      />
    );
  };

  const _renderFine = () => {
    const { setSideMenuOpen } = props;
    return (
      <SideMenuCard
        onPress={() => {
          navigator.navigate("Fine")
          setSideMenuOpen && setSideMenuOpen(false)
        }}
        name={"Fines"}
        Icon={"money-bill-alt"}
        
      />
    );
  };

  // Bonus Menu
  const _renderBonus = () => {
    const { setSideMenuOpen } = props;
    return (
      <SideMenuCard
        onPress={() => {
          navigator.navigate("Bonus")
          setSideMenuOpen && setSideMenuOpen(false)
        }}
        name={"Bonus"}
        Icon={"money-bill-alt"}
        
      />
    );
  };
  
  const _renderRecurringTask = () => {
    const { setSideMenuOpen } = props;
    return (
      <SideMenuCard
        onPress={() => {
          navigator.navigate("RecurringTask")
          setSideMenuOpen && setSideMenuOpen(false)
        }}
        name={"Recurring Task"}
        Icon={"library"}
        MaterialCommunityIcon
      />
    );
  };
  const _renderLeads = () => {
    const { setSideMenuOpen } = props;
    return (
      <SideMenuCard
        onPress={() => {
          navigator.navigate("Lead")
          setSideMenuOpen && setSideMenuOpen(false)
        }}
        name={"Leads"}
        Icon={"address-book"}
      />
    );
  };

  const _renderGatePass = () => {
    const { setSideMenuOpen } = props;
    return (
      <SideMenuCard
        onPress={() => {
          navigator.navigate("GatePass")
          setSideMenuOpen && setSideMenuOpen(false)
        }}
        name={"Gate Pass"}
        Icon={"address-book"}
      />
    );
  };

  const _renderAccounts = () => {
    const { setSideMenuOpen } = props;
    return (
      <SideMenuCard
        onPress={() => {
          navigator.navigate("Accounts")
          setSideMenuOpen && setSideMenuOpen(false)
        }}
        name={"Accounts"}
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
          navigator.navigate("ContactList")
          setSideMenuOpen && setSideMenuOpen(false)
        }}
        name={"Contacts"}
        Icon={"contacts"}
        MaterialCommunityIcon
      />
    );
  };

  const _renderInspection = () => {
    const { setSideMenuOpen } = props;
    return (
      <SideMenuCard
        onPress={() => {
          navigator.navigate("Inspection")
          setSideMenuOpen && setSideMenuOpen(false)
        }}
        name={"Inspection"}
        Icon={"note"}
        MaterialCommunityIcon
      />
    );
  };

  const _renderTicket = () => {
    const { setSideMenuOpen } = props;
    return (
      <SideMenuCard
        onPress={() => {
          navigator.navigate("Ticket")
          setSideMenuOpen && setSideMenuOpen(false)
        }}
        name={"Tickets"}
        Icon="ticket-alt"
      />
    );
  };
  const _renderUser = () => {
    const { setSideMenuOpen } = props;
    return (
      <SideMenuCard
        onPress={() => {
          navigator.navigate("Users")
          setSideMenuOpen && setSideMenuOpen(false)
        }}
        name={"Users"}
        Icon="user"
      />
    );
  };
  const _renderVisitor = () => {
    const { setSideMenuOpen } = props;
    return (
      <SideMenuCard
        onPress={() => {
          navigator.navigate("Visitor")
          setSideMenuOpen && setSideMenuOpen(false)
        }}
        name={"Visitors"}
        Icon="user-tie"
      />
    );
  };
  const _renderCandidate = () => {
    const { setSideMenuOpen } = props;
    return (
      <SideMenuCard
        onPress={() => {
          navigator.navigate("Candidate")
          setSideMenuOpen && setSideMenuOpen(false)
        }}
        name={"Candidate"}
        Icon="user-tie"
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
          navigator.navigate("Order")
          setSideMenuOpen && setSideMenuOpen(false)
        }}
        name={"Orders"}
        Icon="receipt"
      />
    );
  };


  const _renderSalary = () => {
    const { setSideMenuOpen } = props;
    return (
      <SideMenuCard
        onPress={() => {
          const path = 'Salary'; // Define the path you want to pass
         
          if (otpNotification) {
            navigator.navigate("OtpScreen", { path }); // Navigate to OTP screen if any notification is allowed
          } else {
            navigator.navigate("Salary")
          }
          setSideMenuOpen && setSideMenuOpen(false)
        }}
        name={"Salary"}
        Icon="cash"
        MaterialCommunityIcon
      />
    );
  };

  // Render Logout
  
  // Render Logout
  const _renderAttendance = () => {
    const { setSideMenuOpen } = props;
    return (
      <SideMenuCard
        onPress={() => {
          navigator.navigate("Attendance")
          setSideMenuOpen && setSideMenuOpen(false)
        }}
        name={"Attendance"}
        Icon={"user"}
      >


      </SideMenuCard>


    );
  };

  // Render Logout
  const _renderInventoryTransfer = () => {
    const { setSideMenuOpen } = props;
    return (
      <SideMenuCard
        onPress={() => {
          navigator.navigate("inventoryTransfer")
          setSideMenuOpen && setSideMenuOpen(false)
        }}
        name={"Transfer"}
        Icon="truck-moving"
      />
    );
  };
  const _renderDistribution = () => {
    const { setSideMenuOpen } = props;
    return (
      <SideMenuCard
        onPress={() => {
          navigator.navigate("distributionTransfer")
          setSideMenuOpen && setSideMenuOpen(false)
        }}
        name={"Distribution"}
        Icon="dolly"
        MaterialCommunityIcon
      />
    );
  };

  // render Products
  const _renderProducts = () => {
    const { setSideMenuOpen } = props;
    return (
      <SideMenuCard
        onPress={() => {
          navigator.navigate("BrandAndCategoryList")
          setSideMenuOpen && setSideMenuOpen(false)
        }}
        name={"Products"}
        Icon="box-open"
      />
    );
  };

  // render Products
  const _renderStoreReplenish = () => {
    const { setSideMenuOpen } = props;
    return (
      <SideMenuCard
        onPress={() => {
          navigator.navigate("StoreReplenish")
          setSideMenuOpen && setSideMenuOpen(false)
        }}
        name={"Store Replenish"}
        Icon="warehouse"
        MaterialCommunityIcon
      />
    );
  };

  // render Products
  const _renderReplenishProducts = () => {
    const { setSideMenuOpen } = props;
    return (
      <SideMenuCard
        onPress={() => {
          navigator.navigate("ReplenishmentProduct")
          setSideMenuOpen && setSideMenuOpen(false)
        }}
        name={"Replenish Products"}
        Icon="transfer"
        MaterialCommunityIcon
      />
    );
  };

  // render Products
  const _renderWishList = () => {
    const { setSideMenuOpen } = props;
    return (

      <SideMenuCard
        Icon="cart-remove"
        onPress={() => {
          navigator.navigate("WishListProducts")
          setSideMenuOpen && setSideMenuOpen(false)
        }}
        name="Wishlist"
        MaterialCommunityIcon
      />
    );
  };

  // render sync
  const _renderSync = () => {
    const { setSideMenuOpen } = props;
    return (

      <SideMenuCard
        Icon="sync"
        onPress={async () => {
          await syncNavigation()
          setSideMenuOpen && setSideMenuOpen(false)
        }}
        name="Sync"
        MaterialCommunityIcon
      />
    );
  };

  // render sync
  const _renderSale = () => {
    const { setSideMenuOpen } = props;
    return (

      <SideMenuCard
        Icon="file-invoice"
        onPress={() => {
          navigator.navigate("SalesSettlement")
          setSideMenuOpen && setSideMenuOpen(false)
        }}
        name="Sales Settlement"
      />
    );
  };




  const _renderBills = () => {
    const { setSideMenuOpen } = props;
    return (
      <SideMenuCard
        onPress={() => {
          navigator.navigate("Bills")
          setSideMenuOpen && setSideMenuOpen(false)
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
          navigator.navigate("Purchase")
          setSideMenuOpen && setSideMenuOpen(false)
        }}
        name={"Purchases"}
        Icon="store"
      />
    );
  };

  const _renderPurchaseOrder = () => {
    const { setSideMenuOpen } = props;
    return (
      <SideMenuCard
        onPress={() => {
          navigator.navigate("PurchaseOrder")
          setSideMenuOpen && setSideMenuOpen(false)
        }}
        name={"Purchase Orders"}
        Icon="cart"
        MaterialCommunityIcon
      />
    );
  };
  const _renderPayments = () => {
    const { setSideMenuOpen } = props;
    return (
      <SideMenuCard
        onPress={() => {
          navigator.navigate("Payments")
          setSideMenuOpen && setSideMenuOpen(false)
        }}
        name={"Payments"}
        Icon="dollar-sign"
      />
    );
  };
  const _renderActivity = () => {
    const { setSideMenuOpen } = props;
    return (
      <SideMenuCard
        onPress={() => {
          navigator.navigate("ActivityList")
          setSideMenuOpen && setSideMenuOpen(false)
        }}
        name={"Activity"}
        Icon={"chart-line"}
        MaterialCommunityIcon
      />
    );
  };
  const _customer = () => {
    const { setSideMenuOpen } = props;
    return (
      <SideMenuCard
        onPress={() => {
          navigator.navigate("Customers")
          setSideMenuOpen && setSideMenuOpen(false)
        }}
        name={"Customer"}
        Icon={"user"}
      />
    );
  };

  const _renderDivider = () => {
    return (
      <View style={{ backgroundColor: "gray", height: 0.5, marginTop: 10 }} />
    );
  };


  // render sync
  const _renderSettings = () => {
    const { setSideMenuOpen } = props;
    return (
      <SideMenuCard
        Icon="cog-outline"
        onPress={() => {
          navigator.navigate("Settings")
          setSideMenuOpen && setSideMenuOpen(false)
        }}
        name="Settings"
        MaterialCommunityIcon
      />
    );
  };


  // Render Order Report
  const _renderOrderReports = () => {
    const { setSideMenuOpen } = props;
    return (
      <SideMenuCard
        onPress={() => {
          navigator.navigate("Reports")
          setSideMenuOpen && setSideMenuOpen(false)
        }}
        name={"Order Report"}
        Icon="list"
      />
    );
  };

  const _renderBulkOrder = () => {
    const { setSideMenuOpen } = props;
    return (
      <SideMenuCard
        onPress={() => {
          navigator.navigate("CustomerSelector",{
            reDirectUrl: "BulkOrder"
          })
          setSideMenuOpen && setSideMenuOpen(false)
        }}
        name={"Bulk Order"}
        Icon="cart"
        MaterialCommunityIcon={true}
      />
    );
  };


  return (
    <View style={{ flex: 1, backgroundColor: Color.NAVIGATION_BAR_BACKGROUND }}>
      {_renderUserProfile()}
      <View style={{ flex: 1 }}>
        <ScrollView style={{ height: "100%" }}>
          {permission?.enableAccounts && _renderAccounts()}
          {permission?.enableActivity && _renderActivity && _renderActivity()}
          {permission?.enableAttendance && _renderAttendance && _renderAttendance()}
          {permission?.enableBills && _renderBills &&_renderBills()}
          {permission?.enableBills && _renderBonus &&_renderBonus()}
          {permission?.enableBulkOrder && _renderBulkOrder()}
          {permission?.enableCandidate && _renderCandidate()}
          {permission?.enableCustomer && _customer && _customer()}
          {permission?.enableContact && renderContactScreen && renderContactScreen()}
          {permission?.enableDistribution && _renderDistribution && _renderDistribution() }
          {permission?.enableFine && _renderFine && _renderFine()}
          {permission?.enableGatePass && _renderGatePass && _renderGatePass()}
          {permission?.enableInspection && _renderInspection && _renderInspection()}
          {permission?.enableLeads && _renderLeads && _renderLeads()}
          {permission?.enableLocation && _renderStore()}
          {permission?.enableLocationAllocation &&  locationAllocation && locationAllocation()}
          {permission?.enableOrders && !devicePendingStatus && _renderBillEntry && _renderBillEntry()}
          {permission?.enablePayment && _renderPayments() && _renderPayments()}
          {permission?.enableProducts && !devicePendingStatus && _renderProducts && _renderProducts()}
          {permission?.enablePurchase && _renderPurchase && _renderPurchase()}
          {permission?.enablePurchaseOrder && _renderPurchaseOrder && _renderPurchaseOrder()}
          {permission?.enableRecurringTask && _renderRecurringTask &&  _renderRecurringTask()}
          {permission?.enableReplenish && _renderReplenishProducts && _renderReplenishProducts()}
          {permission?.enableSales && _renderSale && _renderSale()}
          {permission?.enableSettings && _renderSettings && _renderSettings()}
          {permission?.enableStock && !devicePendingStatus &&  _renderStocks && _renderStocks()}
          {permission?.enableReplenish && _renderStoreReplenish && _renderStoreReplenish()}
          {permission?.enableSync && _renderSync() && _renderSync()}
          {permission?.enableSalary && _renderSalary() && _renderSalary()}
          {permission?.enableTicket && _renderTicket()}
          {permission?.enableTransfer && !devicePendingStatus && _renderInventoryTransfer && _renderInventoryTransfer()}
          {permission?.enableUser && _renderUser && _renderUser()}
          {permission?.enableVisitor && _renderVisitor()}
          {permission?.enableWishList && _renderWishList()}
        </ScrollView>
        <VerticalSpace10/>
      </View>
    </View>
  );
};

export default Menu;
