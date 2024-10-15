import AsyncStorage from "../lib/AsyncStorage";
import AsyncStorageConstants from "../helper/AsyncStorage";
import OnePortalDB from "../lib/SQLLiteDB";
import ObjectLib from "../lib/Object";
import Order from "../helper/Order";
import ArrayList from "../lib/ArrayList";
import StatusService from "./StatusServices";
import ObjectName from "../helper/ObjectName";
import Number from "../lib/Number";
import apiClient from "../apiClient";
import { endpoints } from "../helper/ApiEndPoint";
import { ErrorMessage } from "../helper/ErrorMessage";
import Url from "../lib/Url";

let DB = OnePortalDB.open('oneportal.db');

class BulkOrderService {

    static async createOrder(customerId, customer_phone_number) {
        try {

            let locationId = await AsyncStorage.getItem(AsyncStorageConstants.SELECTED_LOCATION_ID)

            let orderStatus = await StatusService.getFirstStatus(ObjectName.ORDER_TYPE);

            let orderId;

            if (orderStatus) {

                const orderData = {
                    type: Order.TYPE_BULK_ORDER,
                    store_id: locationId ? parseInt(locationId) : null,
                    status: orderStatus?.status_id,
                    customer_account: customerId,
                    customer_phone_number: customer_phone_number
                }

                let orderObjValue = ObjectLib.getKeyValue(orderData);

                if (orderObjValue) {
                    // insert data into sqlite
                    orderId = await OnePortalDB.runQuery(DB, `INSERT INTO "order" (${orderObjValue.keyString}) VALUES (${orderObjValue.createPlaceHolderString})`, orderObjValue.valuesArrray);

                }

            }
            return orderId;
        } catch (err) {
            console.log(err);
        }
    }

    static async createOrderProduct(orderProductObject) {
        try {

            const { localOrderId, product_id, quantity, sale_price, cost_price, mrp } = orderProductObject;

            if (localOrderId) {

                let locationId = await AsyncStorage.getItem(AsyncStorageConstants.SELECTED_LOCATION_ID)

                let orderProductId;

                const orderProductData = {
                    local_order_id: localOrderId,
                    product_id: Number.Get(product_id),
                    quantity: Number.Get(quantity),
                    sale_price: Number.GetFloat(sale_price),
                    store_id: Number.Get(locationId),
                    cost_price: Number.GetFloat(cost_price),
                    mrp: Number.GetFloat(mrp),
                }

                let orderProductObjValue = ObjectLib.getKeyValue(orderProductData);

                if (orderProductObjValue) {
                    // insert data into sqlite
                    orderProductId = await OnePortalDB.runQuery(DB, `INSERT INTO order_product (${orderProductObjValue.keyString}) VALUES (${orderProductObjValue.createPlaceHolderString})`, orderProductObjValue.valuesArrray);
                }

                return orderProductId;
            }
        } catch (err) {
            console.log(err);
        }
    }

    static async updateOrderProduct(orderProductId, quantity) {

        if (orderProductId) {

            let updatedObj = ObjectLib.getKeyValue({ quantity });

            await OnePortalDB.runQuery(OnePortalDB.DB, `UPDATE order_product SET ${updatedObj.updatePlaceHolderArray} WHERE id=${orderProductId}`, updatedObj.valuesArrray);
        }
    }

    static async getProductCount(orderId) {

        if (orderId) {

            let orderProductCount = await OnePortalDB.runQuery(DB, `SELECT COUNT(product_id) AS productCount FROM order_product where local_order_id=${orderId}`);

            if (orderProductCount && ArrayList.isNotEmpty(orderProductCount))

                return orderProductCount[0]["productCount"];

        }
    }

    static async getProductList(orderId) {

        if (orderId) {

            let orderProductList = await OnePortalDB.runQuery(DB, `SELECT order_product.*, product_index.*, order_product.id AS orderProductId FROM order_product INNER JOIN product_index ON order_product.product_id = product_index.product_id  WHERE order_product.local_order_id=${orderId}`);

            if (orderProductList && ArrayList.isNotEmpty(orderProductList))

                return orderProductList;

        }
    }

    static async updateTotalAmount(orderId) {
        if (orderId) {

            let totalAmount = await OnePortalDB.runQuery(DB, `SELECT SUM(sale_price * quantity) AS totalAmount FROM order_product where local_order_id=${orderId}`);

            if (totalAmount && ArrayList.isNotEmpty(totalAmount))

                var updatedObj = ObjectLib.getKeyValue({ total_amount: totalAmount[0].totalAmount });

            await OnePortalDB.runQuery(OnePortalDB.DB, `UPDATE "order" SET ${updatedObj.updatePlaceHolderArray} WHERE id=${orderId}`, updatedObj.valuesArrray);
        }
    }

    static async getOrder(orderId) {

        if (orderId) {

            let orderData = await OnePortalDB.runQuery(DB, `SELECT * FROM "order" where id=${orderId}`);

            if (orderData && ArrayList.isNotEmpty(orderData)) {
                orderData = orderData[0];
            }

            return orderData;

        }
    }

    static async removeProduct(localOrderId, orderProductId) {

        if (orderProductId) {

            let isDeleted = await OnePortalDB.runQuery(DB, `DELETE FROM order_product where id=${orderProductId} AND local_order_id=${localOrderId}`);

            return isDeleted;

        }
    }

    static completeOrder(orderObject, orderProductList, callback) {
        try {
            apiClient.post(`${endpoints().orderAPI}/bulkOrder`, { orderObject, orderProductList }, (error, response) => {
              return callback(error, response);
            })
        } catch (err) {
            console.log(err);
        }
    }
}

export default BulkOrderService;