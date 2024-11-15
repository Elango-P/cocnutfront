import React, { useEffect, useRef, useState } from "react";
import {
  AppState,
  BackHandler,
  Dimensions,
  ScrollView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated
} from "react-native";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { useForm } from "react-hook-form";
import { LinearGradient } from "expo-linear-gradient";
import { Card } from "react-native-paper";
import Carousel from "react-native-snap-carousel";

import Layout from "../../components/Layout";
import MultiAlert from "../../components/Modal/MultiAlert";
import Refresh from "../../components/Refresh";

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
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

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

  const animations = featureNavigationMap && useRef(Object.keys(featureNavigationMap).map(() => new Animated.Value(1))).current; 

  const handlePressIn = (index) => {
    Animated.spring(animations[index], {
      toValue: 0.9, // Shrinks to 90% of the original size
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = (index) => {
    Animated.spring(animations[index], {
      toValue: 1, // Restores to original size
      useNativeDriver: true,
    }).start();
  };
  const renderProductCard = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        navigation.navigate("Products/Details", {
          productId: item.id,
          name: item.name,
          product_name: item.product_name,
          quantity: item.quantity,
          brand: item.brand,
          status: item.status,
          brand_id: item.brand_id,
          image: item.image,
          category_id: item.category_id,
          category: item.category,
          size: item.size,
          unit: item.unit,
          mrp: item.mrp,
          sale_price: item.sale_price,
          barcode: item.barcode,
          printName: item.print_name,
          rack_number: item.rack_number,
        });
      }}
    >
      <LinearGradient
        colors={["#76c7f5", "#76c7f5"]}
        style={styles.productCard}
      >  
        <Image
          source={{ uri: item?.image }}
          style={styles.source}
          alt="no image"
        />
        <View style={styles.productCardContent}>
          <Text style={styles.productName}>{item.name}</Text>
          <View style={styles.quantityContainer}>
            <Text style={styles.productMinQty}>Stock:</Text>
            <Text style={styles.quantityText}>{item.min_quantity || 0}</Text>
            <Text style={styles.productUnit}>{item.unit || ""}</Text>
          </View>
        </View>
      </LinearGradient> 
    </TouchableOpacity>
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
      <ScrollView>
        <View style={styles.container}>
          <Refresh refreshing={refreshing} setRefreshing={setRefreshing}>
            <Text style={styles.welcomeText}>
              Welcome{" "}
              {getFullName(userDetail?.first_name, userDetail?.last_name || "")}
              !
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
          <AnimatedTouchableOpacity
            key={index}
            style={[
              styles.touchableOpacityWrapper,
              { transform: [{ scale: animations[index] }] },
            ]}
            onPressIn={() => handlePressIn(index)}
            onPressOut={() => handlePressOut(index)}
            onPress={() => navigation.navigate(featureNavigationMap[feature])}
          >
            <LinearGradient
              colors={getGradientColors(index)}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.featureButton}
            >
              <Text style={styles.featureButtonText}>{feature}</Text>
            </LinearGradient>
          </AnimatedTouchableOpacity>
        ))}
              </View>
            </Card>
          </Refresh>
        </View>
      </ScrollView>
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
  featuresCard: {
    right: 5,
    left: 5,
    backgroundColor: "#f8f8f8", // Lighter background for a softer look
    borderRadius: 15, // Rounded corners
    width: "97%",  // Adjust width to fit in row nicely
    padding: 10,  // More padding for a better touchable area
    borderWidth: 1, // Width of the border
    borderColor: "#ddd", // Softer border color
    shadowColor: "blue", // Shadow color
    shadowOffset: {
      width: 4,
      height: 8, // Increased vertical offset for a deeper shadow
    },
    shadowOpacity: 0.2, // Slightly increased opacity for more prominent shadow
    shadowRadius: 6, // Increased blur radius for a softer shadow
    elevation: 5, // For Android shadow
    marginVertical: 8, // Spacing between cards
  },
  featuresContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: 10,
  },
  source: {
    width: "100%",
    height: 120,
    borderRadius: 10,
  },
  touchableOpacityWrapper: { width: "48%", marginBottom: 10 },
  featureButton: {
    padding: 10, 
    borderRadius: 18,
    justifyContent: "center", 
    alignItems: "center",
  },
  featureButtonText: { fontSize: 16, fontWeight: "bold", color: "#fff" },
  productCard: {
    marginBottom: 10,
    borderRadius: 18,
    backgroundColor: "#e5e5e5",
    paddingBottom: 20,
    shadowColor: "blue",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 25, 
    shadowOffset: { width: 0, height: 4 },
  },
  productCardContent: { flexDirection: "column", alignItems: "center" },
  productName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    flexDirection: "column",
    justifyContent: "center",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  productMinQty: { fontSize: 18, color: "white" },
  quantityText: {
    backgroundColor: "#FF6347",
    color: "white",
    paddingHorizontal: 5,
    borderRadius: 30,
    fontSize: 18,
  },
  productUnit: { marginLeft: 5, fontSize: 18, color: "white" },
});

export default Dashboard;
