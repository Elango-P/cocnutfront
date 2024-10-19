import Setting from "../lib/Setting";
import asyncStorageService from "./AsyncStorageService";
import onePortalDB from "../db/onePortalDB";
import AppID from "../lib/AppID";
import settingService from "./SettingService";
import storeService from "./StoreService";
import device from "../lib/Device";
import userDeviceInfoService from "./UserDeviceInfoService";
import AsyncStorageObject from "../lib/AsyncStorage";

class LoginService {
  static async getDeviceInfo(
    responseData,
    navigation,
    setPassword,
    setInputValue,
    setIsSubmit
  ) {
    try {
      let deviceName = await device.GetDeviceName();
      let userId = responseData && responseData?.userId; // Safe navigation

      let params = { deviceName, user: userId };

      await userDeviceInfoService.search(params, async (err, response) => {
        if (err) {
          console.error("Error fetching device info:", err);
          return;
        }

        const resetMobileData =
          response && response?.data?.data[0]?.reset_mobile_data;

        // Check if reset_mobile_data is "true"
        if (resetMobileData === "true") {
          AsyncStorageObject.clearAll({ isClearAll: true });
        }

        // Handle login redirection
        return await this.LogInRedirection(
          responseData,
          navigation,
          setPassword,
          setInputValue,
          setIsSubmit
        );
      });
    } catch (err) {
      console.error("Error in getDeviceInfo:", err);
    }
  }

  static async LogInRedirection(
    response,
    navigation,
    setPassword,
    setInputValue,
    setIsSubmit
  ) {
    try {
      let role = response ? response?.role.toString() : "";

      let userId = response ? response?.userId.toString() : "";

      let locationList = response ? response?.locationList : [];

      let permissionList = response ? response?.permissionList : [];

      let settingList = response ? response?.settingList : [];

      let token = response ? response?.token.toString() : "";

      let firstName = response?.firstName ? response?.firstName : "";

      let lastName = response?.lastName ? response?.lastName : "";

      let accountId = response?.accountId ? response?.accountId : "";

      let featureList = response?.featureList ? response?.featureList : [];

      let name = `${firstName} ${lastName}`;
      let app_id = response
        ? response?.app_id && response?.app_id.toString()
        : "";

      await asyncStorageService.setSessionToken(token);

      await asyncStorageService.setUserName(name);

      await asyncStorageService.setRoleId(role);

      await asyncStorageService.setUserId(userId);

      await asyncStorageService.setAppId(app_id);

      if (accountId) {
        await asyncStorageService.setAccountId(accountId.toString());
      }
      const location = await device.getLocation();

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

      await onePortalDB.create();

      if (AppID.isZunoMartStore() || AppID.isThiDiff() || AppID.isZunoStar()) {
        if (locationList && locationList.length == 1) {
          asyncStorageService.setSelectedLocationName(locationList[0].name);

          asyncStorageService.setSelectedLocationId(
            locationList[0].id.toString()
          );

          await navigation.navigate("Dashboard", { login: true });
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
                    } else {
                      navigation.navigate("Dashboard", { login: true });
                    }
                  }
                );
              }
            }
          );
        }
      } else if (AppID.isZunoMart()) {
        navigation.navigate("Home");
      } else {
        if (locationList && locationList.length == 1) {
          asyncStorageService.setSelectedLocationName(locationList[0].name);
          asyncStorageService.setSelectedLocationId(
            locationList[0].id.toString()
          );
          await navigation.navigate("Dashboard", { login: true });
        }
        navigation.navigate("Dashboard", { login: true });
      }
      if (setPassword && setInputValue && setIsSubmit) {
        setPassword("");
        setInputValue("");
        setIsSubmit(false);
      }
    } catch (err) {
      console.log(err);
    }
  }
}
export default LoginService;
