import apiClient from "../apiClient";
import { endpoints } from "../helper/ApiEndPoint";
import SQLLiteDB from "../lib/SQLLiteDB";
import ObjectLib from "../lib/Object";
import AlertModal from "../components/Alert";
import Numbers from "../lib/Number";
import systemLogService from "./SystemLogService";
import ObjectName from "../helper/ObjectName";
import asyncStorageService from "./AsyncStorageService";
import UserService from "../services/UserService";
import AsyncStorage from "../lib/AsyncStorage";

import AsyncStorageConstants from "../helper/AsyncStorage";
import axios from "axios";
import userService from "../services/UserService";
import Number from "../lib/Number";
class SyncService {

    static getData(params, callback) {
        try {

            const queryString = [];

            let apiUrl = `${endpoints().SyncApi}`

            if (params) {
                Object.keys(params).forEach((param) => {
                    queryString.push(`${param}=${params[param]}`);
                });
            }

            if (queryString.length > 0) {
                apiUrl = `${apiUrl}?${queryString.join("&")}`;
            }

            apiClient.get(apiUrl, (error, res) => {
                return callback(null, res)
            })
        } catch (err) {
            console.log(err);
        }
    }

    static async getForceSyncData(params, callback) {
        try {

            let sessionToken = await AsyncStorage.getItem(
                AsyncStorageConstants.SESSION_TOKEN
            );

            const queryString = [];

            let apiUrl = `${endpoints().ForceSync}`

            if (params) {
                Object.keys(params).forEach((param) => {
                    queryString.push(`${param}=${params[param]}`);
                });
            }

            if (queryString.length > 0) {
                apiUrl = `${apiUrl}?${queryString.join("&")}`;
            }

            axios({
                method: 'get',
                url: apiUrl,
                headers: {
                    "Content-Type": "application/json",
                    common: {
                        Authorization: sessionToken,
                    },
                },
            }).then((response) => {
                return callback(null, response)
            }).catch(error => {
                console.log(error);
                return callback(error, null)
            });
        } catch (err) {
            console.log(err);
        }
    }

    static getSyncData(masterData, localData, sourceName) {
        try {
            let updatedArray = new Array();

            if (masterData && masterData.length > 0) {


                if (localData && localData.length > 0) {

                    for (let i = 0; i < localData.length; i++) {

                        let deleteObj = masterData.find((data) => data.id == localData[i][sourceName]);

                        if (!deleteObj) {
                            localData[i].isDeletion = true;
                            updatedArray.push(localData[i])
                        }
                    }
                }

                for (let i = 0; i < masterData.length; i++) {

                    let updateData = localData && localData.find((data) => data[sourceName] == masterData[i].id);

                    if (updateData) {
                        masterData[i].isUpdation = true;
                        updatedArray.push(masterData[i]);
                    } else {
                        masterData[i].isNew = true;
                        updatedArray.push(masterData[i]);
                    }

                }
            }

            return updatedArray;
        } catch (err) {
            console.log(err);
        }
    }

    static async syncProductToSQLite(masterProductsList, isSingleProductSync) {
        try {

            let localProductsList = await SQLLiteDB.runQuery(SQLLiteDB.DB, `SELECT * FROM product_index`);

            let productList = this.getSyncData(masterProductsList, localProductsList, "product_id");

            // validate produc list exist or not
            if (productList && productList.length > 0) {
                //loop the product list
                for (let i = 0; i < productList.length; i++) {

                    //crea update object
                    let createData = {
                        product_name: productList[i].name,
                        brand_id: productList[i].brand_id,
                        category_id: productList[i].category_id,
                        size: productList[i].size,
                        unit: productList[i].unit,
                        product_display_name: productList[i].product_display_name,
                        brand_name: productList[i].brand,
                        category_name: productList[i].category,
                        company_id: productList[i].company_id,
                        featured_media_url: productList[i].image,
                        max_quantity: productList[i].max_quantity,
                        min_quantity: productList[i].min_quantity,
                        status: productList[i].statusValue,
                        barcode: productList[i].barcode,
                        print_name: productList[i].print_name,
                        cost: productList[i].cost,
                        sale_price: productList[i].sale_price,
                        mrp: productList[i].mrp,
                    }

                    if (productList[i].isNew) {

                        createData.product_id = productList[i].id;

                        let productObject = ObjectLib.getKeyValue(createData);

                        //insert data into sqlite
                        await SQLLiteDB.runQuery(SQLLiteDB.DB, `INSERT INTO product_index (${productObject.keyString}) VALUES (${productObject.createPlaceHolderString})`, productObject.valuesArrray);

                    } else if (productList[i].isUpdation) {

                        let updatedObj = ObjectLib.getKeyValue(createData);

                        await SQLLiteDB.runQuery(SQLLiteDB.DB, `UPDATE product_index SET ${updatedObj.updatePlaceHolderArray} WHERE product_id=${productList[i].id}`, updatedObj.valuesArrray);

                    } else if (productList[i].isDeletion && !isSingleProductSync) {

                        await SQLLiteDB.runQuery(SQLLiteDB.DB, `DELETE FROM product_index where id = ${productList[i].id}`);

                    }

                }

            }

        } catch (err) {
            console.log(err);
        }
    }

    static async syncProductPrice(masterProductPriceList, isSingleProductSync) {
        try {

            let localProductPriceList = await SQLLiteDB.runQuery(SQLLiteDB.DB, `SELECT * FROM product_price`);

            let productPriceList = this.getSyncData(masterProductPriceList, localProductPriceList, "product_price_id");

            for (let i = 0; i < productPriceList.length; i++) {

                let createData = {
                    product_id: Numbers.Get(productPriceList[i].product_id),
                    barcode: productPriceList[i].barCode,
                    cost_price: Numbers.GetFloat(productPriceList[i].costPrice),
                    sale_price: Numbers.GetFloat(productPriceList[i].salePrice),
                    mrp: Numbers.GetFloat(productPriceList[i].mrp),
                    company_id: Numbers.Get(productPriceList[i].companyId),
                    status: Numbers.Get(productPriceList[i].status)
                }

                if (productPriceList[i].isNew) {

                    createData.product_price_id = productPriceList[i].id;

                    let productPriceObject = ObjectLib.getKeyValue(createData);

                    //insert data into sqlite
                    await SQLLiteDB.runQuery(SQLLiteDB.DB, `INSERT INTO product_price (${productPriceObject.keyString}) VALUES (${productPriceObject.createPlaceHolderString})`, productPriceObject.valuesArrray);

                } else if (productPriceList[i].isUpdation) {

                    let updatedObj = ObjectLib.getKeyValue(createData);

                    await SQLLiteDB.runQuery(SQLLiteDB.DB, `UPDATE product_price SET ${updatedObj.updatePlaceHolderArray} WHERE product_price_id=${productPriceList[i].id}`, updatedObj.valuesArrray);

                } else if (productPriceList[i].isDeletion && !isSingleProductSync) {

                    await SQLLiteDB.runQuery(SQLLiteDB.DB, `DELETE FROM product_price where id = ${productPriceList[i].id}`);

                }

            }

        } catch (err) {
            console.log(err);
        }
    }

    static async SyncStatus(masterStatusList) {
        try {

            let localStatusList = await SQLLiteDB.runQuery(SQLLiteDB.DB, `SELECT * FROM status`);

            let statusList = this.getSyncData(masterStatusList, localStatusList, "status_id");

            if (statusList && statusList.length > 0) {

                for (let i = 0; i < statusList.length; i++) {

                    let statusObject = {
                        status_id: Numbers.Get(statusList[i].id),
                        name: statusList[i].name,
                        color_code: statusList[i].colorCode,
                        next_status_id: statusList[i].nextStatusIds,
                        sort_order: Numbers.Get(statusList[i].sortOrder),
                        allowed_role_id: statusList[i].allowedRoleIds,
                        object_id: statusList[i].objectId,
                        object_name: statusList[i].objectName,
                        update_quantity: Numbers.Get(statusList[i].updateQuantity),
                        company_id: Numbers.Get(statusList[i].companyId),
                        group_id: Numbers.Get(statusList[i].group),
                        allow_edit: Numbers.Get(statusList[i].allowEdit),
                        project_id: Numbers.Get(statusList[i].projectId),
                        default_owner : Numbers.Get(statusList[i].defaultOwner),
                        allow_cancel: Numbers.Get(statusList[i].allowCancel),
                        allow_product_add: Numbers.Get(statusList[i].allow_product_add),
                        update_transferred_quantity : Numbers.Get(statusList[i].update_transferred_quantity)
                    }

                    if (statusList[i].isNew) {

                        statusObject.status_id = Numbers.Get(statusList[i].id);

                        let updatedObj = ObjectLib.getKeyValue(statusObject);

                        //insert data into sqlite
                        await SQLLiteDB.runQuery(SQLLiteDB.DB, `INSERT INTO status (${updatedObj.keyString}) VALUES (${updatedObj.createPlaceHolderString})`, updatedObj.valuesArrray);

                    } else if (statusList[i].isUpdation) {

                        let updatedObj = ObjectLib.getKeyValue(statusObject);

                        await SQLLiteDB.runQuery(SQLLiteDB.DB, `UPDATE status SET ${updatedObj.updatePlaceHolderArray} WHERE status_id=${statusList[i].id}`, updatedObj.valuesArrray);

                    } else if (statusList[i].isDeletion) {

                        await SQLLiteDB.runQuery(SQLLiteDB.DB, `DELETE FROM status where id = ${statusList[i].id}`);

                    }

                }
            }


        } catch (err) {
            console.log(err);
        }
    }

    static async SyncOrderType(masterList) {

        try {
            await SQLLiteDB.runQuery(SQLLiteDB.DB, `DELETE FROM order_type`);

            let localList = await SQLLiteDB.runQuery(SQLLiteDB.DB, `SELECT * FROM order_type`);

            let orderTypeList = this.getSyncData(masterList, localList, "order_type_id");

            if (orderTypeList && orderTypeList.length > 0) {

                for (let i = 0; i < orderTypeList.length; i++) {

                    let objectData = {
                        name: orderTypeList[i].name,
                        company_id: Numbers.Get(orderTypeList[i].companyId),
                        show_customer_selection: Numbers.Get(orderTypeList[i].show_customer_selection),
                        allow_store_order: Numbers.Get(orderTypeList[i].allow_store_order),
                        allow_delivery: Numbers.Get(orderTypeList[i].allow_delivery),
                    }
                    if (orderTypeList[i].isNew) {
                        objectData.order_type_id = Numbers.Get(orderTypeList[i].id);

                        let updatedObj = ObjectLib.getKeyValue(objectData);

                        //insert data into sqlite
                        await SQLLiteDB.runQuery(SQLLiteDB.DB, `INSERT INTO order_type (${updatedObj.keyString}) VALUES (${updatedObj.createPlaceHolderString})`, updatedObj.valuesArrray);

                    } else if (orderTypeList[i].isUpdation) {

                        let updatedObj = ObjectLib.getKeyValue(objectData);

                        await SQLLiteDB.runQuery(SQLLiteDB.DB, `UPDATE order_type SET ${updatedObj.updatePlaceHolderArray} WHERE order_type_id=${orderTypeList[i].id}`, updatedObj.valuesArrray);

                    } else if (orderTypeList[i].isDeletion) {

                        await SQLLiteDB.runQuery(SQLLiteDB.DB, `DELETE FROM order_type where order_type_id = ${orderTypeList[i].id}`);
                    }
                }
            }
        } catch (err) {
            console.log(err);
        }
    }
    static async syncEvents(response, isSingleProductSync, callback) {
        try {

            let productList = response && response.data && response.data.productList;

            let priceList = response && response.data && response.data.priceList;

            let statusList = response && response.data && response.data.statusList;


            let shiftData = response && response.data && response.data.shiftData;

            let currentLocationId = response && response.data && response.data.currentLocationId;

            let currentShiftId = response && response.data && response.data.currentShiftId;


            let orderTypeList = response && response.data && response.data.orderTypeList;

            if (Number.isNotNull(currentLocationId)) {

                await asyncStorageService.setSelectedLocationId(
                  currentLocationId.toString()
                );
                await asyncStorageService.setSelectedLocationName(
                  response && response.data && response.data.locationName.toString()
                );
              }
              if (orderTypeList && orderTypeList.length > 0) {
                await this.SyncOrderType(orderTypeList);
            }
        
              if (Number.isNotNull(currentShiftId)) {
                await asyncStorageService.setShift(currentShiftId);
              }
        

            if (statusList && statusList.length > 0) {
                await this.SyncStatus(statusList);
            }

            if (productList && productList.length > 0) {
                await this.syncProductToSQLite(productList, isSingleProductSync);
            }

            if (priceList && priceList.length > 0) {
                await this.syncProductPrice(priceList, isSingleProductSync);
            }

            if(shiftData){
                await asyncStorageService.setShiftTime(`${shiftData?.shiftStartTime},${shiftData?.shiftEndTime}`);
            }

            let userId = await asyncStorageService.getUserId();

            if (userId) {
                systemLogService.create({ message: "Sync Completed", OBJECT_NAME: ObjectName.SYSTEM, OBJECT_ID: userId })
                userService.update(userId,{forceSync:"false"},()=>{})
            }

            return callback(productList);
        } catch (err) {
            console.log(err);
        }
    }

    static async SyncProduct(barCode, productId, callback) {
        try {
            let lastSyncDate = new Date();

            let params = new Object;

            if (barCode) {
                params.barCode = barCode;
            }

            if (productId) {
                params.productId = productId;
            }

            await asyncStorageService.setLastSync(lastSyncDate.toString());

            //get the product list
            SyncService.getData({ ...params }, async (error, response) => {

                SyncService.syncEvents(response, true, (productList) => {

                    return callback(productList);

                })

            })
        } catch (err) {
            console.log(err);
        }
    }

    static async Sync(callback) {
        try {
            let lastSyncDate = new Date();

            await asyncStorageService.setLastSync(lastSyncDate.toString());

            //get the product list
            SyncService.getData({}, async (error, response) => {
                //get the product list
                SyncService.syncEvents(response, false, (productList) => {


                    return callback(productList);

                })
            })
        } catch (err) {
            //show error toast message
            AlertModal("Error", err.message);
            return callback()
        }
    }

    static async forceSync() {
        try {

            let userId = await asyncStorageService.getUserId();

            if (userId) {
                //get the product list
                SyncService.getForceSyncData({}, async (error, response) => {

                    if (error) {
                        systemLogService.create({ message: `Mobile BackgroundFetch :  Sync API Error`, OBJECT_NAME: ObjectName.SYSTEM, OBJECT_ID: userId });
                        return false;
                    }

                    if (response && response.data && response.data.forceSync) {

                        let lastSyncDate = new Date();

                        await asyncStorageService.setLastSync(lastSyncDate.toString());

                        //get the product list
                        SyncService.syncEvents(response, false, async (productList) => {

                            UserService.updateForceSync(userId, { forceSync: false }, () => { })

                        });

                    }
                })
            }
        } catch (err) {
            //show error toast message
            AlertModal("Error", err.message);
            return callback()
        }
    }
}

export default SyncService;