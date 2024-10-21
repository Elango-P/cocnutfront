// Import React and Component
import {
  CommonActions,
  useIsFocused,
  useNavigation,
} from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Alert,
  AppState,
  BackHandler,
  ImageBackground,
  NativeModules,
  Text,
  View,
} from "react-native";
import Layout from "../../components/Layout";
import MultiAlert from "../../components/Modal/MultiAlert";
import Refresh from "../../components/Refresh";
import VerticalSpace10 from "../../components/VerticleSpace10";
import AsyncStorageConstants from "../../helper/AsyncStorage";
import { Color } from "../../helper/Color";
import ObjectName from "../../helper/ObjectName";
import Order from "../../helper/Order";
import Permission from "../../helper/Permission";
import AlertMessage from "../../lib/Alert";
import AsyncStorage from "../../lib/AsyncStorage";
import Boolean from "../../lib/Boolean";
import device from "../../lib/Device";
import Setting from "../../lib/Setting";
import SystemSetting from "../../lib/SystemSettings";
import {
  default as AsyncStorageService,
  default as asyncStorageService,
} from "../../services/AsyncStorageService";
import AttendanceService from "../../services/AttendanceService";
import dashboardService from "../../services/DashboardService";
import inventoryTransferService from "../../services/InventoryTransferService";
import messageService from "../../services/MessageService";
import orderService from "../../services/OrderService";
import PermissionService from "../../services/PermissionService";
import saleSettlementService from "../../services/SaleSettlementService";
import settingService from "../../services/SettingService";
import SyncService from "../../services/SyncService";
import TransferTypeService from "../../services/TransferTypeService";
import CustomerInfoModal from "../order/CustomerInfoModal";
import AttendanceCard from "./AttendanceCard";
import FineList from "./FineList";
import GeoFencing from "./GeoFencingSection";
import HeaderCard from "./HeaderCard";
import ItemCountCard from "./ItemCountCard";
import QuickLinks from "./QuickLinks";
import SyncCard from "./SyncCard";
import TicketList from "./TicketList";
import userService from "../../services/UserService";
import { getFullName } from "../../lib/Format";
import DateTime from "../../lib/DateTime";
import BarcodeScanner from "../../components/BarcodeScanner";
import productService from "../../services/ProductService";
import ProductListModal from "../../components/Modal/ProductListModal";
import User from "../../helper/User";
import OrderTypeService from "../../services/orderTypeService";
import Response from "../../lib/NetworkStatus";
import ActivityList from "./ActivityList";
import { StyleSheet } from "react-native";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
const { RNDeviceInfo } = NativeModules;
let DeviceInfo;
if (RNDeviceInfo) {
  DeviceInfo = require("react-native-device-info");
}

const Dashboard = (props) => {
  const param = props.route.params;

  const [refreshing, setRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");
  const [locationName, setLocationName] = useState();
  const [userName, setUserName] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [locationId, setLocationId] = useState();
  const [
    attendanceCheckinCheckPermission,
    setAttendanceCheckinCheckPermission,
  ] = useState("");
  const navigator = useNavigation();
  const focused = useIsFocused();
  const [transferTypeList, setTransferTypeList] = useState([]);
  const navigation = useNavigation();
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [ticketViewPermission, setTicketViewPermission] = useState();
  const [fineViewPermission, setFineViewPermission] = useState();
  const [transferViewPermission, setTransferViewPermission] = useState();
  const [geofencingViewPermission, setGeofencingViewPermission] = useState();
  const [messageViewPermission, setMessageViewPermission] = useState();
  const [transfermanageOtherPermission, setTransferManageOtherPermission] =
    useState();
  const [
    salesettlementManageOtherPermission,
    setSalesettlementManageOtherPermission,
  ] = useState();
  const [orderManageOtherPermission, setOrderManageOtherPemission] = useState();
  const [forceLogout, setForceLogout] = useState();
  const [collectCustomerInfo, setCollectCustomerInfo] = useState("");
  const [appId, setAppId] = useState("");
  const [userDetail, setUserDetail] = useState("");
  const [modalVisible, setScanModalVisible] = useState(false);
  const [productModalOpen, setProductSelectModalOpen] = useState(false);
  const [scannedProductList, setScannedProductList] = useState([]);
  const [activityViewPermission, setActivityViewPermission] = useState();

  const [isSubmit, setIsSubmit] = useState(false);
  useEffect(() => {
    getAsyncStorageItem();
    getTransferTypeByRole();
    getUserDetail();
    getPermission();
    getForceLogout();
    getCustomerNumber();
  }, [focused, isLoading]);

  useEffect(() => {
    const SystemSettings = async () => {
      await settingService.getByObjectIdAndObjectName(
        Setting.UNMUTE_PHONE_SOUND,
        appId,
        ObjectName.APP,
        async (err, response) => {
          if (response == 1) {
            SystemSetting.setVolume(1);
          }
        }
      );
    };
    SystemSettings();
    getMessage();
  }, [focused, refreshing]);

  useEffect(() => {
    getUserDetail();
    const checkUserDetail = async () => {
      if (userDetail && userDetail.force_logout === User.FORCE_LOGOUT_ENABLE) {
        MultiAlert.addAlert({
          title: "Restarting",
          message: "Restarting the App",
        });

        try {
          userService.update(
            selectedUser,
            { force_logout_soft: false },
            async (err, response) => {
              if (response && response?.data) {
                await AsyncStorage.clearAll();
                navigation.navigate("Login");
              }
            }
          );
        } catch (error) {
          console.error("Error updating user:", error);
        }
      }
    };

    checkUserDetail();
  }, [userDetail && userDetail?.force_logout]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({});

  useEffect(() => {
    const loginSync = async () => {
      if (param?.login) {
        await SyncService.Sync(() => {});
      }
    };
    loginSync();
  }, [param?.login]);

  useEffect(() => {
    // Add event listener
    AppState.addEventListener("change", handleAppStateChange);

    // Cleanup function
    return () => {
      // Check if removeEventListener exists
      if (AppState.removeEventListener) {
        AppState.removeEventListener("change", handleAppStateChange);
      }
    };
  }, []);

  const handleAppStateChange = (nextAppState) => {
    if (nextAppState === "active") {
      setRefreshing(true);
      setTimeout(() => {
        setRefreshing(false);
      }, 1000);
    }
  };

  const handleBackPress = () => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        BackHandler.exitApp();
        return true;
      }
    );
    return () => backHandler.remove();
  };

  const getTransferTypeByRole = () => {
    TransferTypeService.searchByRole(null, (error, response) => {
      if (response && response.data && response.data.data) {
        setTransferTypeList(response.data.data);
      }
    });
  };
  const getUserDetail = async () => {
    const userId = await AsyncStorage.getItem(AsyncStorageConstants.USER_ID);
    if (userId) {
      userService.get(userId, (err, response) => {
        if (response && response.data) {
          setUserDetail(response.data);
        }
      });
    }
  };

  const getPermission = async () => {
    const isExist = await PermissionService.hasPermission(
      Permission.USER_MOBILE_CHECKIN
    );
    setAttendanceCheckinCheckPermission(isExist);
    const ticketViewPermission = await PermissionService.hasPermission(
      Permission.TICKET_VIEW
    );
    setTicketViewPermission(ticketViewPermission);
    const fineViewPermission = await PermissionService.hasPermission(
      Permission.FINE_VIEW
    );
    setFineViewPermission(fineViewPermission);
    const transferViewPermission = await PermissionService.hasPermission(
      Permission.TRANSFER_VIEW
    );
    setTransferViewPermission(transferViewPermission);
    const transfermanageOtherPermission = await PermissionService.hasPermission(
      Permission.TRANSFER_MANAGE_OTHERS
    );
    setTransferManageOtherPermission(transfermanageOtherPermission);
    const salesettlementManageOtherPermission =
      await PermissionService.hasPermission(
        Permission.SALE_SETTLEMENT_MANAGE_OTHERS
      );
    setSalesettlementManageOtherPermission(salesettlementManageOtherPermission);
    const orderManageOtherPermission = await PermissionService.hasPermission(
      Permission.ORDER_MANAGE_OTHERS
    );
    setOrderManageOtherPemission(orderManageOtherPermission);
    const messageViewPermission = await PermissionService.hasPermission(
      Permission.MOBILEAPP_DASHBOARD_MENU_MESSAGES
    );
    setMessageViewPermission(messageViewPermission);
    const geofencingViewPermission = await PermissionService.hasPermission(
      Permission.MOBILEAPP_DASHBOARD_MENU_GEOFENCING
    );
    setGeofencingViewPermission(geofencingViewPermission);
    const activityViewPermission = await PermissionService.hasPermission(
      Permission.ACTIVITY_VIEW
    );
    setActivityViewPermission(activityViewPermission);
  };
  const getMessage = () => {
    messageService.unRead((err, response) => {
      if (response && response.data) {
        const messages = response.data.data;
        if (messages && messages.length > 0) {
          messages.forEach(async (message) => {
            const { id, first_name, last_name, recent_last_message } = message;

            Alert.alert(
              "New Message Received",
              `${first_name} ${last_name}: ${recent_last_message}`,
              [
                {
                  text: "OK",
                  onPress: async () => {
                    await messageService.update(id, null, (response) => {});
                  },
                },
              ]
            );
          });
        }
      }
    });
  };

  const getAsyncStorageItem = async () => {
    let storeId = await AsyncStorageService.getSelectedLocationId();
    setLocationId(storeId);
    let locationName = await AsyncStorageService.getSelectedLocationName();
    setLocationName(locationName);
    let userName = await AsyncStorageService.getUserName();
    setUserName(userName);
    let userId = await AsyncStorageService.getUserId();
    setSelectedUser(userId);
    let appId = await AsyncStorageService.getAppId();
    setAppId(appId);
  };

  const getCustomerNumber = async () => {
    await settingService.getByName(
      Setting.COLLECT_CUSTOMER_INFO,
      (err, response) => {
        setCollectCustomerInfo(response);
      }
    );
  };

  const getForceLogout = async () => {
    const roleId = await asyncStorageService.getRoleId();
    await settingService.get(
      Setting.FORCE_LOGOUT_AFTER_CHECKOUT,
      (err, response) => {
        if (response && response.settings && response.settings[0].value) {
          const forceLogout =
            response && response.settings && response.settings[0].value;
          setForceLogout(forceLogout);
        }
      },
      roleId
    );
  };

  let Name = getFullName(
    userDetail?.first_name,
    userDetail?.last_name ? userDetail?.last_name : ""
  );

  const featureNavigationMap = {
    Vendors: "Accounts", // Replace with your actual screen name
    Purchase: "Purchase", // Replace with your actual screen name
    Bills: "Bills", // Replace with your actual screen name
    Payments: "Payments", // Replace with your actual screen name
    Product: "Products", // Replace with your actual screen name
    Sales: "Order", // Replace with your actual screen name
    User: "Users", // Replace with your actual screen name
  };
  return (
    <Layout
      showPortalName
      profileUrl={userDetail?.avatarUrl}
      mobileNumber={userDetail?.mobileNumber1}
      accountId={userDetail?.account_id}
      Name={Name}
      hideContentPadding
      hideFooterPadding={true}
      showMessage={messageViewPermission}
      isLoading={isLoading}
      refreshing={refreshing}
      showBackIcon={false}
      backButtonNavigationOnPress={() => props && handleBackPress()}
      showLogo
    >
      <ImageBackground
        source={require("../../assets/cc8.jpg")} // Add a background image
        style={styles.backgroundImage}
      >
        <View style={styles.container}>
          <View style={styles.featuresContainer}>
            {Object.keys(featureNavigationMap).map((feature, index) => (
              <TouchableOpacity
                key={index}
                style={styles.featureButton}
                onPress={() =>
                  navigation.navigate(featureNavigationMap[feature])
                }
              >
                <Text style={styles.featureButtonText}>{feature}</Text>
                <Ionicons
                  name="arrow-forward"
                  size={20}
                  color="white"
                  style={styles.icon}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ImageBackground>
    </Layout>
  );
};
const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    // Add a gradient background if desired
  },
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "700",
    color: "black", // Green color
    marginBottom: 20,
    textAlign: "center",
  },
  featuresContainer: {
    marginTop: 0,
    width: "90%",
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
    textAlign: "center",
  },
  featureButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    borderRadius: 20,
    backgroundColor: Color.INDIGO,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  featureButtonText: {
    fontSize: 18,
    color: "white",
    marginLeft: 10,
    fontWeight: "600",
  },
  icon: {
    marginRight: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Dark background for modal
  },
  modalContent: {
    width: "80%",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  input: {
    width: "100%",
    padding: 10,
    marginBottom: 15,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
  },
});
export default Dashboard;
