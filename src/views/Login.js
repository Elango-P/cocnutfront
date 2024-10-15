// Import React and Component
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Linking,
  NativeModules,
  Platform,
  StyleSheet,
  Text,
  View
} from "react-native";



import platform from "../lib/Platform";

import apiClient from "../apiClient";

import { endpoints } from "../helper/ApiEndPoint";

import TextInput from "../components/Text";


import Toast from "react-native-toast-message";

import OnePortalDB from "../db/onePortalDB";


import { useNavigation } from "@react-navigation/native";

import { Color } from "../helper/Color";

import Alert from "../components/Modal/Alert";

import Device from "../lib/Device";

import UserDeviceInfoService from "../services/UserDeviceInfoService";

import { version } from "../../package.json";

import storeService from "../services/StoreService";

import Validation from "../lib/Validation";


import asyncStorageService from "../services/AsyncStorageService";

import Layout from "../components/Layout/LoginLayout";

import Button from "../components/Button";
import VerticalSpace from "../components/VerticleSpace10";
import Setting from "../lib/Setting";
import AsyncStorageService from "../services/AsyncStorageService";
import settingService from "../services/SettingService";

import * as device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Label from "../components/Label";
import UserDeviceInfo from "../helper/UserDeviceInfo";
import AppID from "../lib/AppID";
import AsyncStorageObject from "../lib/AsyncStorage";
import userService from "../services/UserService";
import Constants from 'expo-constants';
import styles from "../helper/Styles";
import userDeviceInfoService from "../services/UserDeviceInfoService";
const expoProjectId = Constants?.expoConfig?.extra?.eas?.projectId;


const { RNDeviceInfo } = NativeModules;
let DeviceInfo;
if (RNDeviceInfo) {
  DeviceInfo = require("react-native-device-info");
}

const Login = ({ }) => {
  const [password, setPassword] = useState("");
  const [IpAddress, setIpAddress] = useState("");
  const [brandName, setBrandName] = useState("");
  const [battery, setBattery] = useState("");
  const [network, setNetwork] = useState("");
  const [deviceName, setDeviceName] = useState("");
  const [appVersion, setAppVersion] = useState("");
  const [uniqueId, setUniqueId] = useState("");
  const [location, setLocation] = useState("");
  const [showEmailPasswordFields, setShowEmailPasswordFields] = useState(false);

  const [isModalVisible, setIsModalVisible] = useState(false);

  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [otpValue, setOtpValue] = useState(["", "", "", ""]);

  const [inputType, setInputType] = useState("email"); // Default input type is email
  const [inputValue, setInputValue] = useState("");
  const [pushNotificationToken, setPushNotificationToken] = useState(null)

  const [label, setLabel] = useState("Enter Email Address");
  const [isSubmit,setIsSubmit] = useState(false)
  const navigation = useNavigation();

  useEffect(() => {
      GetDeviceInformation();
  }, []);

  useEffect(() => {
    (async () => {
      const sessionToken = await AsyncStorageService.getSessionToken();

      if (!sessionToken) {
        navigation.navigate("Login");
      } else {
        navigation.navigate(AppID.isZunoMart() ? "Home" : "Dashboard");
      }
    })();
  }, []);

  useEffect(() => {

  const registerForPushNotifications = async () => {
    if (device.isDevice) {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      alert('You need to enable notifications in your settings.');
      return;
    }
    const token = (await Notifications.getExpoPushTokenAsync({ projectId: expoProjectId })).data;
    setPushNotificationToken(token)
    }
  };

  registerForPushNotifications();

  const subscription = Notifications.addNotificationReceivedListener(notification => {});

  return () => subscription.remove();
  }, []);

  const GetDeviceInformation = async () => {
    await Device.getDeviceLocation((callback) => setLocation(callback));
    await Device.GetIpAddress((callback) => setIpAddress(callback));
    await Device.NetWorkStatus((callback) => setNetwork(callback));
    let deviceName = await Device.GetDeviceName();
    let brandName = await Device.GetDeviceBrandName();
    await Device.GetBatteryPercentage((callback) => setBattery(callback));
    setDeviceName(deviceName);
    setBrandName(brandName);

    setAppVersion(version);
  };

  const LogInRedirection = async (response) => {
    try {      
      let role = response?.data?.user ? response.data.user.role.toString() : "";

      let userId = response?.data?.user ? response.data.user.id.toString() : "";

      let locationList = response?.data?.user
        ? response?.data?.user.locationList
        : [];

      let permissionList = response?.data?.user
        ? response?.data?.user.permissionList
        : [];

      let settingList = response?.data?.user
        ? response?.data?.user.settingList
        : [];

      let token = response?.data?.user
        ? response.data.user.token.toString()
        : "";

      let firstName = response?.data?.user?.firstName
        ? response?.data?.user?.firstName
        : "";

      let lastName = response?.data?.user?.lastName
        ? response?.data?.user?.lastName
        : "";

      let accountId = response?.data?.user?.accountId
        ? response?.data?.user?.accountId
        : "";

        let featureList = response?.data?.user?.featureList
        ? response?.data?.user?.featureList 
        : [];

      let name = `${firstName} ${lastName}`;
       let app_id = response?.data?.user ? response.data.user.app_id && response.data.user.app_id.toString() : ""
        
      await asyncStorageService.setSessionToken(token);

      await asyncStorageService.setUserName(name);

      await asyncStorageService.setRoleId(role);

      await asyncStorageService.setUserId(userId);

      await asyncStorageService.setAppId(app_id)

      if (accountId) {
        await asyncStorageService.setAccountId(accountId.toString());
      }

      //validate permission list
      if (permissionList && Array.isArray(permissionList)) {
        //convert JSON into string
        permissionList = JSON.stringify(permissionList);
        //set in local storag
        await asyncStorageService.setPermissions(permissionList);
      }
      if (settingList && Array.isArray(settingList)) {
        settingList = JSON.stringify(settingList);
        await asyncStorageService.setSettings(settingList);
      }

      if (featureList && Array.isArray(featureList)) {
        //convert JSON into string
        featureList = JSON.stringify(featureList);
        //set in local storag
        await asyncStorageService.setAppFeatures(featureList);
      }

      await OnePortalDB.create();

      if (AppID.isZunoMartStore() || AppID.isThiDiff() || AppID.isZunoStar()) {

        if (locationList && locationList.length == 1) {
          asyncStorageService.setSelectedLocationName(locationList[0].name);

          asyncStorageService.setSelectedLocationId(
            locationList[0].id.toString()
          );

          await navigation.navigate("Dashboard", { login: true });

          setPassword("");
          setShowEmailPasswordFields(false);
          setInputValue("");
        } else {
          storeService.GetLocationByIpAndGeoLocation(
            { longitude: location?.longitude, latitude: location?.latitude },
            async (err, response) => {
              if (response && response.data && response.data.locationDetail) {
                asyncStorageService.setSelectedLocationName(
                  response.data.locationDetail.name
                );

                asyncStorageService.setSelectedLocationId(
                  response.data.locationDetail.id.toString()
                );

                await navigation.navigate("Dashboard", { login: true });

                setPassword("");
                setShowEmailPasswordFields(false);
                setInputValue("");
              } else {
                await settingService.get(
                  Setting.SHOW_STORE_SELECTION_ON_LOGIN,
                  async (error, response) => {
                    if (
                      response?.settings &&
                      response.settings.length > 0 &&
                      response.settings[0].value === "true"
                    ) {
                      await navigation.navigate("Settings/SelectStore", {
                        isInitialSetup: true,
                        locationByRole: true,
                      });
                      setPassword("");
                      setInputValue("");
                      setShowEmailPasswordFields(false);
                    } else {
                      navigation.navigate("Dashboard", { login: true });
                      setPassword("");
                      setInputValue("");
                      setShowEmailPasswordFields(false);
                    }
                  }
                );
              }
            }
          );
        }
      } else if (AppID.isZunoMart()) {
          setPassword("");
          setShowEmailPasswordFields(false);
          setInputValue("");
        navigation.navigate("Home");
      } else {
        if (locationList && locationList.length == 1) {
          asyncStorageService.setSelectedLocationName(locationList[0].name);
          asyncStorageService.setSelectedLocationId(
            locationList[0].id.toString()
          );
          await navigation.navigate("Dashboard", { login: true });
          setPassword("");
          setShowEmailPasswordFields(false);
          setInputValue("");
        }
        navigation.navigate("Dashboard", { login: true });
      }
    } catch (err) {
      console.log(err);
    }
  };

  const onUpdate = async () => {
    if (Platform.OS === "ios") {
      await Linking.openURL(`https://apps.apple.com/us/app/zunomart/id6464041231`);
    } else if (Platform.OS === "android") {
      await Linking.openURL(`https://play.google.com/store/apps/details?id=${AppID.getAppId()}`);
    }
  }
  const getDeviceInfo = async(responseData)=>{
    const userId = await asyncStorageService.getUserId()
       
     let params = {deviceName : deviceName , user : userId}
      await userDeviceInfoService.search(params,async (err,response)=>{
        if(response.data?.data[0].reset_mobile_data === "true"){
          AsyncStorageObject.clearAll({
            isClearAll: true,
          });
          return await LogInRedirection(responseData);
        }else{
          return await LogInRedirection(responseData);
        }
    })
  }

  const LoginByEmail = async () => {
    try {
      setIsSubmit(true)
      if (!inputValue || !password) {
        setIsSubmit(false)
        Alert.Error(
          !inputValue && !password
            ? "Email or Mobile Number and Password is required"
            : !password
              ? "Password is required"
              : "Email or Mobile Number is required"
        );
      } else {
        if (isNaN(inputValue.charAt(0))) {
          // check if the first character is not a number (i.e. email)
          if (!Validation.isValidEmail(inputValue)) {
            setIsSubmit(false)
            Alert.Error("Email is invalid");
          }
        } else {
          // first character is a number (i.e. mobile number)
          if (!Validation.isValidMobileNumber(inputValue)) {
            setIsSubmit(false)
            Alert.Error("Mobile Number is invalid");
          }
        }
      }
      if (
        Validation.isValidEmail(inputValue) ||
        Validation.isValidMobileNumber(inputValue)
      ) {
        if (inputValue && password) {
          let data = {
            email: inputValue.toLowerCase(),
            password: password,
            isMobileLogin: true,
            appVersion: version,
            isCustomerApp: AppID.isZunoMart() ? true : false,
            nameSpace: "com.zunomartstore",
            pushNotificationToken: pushNotificationToken

          };

          apiClient.post(
            `${endpoints().UserAPI}/mobileLogin`,
            data,
            async (error, response) => {
              if (response && response.data && response.data.appVersionUpdate) {
                let appId = AppID.getAppId();
                let showUpdateOption = Platform.OS == "ios" && (AppID.isZunoMart() || AppID.isZunoMartStore() || AppID.isThiDiff()) && appId ? true : Platform.OS == "android" && appId ? true : false;
                Alert.Error(response.data.message, showUpdateOption ? onUpdate : null, showUpdateOption ? "Update" : "Ok","Update Required");
                setIsSubmit(false)
              } else if (response && response.data && response.data.user) {
                let token = response?.data?.user
                  ? response.data.user.token.toString()
                  : "";
                setOtpValue("");
                setOtpModalVisible(false);
                setIsModalVisible(false);
                setIsSubmit(false)
                await asyncStorageService.setSessionToken(token);


                if (AppID.isZunoMartStore() || AppID.isThiDiff() || AppID.isZunoStar) {

                  let bodyData = {
                    ipAddress: IpAddress,
                    deviceName: deviceName,
                    brandName: brandName,
                    network: network,
                    battery: battery,
                    unique_id: uniqueId,
                    user: response.data.user.id,
                    versionNumber: appVersion,
                    app_id : AppID.getAppId(),
                  };

                  UserDeviceInfoService.create(
                    bodyData,
                    token,
                    async (error, userInfoResponse) => {
                      await settingService.get(
                        Setting.DEVICE_APPROVAL_REQUIRED,
                        async (error, res) => {
                          if (
                            res?.settings &&
                            res.settings.length > 0 &&
                            res.settings[0].value === "true"
                          ) {
                            if (!DeviceInfo || platform.isIOS()) {
                              getDeviceInfo(response)
                            }
                            if (
                              userInfoResponse &&
                              userInfoResponse.data &&
                              userInfoResponse.data.deviceInfoDetail
                            ) {
                              let deviceInfo =
                                userInfoResponse?.data?.deviceInfoDetail;
                              if (deviceInfo) {
                                let userDeviceInfoStatus =
                                  deviceInfo?.status ==
                                    UserDeviceInfo.STATUS_BLOCKED_VALUE
                                    ? UserDeviceInfo.STATUS_BLOCKED_TEXT
                                    : deviceInfo?.status ==
                                      UserDeviceInfo.STATUS_PENDING_VALUE
                                      ? UserDeviceInfo.STATUS_PENDING_TEXT
                                      : deviceInfo?.status ==
                                        UserDeviceInfo.STATUS_APPROVED_VALUE
                                        ? UserDeviceInfo.STATUS_APPROVED_TEXT
                                        : "";
                                await asyncStorageService.setDeviceInfoStatus(
                                  userDeviceInfoStatus
                                );
                                getDeviceInfo(response)
                              }
                            }
                          } 
                           else {
                            getDeviceInfo(response)
                          }
                        }
                      );
                    }
                  );
                } else {
                  getDeviceInfo(response)
                }
              } else if (error) {
                let errorMessage;
                const errorRequest = error?.response?.request;
                if (errorRequest && errorRequest.response) {
                  errorMessage = JSON.parse(errorRequest.response).message;
                  alert(errorMessage);
                  setIsSubmit(false)
                }
              }
            }
          );
        }
      }
    } catch (error) {
      if (error) {
        let errorMessage;
        const errorRequest = error.response.request;
        if (errorRequest && errorRequest.response) {
          errorMessage = JSON.parse(errorRequest.response).message;
          let responseError = error.response.data.message;
          Alert.Error(responseError);
        }
      }
    }
  };
  const getInputType = (value) => {
    // Regular expression for email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Regular expression for phone number validation
    const phoneRegex = /^\d{10}$/; // Modify this regex according to your phone number format

    if (emailRegex.test(value)) {
      return true;
    } else if (phoneRegex.test(value)) {
      return true;
    } else {
      return false;
    }
  };
  const handleChange = (value) => {
    if (value == "email") {
      if (!inputValue) {
        Alert.Error("Email is required");
      } else {
        const inputType = getInputType(inputValue);

        // check if the first character is not a number (i.e. email)
        if (!inputType) {
          Alert.Error("Invalid Email or Mobile Number");
        }
        if (
          inputValue &&
          Validation.isValidMobileNumber(inputValue) &&
          !showEmailPasswordFields
        ) {
          setShowEmailPasswordFields(true);
        }
        if (
          inputValue &&
          Validation.isValidEmail(inputValue) &&
          !showEmailPasswordFields
        ) {
          setShowEmailPasswordFields(true);
        }
      }
      if (
        ((inputValue && Validation.isValidEmail(inputValue)) ||
          Validation.isValidMobileNumber(inputValue)) &&
        showEmailPasswordFields
      ) {
        LoginByEmail();
      }
    } else {
      if (!inputValue) {
        Alert.Error("Mobile Number is required");
      } else if (!Validation.isValidMobileNumber(inputValue)) {
        Alert.Error("Mobile Number is invalid");
      }
      if (inputValue && Validation.isValidMobileNumber(inputValue)) {
        login();
      }
      setShowEmailPasswordFields(false);

      setPassword(value);
    }
  };
  const handleForgotPassword = () => {
    navigation.navigate("ForgotPassword");
  };
  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
    setOtpValue("");
  };

  const otpModalToggle = () => {
    setOtpModalVisible(!otpModalVisible);
    setIsModalVisible(!isModalVisible);
    setOtpValue("");
  };

  const login = () => {
    let data = { phone_number: inputValue, otpVerification: true };

    setOtpValue("");

    apiClient.post(
      `${endpoints().UserAPI}/getOtp`,
      data,
      async (error, response) => {
        if (response.data) {
          Toast.show(response.data.message);
          otpModalToggle();
          setOtpValue("");
        } else if (error) {
          let errorMessage;
          const errorRequest = error?.response?.request;
          if (errorRequest && errorRequest.response) {
            errorMessage = JSON.parse(errorRequest.response).message;
            alert(errorMessage);
          }
        }
      }
    );
  };

  const PasswordFieldOnChange = (value) => {
    setPassword(value);
  };
  const toggleInputType = () => {
    setInputType(inputType === "email" ? "mobile" : "email");
    setLabel(
      inputType === "email"
        ? "Enter Mobile Number (10-digit)"
        : "Enter Email Address"
    );
    setShowEmailPasswordFields(false);

    setInputValue(""); // Clear input value when switching input type
  };
  const handleInputChange = (text) => {
    setInputValue(text);
  };
  return (
    <Layout>
      <KeyboardAvoidingView
        style={styles.loginContainer}
      >
        <View
          style={{
            flex: platform.isIOS() ? 2.2 : 1,
            alignContent: "space-around",
          }}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: 20,
            }}
          >
            <Label
              text="Login"
              fontWeight={`400`}
              size={20}
              color={Color.BLACK}
            />
          </View>
          <View>
            <Text>{label}</Text>
            <View
              style={styles.textFeildDivider}
            >
              <TextInput
                placeholder="Email/Mobile"
                onChange={handleInputChange}
                name="email"
                value={inputValue}
                 hideBorder
                paddingVertical="0"
                
              />
              </View>
              <View
              style={styles.textFeildDivider}
            >       
              <TextInput
                placeholder="Password"
                name={"password"}
                onChange={PasswordFieldOnChange}
                secureTextEntry={true}
                value={password}
                  hideBorder
                paddingVertical="0"
              />
              </View>
            
            <VerticalSpace paddingBottom={10} />

            <Button
              title="Log in"
              onPress={() => LoginByEmail()}
              borderRadius = {10}
              isSubmit = {isSubmit}
            />

            <VerticalSpace paddingBottom={10} />

            {AppID.isZunoMart() && (
              <Button title="Signup" onPress={() => navigation.navigate("Signup")} style={{ borderRadius: 10 }} />
            )}


            <View
              style={styles.flexEnd}
            ></View>
          </View>

          <Text style={styles.forgotPassword} onPress={handleForgotPassword}>
            Forgot Password?
          </Text>
          <View
            style={styles.flexEnd}
          ></View>
      
        <Text style={styles.versionText}>{`Version ${version}`}</Text>
        </View>
        {/* <OTPModal
          LoginByMobile={LoginByEmail}
          OTPmodalVisible={otpModalVisible}
          setOtpModalVisible={otpModalToggle}
          otpValue={otpValue}
          setOtpValue={setOtpValue}
          phone_number={inputValue}
          loginModal={toggleModal}
        /> */}
      </KeyboardAvoidingView>
    </Layout>
  );
};
export default Login;


