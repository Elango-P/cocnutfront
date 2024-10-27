import React, { useEffect, useState } from "react";
import {
  AppState,
  BackHandler,
  Dimensions,
  ScrollView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { useForm } from "react-hook-form";
import { LinearGradient } from "expo-linear-gradient";
import { Card } from "react-native-paper";
import Carousel from "react-native-snap-carousel";

import Layout from "../../components/Layout";
import MultiAlert from "../../components/Modal/MultiAlert";
import Refresh from "../../components/Refresh";
import Loader from "../../components/Loader";

import AsyncStorage from "../../lib/AsyncStorage";
import Setting from "../../lib/Setting";
import SystemSetting from "../../lib/SystemSettings";
import AsyncStorageService from "../../services/AsyncStorageService";
import settingService from "../../services/SettingService";
import SyncService from "../../services/SyncService";
import userService from "../../services/UserService";
import productService from "../../services/ProductService";

import { getFullName } from "../../lib/Format";
import { Color } from "../../helper/Color";
import AsyncStorageConstants from "../../helper/AsyncStorage";
import ObjectName from "../../helper/ObjectName";
import User from "../../helper/User";
import ListCustomLoader from "../../components/ListCustomLoader";

const { width: viewportWidth } = Dimensions.get("window");

const Dashboard = (props) => {
  const navigation = useNavigation();
  const focused = useIsFocused();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({});

  const [appId, setAppId] = useState("");
  const [userDetail, setUserDetail] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [productLists, setProductList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const param = props.route.params;

  useEffect(() => {
    getAsyncStorageItem();
    getUserDetail();
  }, [focused]);

  useEffect(() => {
    setupSystemSettings();
    fetchProductList();
  }, [focused, refreshing]);

  useEffect(() => {
    checkUserDetailForLogout();
  }, [userDetail && userDetail?.force_logout]);

  useEffect(() => {
    loginSyncIfNeeded();
  }, [param?.login]);

  useEffect(() => {
    AppState.addEventListener("change", handleAppStateChange);
    return () => AppState.removeEventListener("change", handleAppStateChange);
  }, []);

  const getAsyncStorageItem = async () => {
    const userId = await AsyncStorageService.getUserId();
    setSelectedUser(userId);
    const appId = await AsyncStorageService.getAppId();
    setAppId(appId);
  };

  const getUserDetail = async () => {
    const userId = await AsyncStorage.getItem(AsyncStorageConstants.USER_ID);
    if (userId) {
      userService.get(userId, (err, response) => {
        if (response && response.data) setUserDetail(response.data);
      });
    }
  };

  const fetchProductList = async () => {
    try {
      setLoading(true);
      productService.search(null, null, (error, response) => {
        setProductList(response || []);
        setLoading(false);
      });
    } catch (err) {
      console.error(err);
    }
  };

  const setupSystemSettings = async () => {
    const settingValue = await settingService.getByObjectIdAndObjectName(
      Setting.UNMUTE_PHONE_SOUND,
      appId,
      ObjectName.APP
    );
    if (settingValue === 1) SystemSetting.setVolume(1);
  };

  const checkUserDetailForLogout = async () => {
    if (userDetail && userDetail.force_logout === User.FORCE_LOGOUT_ENABLE) {
      MultiAlert.addAlert({
        title: "Restarting",
        message: "Restarting the App",
      });
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
    }
  };

  const loginSyncIfNeeded = async () => {
    if (param?.login) await SyncService.Sync(() => {});
  };

  const handleAppStateChange = (nextAppState) => {
    if (nextAppState === "active") {
      setRefreshing(true);
      setTimeout(() => setRefreshing(false), 1000);
    }
  };

  const featureNavigationMap = {
    Vendors: "Accounts",
    Purchase: "Purchase",
    Sales: "Order",
    Payments: "Payments",
    Product: "Products",
    User: "Users",
  };

  const renderProductCard = ({ item }) => (
    <Card style={styles.productCard}>
      <View style={styles.productCardContent}>
        <Text style={styles.productName}>{item.name}</Text>
        <View style={styles.quantityContainer}>
          <Text style={styles.productMinQty}>Stock:</Text>
          <Text style={styles.quantityText}>{item.min_quantity || 0}</Text>
          <Text style={styles.productUnit}>{item.unit || ""}</Text>
        </View>
      </View>
    </Card>
  );

  const getGradientColors = (index) => {
    const gradients = [
      ["#6A82FB", "#FC5C7D"],
      ["#F09819", "#EDDE5D"],
      ["#56CCF2", "#2F80ED"],
      ["#9B51E0", "#6A67CE"],
      ["#191654", "#43C6AC"],
      ["#FF6F61", "#D7263D"],
    ];
    return gradients[index % gradients.length];
  };

  return (
    <Layout
      showPortalName
      profileUrl={userDetail?.avatarUrl}
      mobileNumber={userDetail?.mobileNumber1}
      accountId={userDetail?.account_id}
      Name={getFullName(userDetail?.first_name, userDetail?.last_name || "")}
      hideContentPadding
      hideFooterPadding
      showMessage={false}
      refreshing={refreshing}
      showBackIcon={false}
      backButtonNavigationOnPress={() => handleBackPress()}
      showLogo
    >
      <View style={styles.container}>
        <Refresh refreshing={refreshing} setRefreshing={setRefreshing}>
          <Text style={styles.welcomeText}>
            Welcome{" "}
            {getFullName(userDetail?.first_name, userDetail?.last_name || "")}!
          </Text>
          {loading ? (
            <ListCustomLoader count={3} height={30} />
          ) : (
            <Carousel
              data={productLists}
              renderItem={renderProductCard}
              sliderWidth={viewportWidth}
              itemWidth={viewportWidth * 0.75}
              layout={"default"}
              loop
              autoplay
              autoplayInterval={4000}
            />
          )}
          <Card style={styles.featuresCard}>
            <View style={styles.featuresContainer}>
              {Object.keys(featureNavigationMap).map((feature, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.touchableOpacityWrapper}
                  onPress={() =>
                    navigation.navigate(featureNavigationMap[feature])
                  }
                >
                  <LinearGradient
                    colors={getGradientColors(index)}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.featureButton}
                  >
                    <Text style={styles.featureButtonText}>{feature}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        </Refresh>
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: "center", backgroundColor: Color.WHITE, flex: 1 },
  welcomeText: {
    fontSize: 30,
    fontWeight: "bold",
    color: Color.BLACK,
    marginBottom: 25,
    textAlign: "center",
  },
  featuresCard: { padding: 5, backgroundColor: "#e5e5e5" },
  featuresContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: 10,
  },
  touchableOpacityWrapper: { width: "48%", marginBottom: 10 },
  featureButton: {
    padding: 10,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  featureButtonText: { fontSize: 16, fontWeight: "bold", color: "#fff" },
  productCard: {
    padding: 10,
    marginBottom: 10,
    borderRadius: 15,
    backgroundColor: "#e5e5e5",
  },
  productCardContent: { flexDirection: "column", alignItems: "center" },
  productName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flexDirection: "column",
    justifyContent: "center",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  productMinQty: { fontSize: 16, color: "green" },
  quantityText: {
    backgroundColor: "#FF6347",
    color: "white",
    paddingHorizontal: 5,
    borderRadius: 30,
  },
  productUnit: { marginLeft: 5, fontSize: 16, color: "#666" },
});

export default Dashboard;
