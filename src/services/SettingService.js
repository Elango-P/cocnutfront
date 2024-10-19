
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../apiClient";
import { endpoints } from "../helper/ApiEndPoint";
import OnePortalDB from "../lib/SQLLiteDB";
import Setting from "../lib/Setting";
import Url from "../lib/Url";
import asyncStorageService from "./AsyncStorageService";
import AsyncStorageConstants from "../helper/AsyncStorage";
import ArrayList from "../lib/ArrayList";

class SettingService {

    async GetStoreId(callback) {
        try {
            let setting = await OnePortalDB.runQuery(OnePortalDB.DB, `SELECT * FROM setting WHERE name ='${Setting.STORE_ID_SETTING}'`);
            callback && callback(setting[0].value)
        } catch (err) {
            console.log(err)
        }

    }
    async getByObjectIdAndObjectName(settingName,objectId,objectName,callback){
        if(settingName && objectId && objectName){
            let settings = await asyncStorageService.getSettings();

            if (settings) {
                settings = JSON.parse(settings);
                const data = settings.find(setting => setting.name === settingName);
                return callback(null, data ? data.value: null)

            } 
        }
        
    }

    async getByName(settingName, callback) {
        try {

            if (settingName) {

                let settings = await asyncStorageService.getSettings();

                if (settings) {
                    settings = JSON.parse(settings);
                    const data = settings.find(setting => setting.name === settingName);
                    return callback(null, data ? data.value: null)

                } else {

                    let sessionToken = await AsyncStorage.getItem(
                        AsyncStorageConstants.SESSION_TOKEN
                    );

                    if (sessionToken) {
                        apiClient.get(Url.get(`${endpoints().SettingAPI}`), async (error, response) => {
                            if (response) {
                                let settingList = response && response.data.settings;
                                if (settingList && ArrayList.isNotEmpty(settingList)) {
                                    const data = settingList.find(setting => setting.name === settingName);
                                    settingList = JSON.stringify(settingList);
                                    await asyncStorageService.setSettings(settingList);
                                    return callback(null, data ? data.value: null)
                                }
                            }
                        })
                    } else {
                        apiClient.public("get", Url.get(`${endpoints().PublicRoute}/setting`),null, async (error, response) => {
                            if (response) {
                                let settingList = response && response.data.settings;
                                if (settingList && ArrayList.isNotEmpty(settingList)) {
                                    const data = settingList.find(setting => setting.name === settingName);
                                    settingList = JSON.stringify(settingList);
                                    await asyncStorageService.setSettings(settingList);
                                    return callback(null, data ? data.value: null)

                                }
                            }
                        })
                    }

                }


            }

        } catch (err) {
            console.log(err);
            return callback(err, []);
        }

    }
    async get(name, callback, object_id) {
        try {

            let params = new Object();

            if (name) {

                params.name = name;

                if (object_id) {
                    params.object_id = object_id;
                }

                apiClient.get(Url.get(`${endpoints().SettingAPI}`, params), (error, response) => {

                    if (response) {
                        return callback(null, response.data);
                    }
                    return callback(null, null);
                })

            }

        } catch (err) {
            console.log(err);
            return callback(err, []);
        }
    }
    async update(updateData,callback) {
        try {
            apiClient.put(`${endpoints().SettingAPI}/company`, updateData,(error, res)=> {
               
                return callback(null, res)
          
              })
        }
      catch (err) {
            console.log(err);
        }
    }

    async getSetings  (params,callback)  {
        const data = await Url.get(`${endpoints().settingAPI}`, params)  

        await apiClient.get(data, (error, response) => {
            if(response){
                return callback(response);
            }
        })
      };
}
const settingService = new SettingService;

export default settingService;