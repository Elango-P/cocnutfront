import NetInfo from '@react-native-community/netinfo';

import Constants from 'expo-constants';

import { Platform, NativeModules } from "react-native";

import * as Battery from 'expo-battery';

import * as Location from 'expo-location';
import UserDeviceInfo from "../helper/UserDeviceInfo";
import userDeviceInfoService from "../services/UserDeviceInfoService";
import AsyncStorage from "./AsyncStorage";
import AsyncStorageConstants from "../helper/AsyncStorage";
import asyncStorageService from "../services/AsyncStorageService";


const { RNDeviceInfo } = NativeModules
let DeviceInfo;
if (RNDeviceInfo) {
  DeviceInfo = require('react-native-device-info');
}



class Device {


  async GetIpAddress(callback) {

    fetch('https://api.ipify.org?format=json')

      .then(response => response.json())

      .then(data => callback && callback(data.ip))

      .catch(error => console.log(error));
  }

  async NetWorkStatus(callback) {

    NetInfo.fetch().then(state => {

      callback && callback(state.isConnected);
    });

  }

  async getDeviceLocation(callback) {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status == 'granted') {
        Location.getLastKnownPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        })
          .then(location => {
            if (location && location.coords) {
              const latitude = location.coords.latitude;
              const longitude = location.coords.longitude;
              return callback({ latitude, longitude });
            } else {
              return callback(null);
            }
          })
          .catch(e => {
            console.log(e)
            return callback(null);
          });

      } else {
        console.error('Location permission not granted. Asking again...');
        return callback(null);
      }
    } catch (error) {
      console.error(error);
      return callback(null);
    }
  }

  async GetDeviceName(callback) {

    let deviceName = (Constants.deviceName)
          if(deviceName){
            return deviceName
          }
            return ""
  }

  async GetDeviceBrandName() {

    let brand = Platform.constants.Brand;
    if(brand){
      return brand
    }
    return ""
  }

  async GetBatteryPercentage(callback) {

    Battery.getBatteryLevelAsync().then(batteryLevel => {

      const roundedBatteryLevel = Math.round(batteryLevel * 100);

      callback && callback(roundedBatteryLevel);

    });

  }
  async getUniqueId() {
    if (DeviceInfo) {
      let id = await DeviceInfo.getBuildId()
      if(id){
        return id
      }
    }
    return ""
  }

  async isStatusBlocked(callback) {
    let status = await asyncStorageService.getDeviceInfoStatus();
    if (status === UserDeviceInfo.STATUS_BLOCKED_TEXT) {
      return callback && callback(true);
    } else {
      return callback && callback(false);
    }
    
  }
  async getLocation() {
    
    return new Promise((resolve, reject) => {
      this.getDeviceLocation((location) => {
  
        if (location) {
          resolve(location); 
        } else {
          resolve(null) 
        }
      });
    });
  }
  

   isSamsungDevice () {
    if (Platform.OS === 'android') {
      const modelName = Platform.constants.Manufacturer;
      return modelName === "samsung";
    }
    return false;
  };
  


}
const device = new Device;

export default device;