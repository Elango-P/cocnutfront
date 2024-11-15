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


import { useNavigation } from "@react-navigation/native";

import { Color } from "../helper/Color";

import Alert from "../components/Modal/Alert";

import Device from "../lib/Device";

import UserDeviceInfoService from "../services/UserDeviceInfoService";

import { version } from "../../package.json";


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
import Constants from 'expo-constants';
import styles from "../helper/Styles";
import LoginService from "../services/LoginService";
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

  

  const onUpdate = async () => {
    if (Platform.OS === "ios") {
      await Linking.openURL(`https://apps.apple.com/us/app/zunomart/id6464041231`);
    } else if (Platform.OS === "android") {
      await Linking.openURL(`https://play.google.com/store/apps/details?id=${AppID.getAppId()}`);
    }
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
            nameSpace:"com.zunostar",
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
              } else if (response && response.data && response.data) {
                let token = response?.data
                  ?response.data?.user?.token.toString()
                  : "";
                setOtpValue("");
                setOtpModalVisible(false);
                setIsModalVisible(false);
                await asyncStorageService.setSessionToken(token);


                if (AppID.isZunoMartStore() || AppID.isThiDiff() || AppID.isZunoStar) {

                  let bodyData = {
                    ipAddress: IpAddress,
                    deviceName: deviceName,
                    brandName: brandName,
                    network: network,
                    battery: battery,
                    unique_id: uniqueId,
                    user:response.data?.user?.id,
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
                              await LoginService.getDeviceInfo(response.data?.user,navigation,setPassword,setInputValue,setIsSubmit)
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
                                await LoginService.getDeviceInfo(response.data?.user,navigation,setPassword,setInputValue,setIsSubmit)
                              }
                            }
                          } 
                           else {
                           await LoginService.getDeviceInfo(response.data?.user,navigation,setPassword,setInputValue,setIsSubmit)
                          }
                        }
                      );
                    }
                  );
                } else {
                 await LoginService.getDeviceInfo(response.data?.user,navigation,setPassword,setInputValue,setIsSubmit)
                }
                  setShowEmailPasswordFields(false);
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

            {/* {AppID.isZunoMart() && (
              <Button title="Signup" onPress={() => navigation.navigate("Signup")} style={{ borderRadius: 10 }} />
            )} */}


            <View
              style={styles.flexEnd}
            ></View>
          </View>

          {/* <Text style={styles.forgotPassword} onPress={handleForgotPassword}>
            Forgot Password?
          </Text> */}
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


