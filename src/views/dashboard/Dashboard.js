import { useIsFocused, useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  AppState,
  BackHandler,
  ImageBackground,
  Text,
  View,
} from "react-native";
import Layout from "../../components/Layout";
import MultiAlert from "../../components/Modal/MultiAlert";
import AsyncStorageConstants from "../../helper/AsyncStorage";
import { Color } from "../../helper/Color";
import ObjectName from "../../helper/ObjectName";
import AsyncStorage from "../../lib/AsyncStorage";
import Setting from "../../lib/Setting";
import SystemSetting from "../../lib/SystemSettings";
import { default as AsyncStorageService } from "../../services/AsyncStorageService";
import settingService from "../../services/SettingService";
import SyncService from "../../services/SyncService";
import userService from "../../services/UserService";
import { getFullName } from "../../lib/Format";
import User from "../../helper/User";
import { StyleSheet } from "react-native";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const Dashboard = (props) => {
  const param = props.route.params;

  const [refreshing, setRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");
  const focused = useIsFocused();
  const navigation = useNavigation();
  const [appId, setAppId] = useState("");
  const [userDetail, setUserDetail] = useState("");

  useEffect(() => {
    getAsyncStorageItem();
    getUserDetail();
  }, [focused]);

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

  const getAsyncStorageItem = async () => {
    let userId = await AsyncStorageService.getUserId();
    setSelectedUser(userId);
    let appId = await AsyncStorageService.getAppId();
    setAppId(appId);
  };

  let Name = getFullName(
    userDetail?.first_name,
    userDetail?.last_name ? userDetail?.last_name : ""
  );

  const featureNavigationMap = {
    Vendors: "Accounts", // Replace with your actual screen name
    Purchase: "Purchase", // Replace with your actual screen name
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
      showMessage={false}
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
