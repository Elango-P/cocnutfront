

import apiClient from "../apiClient";

import { endpoints } from "../helper/ApiEndPoint";

import asyncStorageService from "../services/AsyncStorageService";

import UserLocationService from "../services/UserLocation";

import * as Location from 'expo-location';

import Media from "../helper/Media";

import Alert from "../components/Modal/Alert";

import AsyncStorage from "../lib/AsyncStorage";

import AsyncStorageConstants from "../helper/AsyncStorage";
import Url from "../lib/Url";
import Currency from "../lib/Currency";

class AttendanceService {

    static async getAttendanceList(navigation, params, callback) {
        try {
            let apiUrl = await Url.get(`${endpoints().attendanceAPI}/list`, params)
            apiClient.get(apiUrl, (err, response) => {
              // Set response in state
              return callback(null, response.data.data);
            });
      
          } catch (err) {
            console.log(err);
          }
    }

    static async getDashboardData(callback) {
        try {
            apiClient
                .get(`${endpoints().attendanceAPI}/dashboard`, (error, response) => {
                    return callback(null, response);
                })
        } catch (err) {
            return callback(err, null);

        }
    }

    static async AddAttendance(navigation, bodyData, callback) {
        try {
            if (bodyData) {

                apiClient.post(`${endpoints().attendanceAPI}/checkIn`, bodyData, (error, response) => {

                    return callback(null, response);

                })
            }

        } catch (err) {
            console.log(err);
            return callback(err, []);
        }
    }
    static async Leave(bodyData, callback) {
        try {
            if (bodyData) {

                apiClient.post(`${endpoints().attendanceAPI}`, bodyData, (error, response) => {
                    return callback(null, response);
                })
            }

        } catch (err) {
            console.log(err);
            return callback(err, []);
        }
    }
    static async add(bodyData, callback) {
        try {
            if (bodyData) {

                apiClient.post(`${endpoints().attendanceAPI}`, bodyData, (error, response) => {

                    return callback(null, response);

                })
            }

        } catch (err) {
            console.log(err);
            return callback(err, []);
        }
    }

    static async create(bodyData, callback) {
        try {
            if (bodyData) {

                apiClient.post(`${endpoints().attendanceAPI}/checkIn`, bodyData, (error, response) => {

                    return callback(error, response);

                })
            }

        } catch (err) {
            console.log(err);
            return callback(err, []);
        }
    }


    static async getAttendanceDetail(navigation, attendanceId, callback) {
        try {
            if (attendanceId) {

                apiClient.get(`${endpoints().attendanceAPI}/${attendanceId}`, (error, response) => {
                    return callback(null, response);

                })
            }

        } catch (err) {
            console.log(err);
            return callback(err, null);
        }
    }

    static async updateAttendance(navigation, attendanceId, bodyData, callback) {
        try {

            if (attendanceId && bodyData) {

                apiClient.put(`${endpoints().attendanceAPI}/${attendanceId}`, bodyData, (error, response) => {

                    return callback(null, response);

                })
            }

        } catch (err) {
            console.log(err);
            return callback(err, null);
        }
    }

    static async updateCheckOut(bodyData, callback) {
        try {
            apiClient.post(`${endpoints().attendanceAPI}/checkOut`, bodyData, (error, response) => {
                return callback(null, response);

            })
        } catch (err) {
            console.log(err);
        }
    }

    static async Delete(id, callback) {
        try {
            if (id) {

                // apiClient
                apiClient.delete(`${endpoints().attendanceAPI}/delete/${id}`, (error, res) => {

                    return callback();
                })

            }
        } catch (err) {
            console.log(err);
            return callback(err, null);
        }
    }
    static async CheckOutValidation(id, callback) {
        try {
            if (id) {

                apiClient.put(`${endpoints().attendanceAPI}/checkOut/Validation/${id}`, null, (error, response) => {
                    return callback && callback(null, response);

                })
            }
        } catch (err) {
            console.log(err);
        }
    }

    static async AttendanceAttachment(bodyData, callback) {
        try {
            if (bodyData) {

                apiClient.fetch(`${endpoints().attendanceAPI}/attachment`, bodyData, (error, response) => {
                    return callback && callback(null, response);
                })
            }
        } catch (err) {
            console.log(err);
        }
    }


    static UpdateUserLocation = async () => {
        let location = await Location.getCurrentPositionAsync({});
        if (location) {
          let data = {
            latitude: location?.coords?.latitude,
            longitude: location?.coords?.longitude,
          };
    
          await UserLocationService.create(data, (err, result) => {});
        }
      };

    static async CheckIn(navigation, redirectionUrl, setIsLoading, params,data,imageUri) {

        let image;
        if(!imageUri){
             image = await Media.getImage();
        }
           let photoUri = imageUri ? imageUri:  image && image.assets && image.assets.length > 0 && image.assets[0].uri;

           if (imageUri || (image && image.canceled == false)) {

            let bodyData = {
                is_working_day: true
            };

            if (data && data.shift_id) {
                bodyData.shift_id = data.shift_id
            }

            if (data && data.store_id) {
                bodyData.store = data.store_id
            }
            setIsLoading && setIsLoading(true);
            AttendanceService.create(bodyData, async (error, response) => {
                if (response && response.data && response.data.attendance) {
                     AttendanceService.UpdateUserLocation();
                    let attendance = response.data.attendance;
                    AttendanceService.addAttachment(photoUri, attendance.id, "Check In", () => { });
                    if(response.data.minutes >0){
                        Alert.Error(`You are late by ${response?.data?.lateHours}\n${response?.data?.fineAmount ? `Fine Amount: ${Currency.IndianFormat(response?.data?.fineAmount)}` : ""}`,null,null,"Late CheckIn");
                    }

                    if(response.data.additionalMinutes >0){
                        Alert.Error(`You are Early Check-in by ${response?.data?.additionalHours}\n${response?.data?.bonusAmount ? `Bonus Amount: ${Currency.IndianFormat(response?.data?.bonusAmount)}` : ""}`,null,null,"Early Check-In");
                    }
                    if (redirectionUrl) {
                        params.shift = attendance?.shift_id
                        navigation && navigation.navigate(redirectionUrl, params);
                    }
                }

                if(error){
                    let param={
                        navigation: navigation
                    }
                    if(photoUri){
                        param.photoUri=photoUri
                    }

                    navigation && navigation.navigate("shiftSelect", param);
                }
                setIsLoading && setIsLoading(false);

            });
        }else{
            Alert.Error("Image Is Required");
            setIsLoading && setIsLoading(false);
        }
      
    }


    static async addAttachment(picture, attendanceId, activityType, callback) {
        try {

            if (picture) {

                const image = await fetch(picture);

                if (image) {

                    const file = await image.blob();

                    let imageUri = picture;

                    let data = new FormData();

                    let files = {
                        type: file?._data?.type,
                        size: file?._data.size,
                        uri: imageUri,
                        name: file?._data.name,
                    };

                    data.append("media_file", files);
                    data.append("name", file?._data.name);
                    data.append("media_url", imageUri);
                    data.append("media_name", file?._data.name);
                    data.append("attendanceId", attendanceId);
                    data.append("activityType", activityType);

                    AttendanceService.AttendanceAttachment(data, async (error, response) => {
                        return callback(null, response);
                    });
                } else {
                    return callback();
                }
            } else {
                return callback();
            }

        } catch (error) {
            console.log(error);
            return callback();
        }
    }



    static async checkOut(id,imageUri, callback) {
        try {
            let result;
            if(!imageUri){
                 result = await Media.getImage();
            }
            let photoUri = imageUri ? imageUri: result && result.assets && result.assets.length > 0 && result.assets[0].uri;
            if (imageUri || (result && result.canceled == false)) {

                let bodyData = {
                    attendanceId: id
                }

                await AttendanceService.updateCheckOut(bodyData, async (err, response) => {
                    if (response) {

                        this.addAttachment(photoUri, id, "Check Out", (err, res) => {
                            return callback(null, response);
                        });

                        return callback(response);
                    }
                    return callback();

                });
            } else {
                Alert.Error("Image Is Required");
            }

        } catch (err) {
            console.log(err);
        }
    }

    static async getMonthRecord(params, callback) {
        try {
            let apiUrl = await Url.get(`${endpoints().attendanceAPI}/monthRecord`, params)
            apiClient.get(apiUrl, (err, response) => {
              return callback(response.data.data);
            });
      
          } catch (err) {
            console.log(err);
          }
    }
}

export default AttendanceService;