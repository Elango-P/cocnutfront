import { NativeModules } from "react-native";

import CompanyHelper from "../helper/Company";

// const { RNDeviceInfo } = NativeModules;

let DeviceInfo;
// if (RNDeviceInfo) {
//   DeviceInfo = require("react-native-device-info");
// }

class AppID {

    static isZunoMart() {
        const bundleId = DeviceInfo ? DeviceInfo.getBundleId() : null;
        return bundleId == CompanyHelper.ZUNOMART ? true : false;
    }

    static isThiDiff() {
        const bundleId = DeviceInfo ? DeviceInfo.getBundleId() : null;
        return bundleId == CompanyHelper.THIDIFF ? true : false;
    }

    static isZunoMartStore() {
        const bundleId = DeviceInfo ? DeviceInfo.getBundleId() : null;
        return bundleId == CompanyHelper.ZUNOMART_STORE ? true : false;
    }
    static isZunoStar() {
        const bundleId = DeviceInfo ? DeviceInfo.getBundleId() : null;
        return bundleId == CompanyHelper.ZUNOSTAR ? true : false;
    }

    static getAppId() {
        return DeviceInfo ? DeviceInfo.getBundleId() : null;
    }

    static getAppName(){
        return DeviceInfo ? DeviceInfo.getApplicationName() : null;
    }
}

export default AppID;