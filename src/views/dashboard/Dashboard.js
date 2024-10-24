import { useIsFocused, useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  AppState,
  BackHandler,
  Dimensions,
  ScrollView,
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
import { LinearGradient } from "expo-linear-gradient";
import productService from "../../services/ProductService";
import Refresh from "../../components/Refresh";
import Loader from "../../components/Loader";
import Carousel from "react-native-snap-carousel";

const { width: viewportWidth } = Dimensions.get("window");
const Dashboard = (props) => {
  const param = props.route.params;

  const [refreshing, setRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");
  const focused = useIsFocused();
  const navigation = useNavigation();
  const [appId, setAppId] = useState("");
  const [userDetail, setUserDetail] = useState("");
  const [productLists, setProductList] = useState([]);
  const [loading, setLoading] = useState(true);
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
    getProductsList();
  }, [focused, refreshing]);
  const getProductsList = async (values) => {
    try {
      setLoading(true);
      productService.search(null, null, (error, response) => {
        let products = response;

        setProductList(products);
        setLoading(false);
      });
    } catch (err) {
      console.log(err);
    }
  };

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
    Sales: "Order", // Replace with your actual screen name
    Payments: "Payments", // Replace with your actual screen name
    Product: "Products", // Replace with your actual screen name
    User: "Users", // Replace with your actual screen name
  };

  const renderProductCard = ({ item }) => (
    <View style={styles.productCard}>
      <Text style={styles.productName}>{item.name}</Text>
      <View style={styles.quantityContainer}>
        <Text style={styles.productMinQty}>Quantity:</Text>
        <Text style={styles.quantityText}>{item.min_quantity || 0}</Text>
        <Text style={styles.productUnit}>{item.unit || ""}</Text>
      </View>
    </View>
  );
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
      <View style={styles.container}>
        <Refresh refreshing={refreshing} setRefreshing={setRefreshing}>
          <Text style={styles.welcomeText}>Welcome, {Name}!</Text>

          <View style={{ backgroundColor: "green", height: 1 }} />
          {loading ? (
            <Loader />
          ) : (
            <Carousel
              data={productLists}
              renderItem={renderProductCard}
              sliderWidth={viewportWidth}
              itemWidth={viewportWidth * 0.9} // Each card takes 75% of the screen width
              layout={"default"} // Choose 'default', 'stack', or 'tinder' for different effects
              loop={true} // Enable looping
              autoplay={true} // Autoplay the carousel
              autoplayInterval={3000} // Set autoplay interval
            />
          )}
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
                  colors={getGradientColors(index)} // Function to get different gradients
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.featureButton}
                >
                  <View style={styles.featureButtonTextWrapper}>
                    <Text style={styles.featureButtonText}>{feature}</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </Refresh>
      </View>
    </Layout>
  );
};
const getGradientColors = (index) => {
  const gradients = [
    ["#6A82FB", "#FC5C7D"], // Blue to pink gradient
    ["#F09819", "#EDDE5D"], // Orange to yellow gradient
    ["#56CCF2", "#2F80ED"], // Light blue to blue gradient
    ["#9B51E0", "#6A67CE"], // Purple gradient
    ["#43C6AC", "#191654"], // Green to dark blue gradient
    ["#FF6F61", "#D7263D"], // Red gradient
  ];
  return gradients[index % gradients.length]; // Cycle through gradients
};
const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#43C6AC", // Light background for better contrast
  },
  touchableOpacityWrapper: {
    width: "50%", // Two buttons per row (slightly less than 50% for spacing)
    marginBottom: 10,
    padding: "2%", // Add space between rows
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  stockTitleContainer: {
    justifyContent: "center", // centers vertically
    alignItems: "center", // centers horizontally
  },
  featureButtonTextWrapper: {
    justifyContent: "center", // Center text within the button
    alignItems: "center",
    flexDirection: "row", // Ensures text stays centered
  },
  stockTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  divider: {
    backgroundColor: "gray",
    height: 1,
    top: 3,
  },
  productUnit: {
    marginLeft: 5,
    fontSize: 16,
    color: "#666",
  },
  roundQuantity: {
    width: 80, // Adjust size for the circle
    height: 40,
    borderRadius: 20, // To make it perfectly round
    backgroundColor: "#FF6347", // Tomato color or any other you prefer
    justifyContent: "center",
    alignItems: "center",
  },
  productListContainer: {
    marginBottom: 20,
  },
  productDetails: {
    marginBottom: 10, // Adds space between each product
  },
  productCard: {
    padding: 20,
    backgroundColor: "#ffffff", // Clean white background
    borderRadius: 15, // More rounded corners for a modern look
    marginTop: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5, // Softer shadow for a sleek look
    shadowRadius: 5,
    elevation: 4, // Elevation for Android shadow
    borderWidth: 1,
    borderColor: "#e0e0e0", // Subtle border to define the card
  },
  productName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333", // Darker color for product name contrast
  },
  productMinQty: {
    fontSize: 16,
    color: "green",
  },
  quantityText: {
    backgroundColor: "#FF6347", // Example color (tomato)
    color: "white",
    paddingHorizontal: 5,
    borderRadius: 30,
  },
  welcomeText: {
    fontSize: 30, // Slightly larger font size
    fontWeight: "bold",
    color: Color.WHITE, // Darker color for better readability
    marginBottom: 25,
    textAlign: "center",
  },
  featuresContainer: {
    flexDirection: "row", // Arrange buttons in a row
    flexWrap: "wrap", // Allow wrapping of buttons to the next row
    justifyContent: "space-between", // Space between buttons
    padding: 10,
  },
  featuresTitle: {
    fontSize: 24, // Larger title font size
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
    textAlign: "center",
  },
  featureButton: {
    borderRadius: 10,
    padding: 10, // Increased padding for better touch area
    borderRadius: 20, // More rounded corners
    backgroundColor: Color.INDIGO,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    justifyContent: "center", // Center vertically
    alignItems: "center",
  },
  featureButtonText: {
    fontSize: 20, // Slightly larger text
    color: "white",
    fontWeight: "600",
  },
  icon: {
    marginLeft: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "100%",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 22, // Larger modal title
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
