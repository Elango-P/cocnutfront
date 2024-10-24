// Import React and Component
import {
  CommonActions,
  useNavigation,
  useNavigationState,
} from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, View } from "react-native";
import { Color } from "../../helper/Color";
import Permission from "../../helper/Permission";
import IconValue from "../../helper/navBarItems";
import PermissionService from "../../services/PermissionService";
import ToolBarItem from "../ToolBarItem";
import device from "../../lib/Device";
import Feature from "../../helper/Feature";
import settingService from "../../services/SettingService";
import Setting from "../../lib/Setting";
import { Platform } from "react-native";
const BottomToolBar = (props) => {
  const homeIcon = require("../../assets/home.png");
  const ledgerIcon = require("../../assets/ledgers.png");
  const productIcon = require("../../assets/box.png");
  const menuIcon = require("../../assets/menus.png");

  let { updateMenuState, setSideMenuOpen, menuOpen } = props;
  const navigation = useNavigation();
  const [ticketViewPermission, setTicketViewPermission] = useState();
  const [orderViewPermission, setOrderViewPermission] = useState();
  const [replenishViewPermission, setReplenishViewPermission] = useState();
  const [productViewPermission, setProductViewPermission] = useState();
  const [transferViewPermission, setTransferViewPermission] = useState();
  const [reportViewPermission, setReportViewPermission] = useState();
  const [deliveryViewPermission, setDeliveryPermission] = useState();
  const [distributionViewPermission, setDistributionViewPermission] =
    useState();
  const [activitiesViewPermission, setActivitiesViewPermission] = useState();
  const [devicePendingStatus, setDevicePendingStatus] = useState(false);
  const [bottomToolbarBackgroundColor, setBottomToolbarBackgroundColor] =
    useState(Color.TOOL_BAR_BACKGROUND);
  const [bottomToolBarIconColor, setBottomToolBarIconColor] = useState(
    Color.TOOL_BAR
  );
  const screenWidth = Dimensions.get("window").width;

  const routeIndex = useNavigationState((state) => state?.index);
  const currentRoute = useNavigationState(
    (state) => state?.routes[routeIndex]?.name
  );
  const menuItemValue = menuOpen
    ? IconValue.MENU
    : currentRoute
    ? currentRoute
    : "Dashboard";
  useEffect(() => {
    getPermission();
  }, [props, currentRoute]);
  useEffect(() => {
    getThemeColor();
  }, [currentRoute]);

  const getThemeColor = async () => {
    try {
      await settingService.getByName(
        Setting.SETTINGS_PORTAL_FOOTER_COLOR,
        (err, response) => {
          setBottomToolbarBackgroundColor(response);
        }
      );
      await settingService.getByName(
        Setting.SETTINGS_PORTAL_FOOTER_HEADING_COLOR,
        (err, response) => {
          setBottomToolBarIconColor(response);
        }
      );
    } catch (error) {
      console.error("Error retrieving settings:", error);
      return null;
    }
  };

  const getPermission = async () => {
    const transferView = await PermissionService.getFeaturePermission(
      Feature.ENABLE_TRANSFER,
      Permission.MOBILEAPP_DASHBOARD_MENU_TRANSFER
    );
    setTransferViewPermission(transferView);
    const productView = await PermissionService.getFeaturePermission(
      Feature.ENABLE_PRODUCT,
      Permission.MOBILEAPP_DASHBOARD_MENU_PRODUCT
    );
    setProductViewPermission(productView);
    const ticketView = await PermissionService.getFeaturePermission(
      Feature.ENABLE_TICKET,
      Permission.MOBILEAPP_DASHBOARD_MENU_TICKET
    );
    setTicketViewPermission(ticketView);
    const activitiesView = await PermissionService.getFeaturePermission(
      Feature.ENABLE_ACTIVITY,
      Permission.MOBILEAPP_DASHBOARD_MENU_ACTIVITIES
    );
    setActivitiesViewPermission(activitiesView);
    let replenishView = await PermissionService.getFeaturePermission(
      Feature.ENABLE_REPLENISHMENT,
      Permission.MOBILEAPP_DASHBOARD_MENU_REPLENISH
    );
    setReplenishViewPermission(replenishView);
    let orderView = await PermissionService.getFeaturePermission(
      Feature.ENABLE_ORDER,
      Permission.MOBILEAPP_DASHBOARD_MENU_ORDER
    );
    setOrderViewPermission(orderView);
    const deliveryView = await PermissionService.getFeaturePermission(
      Feature.ENABLE_DELIVERY_ORDER,
      Permission.MOBILEAPP_DASHBOARD_MENU_DELIVERY
    );
    setDeliveryPermission(deliveryView);
    const reportView = await PermissionService.getFeaturePermission(
      Feature.ENABLE_REPORT,
      Permission.MOBILEAPP_DASHBOARD_MENU_REPORTS
    );
    setReportViewPermission(reportView);
    const distributionView = await PermissionService.getFeaturePermission(
      Feature.ENABLE_DISTRIBUTION,
      Permission.MOBILEAPP_DASHBOARD_MENU_DISTRIBUTION
    );
    setDistributionViewPermission(distributionView);

    await device.isStatusBlocked((devicePendingStatus) => {
      setDevicePendingStatus(devicePendingStatus);
    });
  };

  const getHideToolBarDetail = () => {
    let showToolBarByRoute = [
      "Dashboard",
      "Order",
      "Ticket",
      "ProductReplenish",
      "Report",
      "Menu",
      "Delivery",
      "Sync",
      "Location",
      "OrderSalesSettlementDiscrepancyReport",
      "StockEntry",
      "Fine",
      "Lead",
      "GatePass",
      "Accounts",
      "Users",
      "Visitor",
      "OrderProduct",
      "Salary",
      "Attendance",
      "inventoryTransfer",
      "distributionTransfer",
      "BrandAndCategoryList",
      "ReplenishmentProduct",
      "SalesSettlement",
      "Bills",
      "Purchase",
      "Payments",
      "ActivityList",
      "Customers",
      "Settings",
      "Reports",
      "CustomerSelector",
      "ContactList",
    ];
    return showToolBarByRoute.includes(
      currentRoute ? currentRoute : "Dashboard"
    );
  };

  let showToolBar = getHideToolBarDetail();

  const handleHomePress = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Dashboard" }],
      })
    );
    setSideMenuOpen && setSideMenuOpen(false);
  };
  const handleLedgerPress = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Ledger" }],
      })
    );
    setSideMenuOpen && setSideMenuOpen(false);
  };

  const handleProductPress = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "BrandAndCategoryList" }],
      })
    );
    setSideMenuOpen && setSideMenuOpen(false);
  };

  const handleMenuPress = () => {
    navigation.navigate("Menu", { navigator: navigation });
  };

  const renderToolBarItems = () => {
    const toolBarItems = [
      {
        icon: { homeIcon },
        label: "Home",
        onPress: handleHomePress,
        selected: menuItemValue === IconValue.DASHBOARD,
      },
      {
        icon: { ledgerIcon },
        label: "Ledger",
        onPress: handleLedgerPress,
        selected: menuItemValue === IconValue.DASHBOARD,
      },

      {
        icon: { productIcon },
        label: "Products",
        onPress: handleProductPress,
        selected: menuItemValue === IconValue.PRODUCT,
      },

      {
        icon: { menuIcon },
        label: "Menu",
        onPress: handleMenuPress,
        selected: menuItemValue === IconValue.MENU,
      },
    ];

    const filteredItems = toolBarItems.filter((item) => {
      switch (item.label) {
        case "Orders":
          return orderViewPermission && !devicePendingStatus;
        case "Replenish":
          return replenishViewPermission;
        case "Transfers":
          return transferViewPermission && !devicePendingStatus;
        case "Distribution":
          return distributionViewPermission;
        case "Products":
          return productViewPermission && !devicePendingStatus;
        case "Delivery":
          return deliveryViewPermission;
        case "Tickets":
          return ticketViewPermission;
        case "Activities":
          return activitiesViewPermission;
        case "Reports":
          return reportViewPermission;
        default:
          return true;
      }
    });
    if (filteredItems.length > 2) {
      return (
        <View style={style.centeredIcon}>
          <ToolBarItem
            icon={homeIcon}
            label="Home"
            onPress={handleHomePress}
            selected={menuItemValue === IconValue.DASHBOARD}
            // toolBarIconColor={bottomToolBarIconColor}
          />
          <ToolBarItem
            icon={ledgerIcon}
            label="Ledger"
            onPress={handleLedgerPress}
            selected={menuItemValue === IconValue.DASHBOARD}
            // toolBarIconColor={bottomToolBarIconColor}
          />
          <ToolBarItem
            icon={productIcon}
            label="Products"
            onPress={handleProductPress}
            selected={menuItemValue === IconValue.PRODUCT}
            // toolBarIconColor={bottomToolBarIconColor}
          />
          <ToolBarItem
            icon={menuIcon}
            label="Menu"
            onPress={handleMenuPress}
            selected={menuItemValue === IconValue.MENU}
            // toolBarIconColor={bottomToolBarIconColor}
          />
        </View>
      );
    } else if (filteredItems.length <= 5) {
      return filteredItems.map((item, index) => (
        <ToolBarItem
          key={index}
          icon={item.icon}
          label={item.label}
          onPress={item.onPress}
          selected={item.selected}
          // toolBarIconColor={bottomToolBarIconColor}
          margin={item.margin}
        />
      ));
    } else {
      return (
        <ScrollView
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            width: filteredItems.length <= 5 ? screenWidth + 70 : "",
          }}
        >
          {filteredItems.map((item, index) => (
            <ToolBarItem
              key={index}
              icon={item.icon}
              label={item.label}
              onPress={item.onPress}
              selected={item.selected}
              // toolBarIconColor={bottomToolBarIconColor}
              margin={item.margin}
            />
          ))}
        </ScrollView>
      );
    }
  };
  return (
    showToolBar && (
      <View
        style={[
          style.bottomToolBar,
          { backgroundColor: bottomToolbarBackgroundColor },
        ]}
      >
        {renderToolBarItems()}
      </View>
    )
  );
};

export default BottomToolBar;

const style = StyleSheet.create({
  bottomToolBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    height: "10%",
    elevation: 2,
    paddingTop: Platform.OS === "ios" ? "1%" : 0,
    paddingHorizontal: Platform.OS === "ios" ? 15 : 10,
    paddingHorizontal:0

  },
  centeredIcon: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingBottom: Platform.OS === "ios" ? "7%" : 10,
    backgroundColor: "#43C6AC",
    padding:5
  },
});
