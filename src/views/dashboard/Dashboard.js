// Import React and Component
import { useIsFocused, useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Alert, AppState, BackHandler, NativeModules, View } from "react-native";
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
import { default as AsyncStorageService, default as asyncStorageService } from "../../services/AsyncStorageService";
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

// const { RNDeviceInfo } = NativeModules
let DeviceInfo;
// if (RNDeviceInfo) {
//   DeviceInfo = require('react-native-device-info');
// }






const Dashboard = (props) => {

  const param = props.route.params

  const [refreshing, setRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");
  const [locationName, setLocationName] = useState();
  const [userName, setUserName] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [locationId, setLocationId] = useState();
  const [attendanceCheckinCheckPermission, setAttendanceCheckinCheckPermission] = useState("")
  const navigator = useNavigation();
  const focused = useIsFocused();
  const [transferTypeList, setTransferTypeList] = useState([]);
  const navigation = useNavigation();
  const [workingDay, setWorkingDay] = useState([]);
  const [leave, setLeave] = useState([]);
  const [additionalDay, setAdditionalDay] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [ticketViewPermission, setTicketViewPermission] = useState()
  const [fineViewPermission, setFineViewPermission] = useState()
  const [transferViewPermission, setTransferViewPermission] = useState()
  const[geofencingViewPermission,setGeofencingViewPermission] = useState()
  const[messageViewPermission,setMessageViewPermission] = useState()
  const [transfermanageOtherPermission,setTransferManageOtherPermission] = useState()
  const [salesettlementManageOtherPermission,setSalesettlementManageOtherPermission] = useState()
  const [orderManageOtherPermission,setOrderManageOtherPemission] = useState()
  const [forceLogout, setForceLogout] = useState()
  const[collectCustomerInfo,setCollectCustomerInfo] = useState("")
  const [appId,setAppId] = useState("")
  const [userDetail, setUserDetail] = useState("");
  const [modalVisible, setScanModalVisible] = useState(false);
  const [productModalOpen, setProductSelectModalOpen] = useState(false);
  const [scannedProductList, setScannedProductList] = useState([]);
  const [isSubmit,setIsSubmit] = useState(false)
  useEffect(() => {
    getAsyncStorageItem();
    getTransferTypeByRole();
    getUserDetail()
    getPermission();
    getAttendanceDetail();
    getForceLogout();
    getCustomerNumber();
  }, [focused, isLoading])
  

  useEffect(() => {
   const SystemSettings = async()=>{
    await settingService.getByObjectIdAndObjectName(Setting.UNMUTE_PHONE_SOUND,appId,ObjectName.APP,async (err,response)=>{
      if(response == 1){
           SystemSetting.setVolume(1)
      }
    })   
  }
  SystemSettings()
  getMessage();
  
  }, [focused,refreshing])
    
  useEffect(() => {
    getUserDetail()
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
} = useForm({
});

  useEffect(() => {

    const loginSync = async () => {
      if (param?.login) {
        await SyncService.Sync(() => { });

      }
    };
    loginSync()

  }, [param?.login])

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
      setRefreshing(true)
      setTimeout(() => {
        setRefreshing(false)
      }, 1000);
    }
  };

const handleBackPress =()=>{
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        BackHandler.exitApp();
        return true;
      }
    );
    return () => backHandler.remove();
}


  const getTransferTypeByRole = () => {
    TransferTypeService.searchByRole(null, (error, response) => {
      if (response && response.data && response.data.data) {
        setTransferTypeList(response.data.data)
      }
    })
  }
  const getUserDetail = async () => {
    const userId = await AsyncStorage.getItem(AsyncStorageConstants.USER_ID);
    if (userId) {
        userService.get(userId, (err, response) => {
            if (response && response.data) {              
                setUserDetail(response.data)
            }
        })
    } 
}


  const getPermission = async () => {
    const isExist = await PermissionService.hasPermission(Permission.USER_MOBILE_CHECKIN);
    setAttendanceCheckinCheckPermission(isExist)
    const ticketViewPermission = await PermissionService.hasPermission(Permission.TICKET_VIEW);
    setTicketViewPermission(ticketViewPermission)
    const fineViewPermission = await PermissionService.hasPermission(Permission.FINE_VIEW);
    setFineViewPermission(fineViewPermission)
    const transferViewPermission = await PermissionService.hasPermission(Permission.TRANSFER_VIEW);
    setTransferViewPermission(transferViewPermission)
    const transfermanageOtherPermission = await PermissionService.hasPermission(Permission.TRANSFER_MANAGE_OTHERS)
    setTransferManageOtherPermission(transfermanageOtherPermission)
    const salesettlementManageOtherPermission = await PermissionService.hasPermission(Permission.SALE_SETTLEMENT_MANAGE_OTHERS)
    setSalesettlementManageOtherPermission(salesettlementManageOtherPermission)
    const orderManageOtherPermission = await PermissionService.hasPermission(Permission.ORDER_MANAGE_OTHERS)
    setOrderManageOtherPemission(orderManageOtherPermission)
    const messageViewPermission = await PermissionService.hasPermission(Permission.MOBILEAPP_DASHBOARD_MENU_MESSAGES);
    setMessageViewPermission(messageViewPermission)
    const geofencingViewPermission = await PermissionService.hasPermission(Permission.MOBILEAPP_DASHBOARD_MENU_GEOFENCING);
    setGeofencingViewPermission(geofencingViewPermission)

    
  }
  const getMessage = () => {
    messageService.unRead((err, response) => {
      if (response && response.data) {
        const messages = response.data.data;
        if (messages && messages.length > 0) {
          messages.forEach(async (message) => {
            const { id, first_name, last_name, recent_last_message } = message;
  
            Alert.alert(
              'New Message Received',
              `${first_name} ${last_name}: ${recent_last_message}`,
              [
                {
                  text: 'OK',
                  onPress: async () => {
                    await messageService.update(id, null, (response) => {
                    });
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
    let storeId = await AsyncStorageService.getSelectedLocationId()
    setLocationId(storeId)
    let locationName = await AsyncStorageService.getSelectedLocationName()
    setLocationName(locationName)
    let userName = await AsyncStorageService.getUserName()
    setUserName(userName)
    let userId = await AsyncStorageService.getUserId();
    setSelectedUser(userId)
    let appId = await AsyncStorageService.getAppId()
    setAppId(appId)
  }


const getCustomerNumber = async ()=>{
  await settingService.getByName(Setting.COLLECT_CUSTOMER_INFO,(err,response)=>{
    setCollectCustomerInfo(response)
  })
}


  const AddNew = () => {
    if(todayAttendance && !todayAttendance[0]?.login && !orderManageOtherPermission){
      AlertMessage.Error("CheckIn record is missing","CheckIn Missing")
    }else{
      if(Boolean.isTrue(collectCustomerInfo)){
         navigation.navigate("Order/ProductList", {collectCustomerInfo:collectCustomerInfo,
           storeId: locationId, locationName: locationName, owner: selectedUser, isNewOrder: true, type: Order.STORE });
        }else{
         orderService.createOrder({}, (error, response)=> {
        if( response && response.data && response.data.orderId){
          navigation.navigate("Order/ProductList", { orderDetail: response.data.orderDetail,collectCustomerInfo:collectCustomerInfo,
            orderId: response.data.orderId, storeId: locationId, locationName: locationName, owner: selectedUser, isNewOrder: true, type: Order.STORE });
        }
      })
    }
  }
      
  };


  const addNewSalesSettlement = async () => {
    if(todayAttendance && !todayAttendance[0]?.login  && !salesettlementManageOtherPermission){
      AlertMessage.Error("CheckIn record is missing","CheckIn Missing")
    }else{
      await saleSettlementService.ValidateSalesSettlementOnAdd((err,response)=>{
        if(response && response.status == 200){
          navigation.navigate("SalesSettlementForm");

        }
        })
    }
        
   

  }
  const addNewActivity =() => {
    navigation.navigate("/ActivityTypeScreen",{ isAddPage:true })
  }

  const CheckIn = async () => {
    setIsSubmit(true)
    if (!locationId) {
      setIsSubmit(false)
      AlertMessage.Error("Location Not Selected")
  } else{
    setIsSubmit(false)
    navigation.navigate("shiftSelect", {
      store_id: locationId,
      navigation: navigation,
      reDirectionUrl: "Dashboard",
    });
  }
  }

  const bulkOrder = () => {
    navigation.navigate("CustomerSelector",{
      reDirectUrl: "BulkOrder"
    });
  }

  const syncNavigation = async () => {

    navigator.navigate("Sync", { syncing: true });
  };
  const getForceLogout = async ()=>{
    const roleId = await asyncStorageService.getRoleId()
    await settingService.get(Setting.FORCE_LOGOUT_AFTER_CHECKOUT, (err, response) => {
        if (response && response.settings && response.settings[0].value) {
            const forceLogout = response && response.settings && response.settings[0].value
              setForceLogout(forceLogout)
        }
  },roleId)
  }


  const checkOutValidation = async (id) => {
    setIsSubmit(true)
    AttendanceService.CheckOutValidation(id, async (err, response) => {
      if (response) {
        setIsSubmit(false)
        if (device.isSamsungDevice()) {
          navigation.navigate("CameraScreen", {
            forceLogout,
            navigation,
            id,
            isCheckOut: true
          });
        } else {
          setIsLoading(true);
          AttendanceService.checkOut(id, false, async (err, response) => {
            setIsLoading(false);
            setIsSubmit(false)
            if (response) {
              await AsyncStorage.clear(AsyncStorageConstants.SHIFT)
              if (response?.data?.additionalHours) {
                MultiAlert.addAlert({
                  message: `You will get overtime bonus for ${response?.data?.additionalHours} today\nBonus Amount: ${response?.data?.additionalHoursBonus}`,
                  title: "OverTime Bonus",
                });
              }

              if (response?.data?.endAdditionalHours) {
                MultiAlert.addAlert({
                  message: `Bonus Amount: ${response?.data?.endAdditionalHoursBonus}`,
                  title: "Late Checkout Bonus",
                });
              }
              
              if (response?.data?.noStockEntryFineAdd) {
                MultiAlert.addAlert({
                  message: `Fine Amount: ${response?.data?.noStockEntryFineAdd?.fineAmount}\nStock Entry Count: ${response?.data?.noStockEntryFineAdd?.stockEntryCount}\nMissing StockEntry Count: ${response?.data?.noStockEntryFineAdd?.missingStockEntryCount}`,
                  title: "Stock Entry Fine",
                });
              }
              
              if (response?.data?.extraStockEntryBonusAdd) {
                MultiAlert.addAlert({
                  message: `Bonus Amount: ${response?.data?.extraStockEntryBonusAdd?.bonusAmount}\nStock Entry Count: ${response?.data?.extraStockEntryBonusAdd?.stockEntryCount}\nExtra StockEntry Count: ${response?.data?.extraStockEntryBonusAdd?.extraStockEntryCount}`,
                  title: "Stock Entry Bonus",
                });
              }
              
              if (response?.data?.minimumReplenishmentCountFineAdd) {
                MultiAlert.addAlert({
                  message: `Fine Amount: ${response?.data?.minimumReplenishmentCountFineAdd?.fineAmount}\nStock Entry Count: ${response?.data?.minimumReplenishmentCountFineAdd?.replenishmentCount}\nMissing StockEntry Count: ${response?.data?.minimumReplenishmentCountFineAdd?.missingReplenishmentCount}`,
                  title: "Replenishment Fine",
                });
              }
              
              if (response?.data?.extraReplenishmentBonusAdd) {
                MultiAlert.addAlert({
                  message: `Bonus Amount: ${response?.data?.extraReplenishmentBonusAdd?.bonusAmount}\nStock Entry Count: ${response?.data?.extraReplenishmentBonusAdd?.replenishmentCount}\nExtra StockEntry Count: ${response?.data?.extraReplenishmentBonusAdd?.extraReplenishmentCount}`,
                  title: "Replenishment Bonus",
                });
              }
              if (response?.data?.earlyCheckOutFineAdd) {
                MultiAlert.addAlert({
                  message: `Early Checkout Time: ${response?.data?.earlyCheckOutFineAdd?.earlyCheckOutTime}\nFine Amount: ${response?.data?.earlyCheckOutFineAdd?.fineAmount}`,
                  title: "Early Checkout Fine",
                });
              }
              

              if (forceLogout === "true") {
                await AsyncStorage.clearAll()
                navigation.navigate("Login");
              }
            }
          })
        }
      }
    })
  }
  const getAttendanceDetail = async () => {
    await dashboardService.get(async (err, response) => {
      if (response && response.data) {
        setAdditionalDay(response.data.additionalDay);
        setWorkingDay(response.data.workedDay);
        setLeave(response.data.Leave);
        setTodayAttendance(response.data.todayAttendance);

        if (response.data?.forceSync) {
          let LastSynced = await asyncStorageService.getLastSynced();

          let minute = DateTime.compareTimeByMinutes(LastSynced, 15);

          if (typeof minute === "boolean") {
            if (minute) {
              SyncService.Sync(() => {});
            }
          }
        }
      }
    });
  };;


  const addNewTransfer = () => {
    if(todayAttendance && !todayAttendance[0]?.login && !transfermanageOtherPermission){
      AlertMessage.Error("CheckIn record is missing","CheckIn Missing")
    }else{
      inventoryTransferService.onTransferTypeClickStoreSelect(transferTypeList, navigation);

    }
  }
  const toggle = () => {
    setScanModalVisible(!modalVisible);
}

const handleScannedData =async (data)=>{
  setScanModalVisible(false)  
  if(data?.data){ 
   const Product = await productService.getProductUpdatedPrice(data?.data);       
   if (Product && Product.length > 0) {
    setScannedProductList(Product);

    setProductSelectModalOpen(true); 
   }else{
    setProductSelectModalOpen(true); 

   }
   
   
  }
}
const closeModal = () => {
  setProductSelectModalOpen(false)
  setScannedProductList("");

};

  
 let Name = getFullName(userDetail?.first_name,  userDetail?.last_name ? userDetail?.last_name : "");

  return (
    <Layout
      showPortalName
      profileUrl = {userDetail && userDetail?.avatarUrl}
      mobileNumber = {userDetail && userDetail?.mobileNumber1}
      accountId = {userDetail && userDetail?.account_id}
      Name = {Name}
      hideFooterPadding={true}
      showMessage = {messageViewPermission ? true : false}
      isLoading={isLoading}
      refreshing={refreshing}
      showBackIcon={false}
      backButtonNavigationOnPress = {()=>props && handleBackPress()}
      showLogo
    >
  
      <View style={{ flex: 1, backgroundColor: Color.WHITE }}>
     
     
        <Refresh refreshing={refreshing} setRefreshing={setRefreshing}>
        {modalVisible && (
        <BarcodeScanner
         modalVisible={modalVisible}
         handleScannedData={handleScannedData}
         toggle={toggle}

        />
        )}
          {productModalOpen && (
            <ProductListModal
            visible={productModalOpen}
            products = {scannedProductList}
            onClose = {closeModal}
            />
          )}
       

      
          <VerticalSpace10 />

          {/* Header Section */}
          <HeaderCard locationName={locationName} name={userName} />

          <VerticalSpace10 />

          <ItemCountCard refreshing={refreshing} />
          <VerticalSpace10 />

          {/* QuickLinks Section  */}
            <QuickLinks 
             AddNewOrder={AddNew} 
             CheckIn={CheckIn} 
             addNewTransfer={addNewTransfer} 
             syncNavigation={syncNavigation} 
             addNewSalesSettlement={addNewSalesSettlement} 
             bulkOrder={bulkOrder}
             addNewActivity = {()=>addNewActivity()}
             ScanProductbarcode = {()=>setScanModalVisible(true)}
              />
          {/* Sync Section */}
         
          <VerticalSpace10 />
          <VerticalSpace10 />
          {geofencingViewPermission && (          
          <><GeoFencing /><VerticalSpace10 /></>
          )
          }


          {/* Attendance Section */}
          {attendanceCheckinCheckPermission && (
            <AttendanceCard checkOut={checkOutValidation} isSubmit = {isSubmit} refreshing={refreshing} CheckIn={CheckIn} locationId = {locationId} workingDay={workingDay} leave={leave} additionalDay={additionalDay} checkIn={todayAttendance} navigation={navigation} setIsLoading={setIsLoading} />)}

    
          {/* Fine Section */}
          {fineViewPermission && (
            <>
              <VerticalSpace10 />

              <FineList focused={focused} />
            </>
          )}

          {/* {Ticket Section} */}
          {ticketViewPermission && (
           <><VerticalSpace10 /><TicketList /></>
          )}
          <VerticalSpace10 />

        </Refresh>
      </View>

    </Layout>
  );
};
export default Dashboard;
