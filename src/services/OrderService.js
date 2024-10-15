import AsyncStorage from "../lib/AsyncStorage";
import AsyncStorageConstants from "../helper/AsyncStorage";
import apiClient from "../apiClient";
import { endpoints } from "../helper/ApiEndPoint";
import Toast from "react-native-simple-toast";

import OnePortalDB from "../lib/SQLLiteDB";

import ObjectLib from "../lib/Object";
import AlertModal from "../components/Alert";
import Url from "../lib/Url";
import asyncStorageService from "./AsyncStorageService";
import Order from "../helper/Order";

let DB = OnePortalDB.open('oneportal.db');

class OrderService {
  async createOrder(bodyData, callback) {
    try {
      if (bodyData) {

        let locationId = await asyncStorageService.getSelectedLocationId(AsyncStorageConstants.SELECTED_LOCATION_ID);

        if (locationId && typeof bodyData == 'object') {
          bodyData.storeId = locationId;
        }

        let orderCreate = `${endpoints().orderAPI}`;

        apiClient
          .post(orderCreate, bodyData, (error, response) => {
if(response){
  return callback(null, response)
  
}else if(error && error?.response){
  return callback(error?.response, response)
}
          })
      }
    } catch (err) {
      return callback(err, null)
    }
  }


  async searchOrder(params, callback) {
    try {
      const queryString = [];

      let apiUrl;

      if (params) {
        Object.keys(params).forEach((param) => {
          queryString.push(`${param}=${params[param]}`);
        });
      }

      if (queryString && queryString.length > 0) {
        apiUrl = `${endpoints().orderAPI}/search?${queryString.join("&")}`;
      } else {
        apiUrl = `${endpoints().orderAPI}/search`;
      }


      apiClient
        .get(apiUrl, (error, response) => {
          return callback(null, response);
        })
    } catch (err) {
      return callback(err, null);

    }
  }

  async getDraftCount(params, callback) {
    try {
      let apiUrl = await Url.get(`${endpoints().orderAPI}/getDraftCount`, params)
      apiClient.get(apiUrl, (err, response) => {
        // Set response in state
        callback && callback(response);
      });

    } catch (err) {
      console.log(err);
    }
  } async getOrderCount(params, callback) {
    try {
      let apiUrl = await Url.get(`${endpoints().orderAPI}/orderCount`, params)
      apiClient.get(apiUrl, (err, response) => {
        // Set response in state
        callback && callback(response);
      });

    } catch (err) {
      console.log(err);
    }
  }
  async updateStatus(orderId, updateData, callback) {
    try {
      if (orderId) {

        apiClient
          .put(`${endpoints().orderAPI}/status/${orderId}`, updateData, (error, response) => {
            return callback(null, response)
          })
      }
    } catch (err) {
      return callback(err, null)
    }
  }

  async updateOrder(orderId, updateData, callback) {
    try {
      if (orderId) {

        apiClient
          .put(`${endpoints().orderAPI}/${orderId}`, updateData, (error, response) => {
            return callback(null, response)
          })
      }
    } catch (err) {
      return callback(err, null)
    }
  }

  async addOrderProduct(createData, callback) {
    try {
      if (createData) {


        apiClient
          .post(`${endpoints().orderProductAPI}/create`, createData, (error, response) => {
            return callback(null, response);
          })
      }
    } catch (err) {
      return callback(err, null)
    }
  }

  async updateOrderProduct(orderProductId, updatedData, callback) {
    try {
      if (orderProductId) {

        apiClient
          .put(`${endpoints().orderProductAPI}/update/${orderProductId}`, updatedData, (error, response) => {
            return callback(null, response);
          })
      }
    } catch (err) {
      return callback(err, null);
    }
  }

  async deleteOrderProduct(id, orderId, callback) {
    try {
      if (id) {

        apiClient
          .post(`${endpoints().orderProductAPI}/delete/${id}`, orderId, (error, res) => {
            return callback(null, res);
          })
      }
    } catch (err) {
      console.log(err);
      return callback(err, null);
    }
  }

  async cancel(id,data, callback) {
    try {
      if (id) {

        apiClient
          .post(`${endpoints().orderProductAPI}/cancel/${id}`, data, (error, res) => {
            return callback(null, res);
          })
      }
    } catch (err) {
      console.log(err);
      return callback(err, null);
    }
  }

  async DeleteOrder(id, callback) {
    try {
      if (id) {


        // apiClient
        apiClient.delete(`${endpoints().orderAPI}/${id}`, (error, res) => {
          if (res.data) {
            if (res.data.message) {
              Toast.show(res.data.message, Toast.LONG);
            }
          }
          return callback();
        })
      }
    } catch (err) {
      console.log(err);
      return callback(err, null);
    }
  }



  async getOrderProducts(params, callback) {
    try {

        let orderProducts = new Array();

        let totalAmount = 0;

        let totalQuantity = 0;

        let apiUrl = await Url.get(`${endpoints().orderProductAPI}/search`, params)

        apiClient
          .get(apiUrl, (error, response) => {

            if (response?.data?.data) {

              let reponseData = response?.data;

              let orderProductList = response?.data?.data;

              if (reponseData?.totalAmount) {
                totalAmount = reponseData?.totalAmount;
              }

              totalQuantity = reponseData?.totalQuantity

              if (orderProductList && orderProductList.length > 0) {

                for (let i = 0; i < orderProductList.length; i++) {

                  const { id, productDetails,amount, quantity, order_id,orderDate,locationName,order_number, price, unit_price, createdAt, updatedAt, media_id, media_url, store_id, status,allowEdit, statusId, barcode, mrp, allowCancel,manual_price } = orderProductList[i];
                  if (productDetails) {


                    orderProducts.push({
                      image: media_url ? media_url : productDetails.featured_media_url,
                      product_display_name: productDetails.product_display_name,
                      name: productDetails.product_name,
                      id: productDetails.product_id,
                      orderId: order_id,
                      orderDate : orderDate,
                      order_number : order_number,
                      locationName :locationName,
                      orderProductId: id,
                      product_id: productDetails.product_id,
                      quantity: quantity,
                      brand_name: productDetails.brand_name,
                      sale_price: unit_price,
                      mrp: mrp,
                      amount : amount,
                      company_id: productDetails.company_id,
                      createdAt: createdAt,
                      updatedAt: updatedAt,
                      media_id: media_id,
                      media_url: media_url,
                      store_id: store_id,
                      price: price,
                      status: status,
                      allowEdit : allowEdit,
                      statusId: statusId,
                      barcode: barcode,
                      created_at: orderProductList[i].created_at,
                      allowCancel : allowCancel,
                      cancelledAt: orderProductList[i].cancelledAt,
                      manual_price:manual_price
                    })
                  }
                }
              }
            }
            return callback(null, orderProducts, totalAmount, totalQuantity)
          })
    } catch (err) {
      console.log(err);
    }
  }

  async syncOrder(orderDetail) {
    try {
      if (orderDetail) {
        const createData = {
          order_id: orderDetail.id,
          date: orderDetail.date,
          total_amount: orderDetail.total_amount,
          store_id: orderDetail.store_id,
          company_id: orderDetail.company_id,
          created_at: orderDetail.createdAt,
          updated_at: orderDetail.updatedAt,
          order_number: orderDetail.order_number,
          status: orderDetail.status,
          owner: orderDetail.owner,
          shift: orderDetail.shiftDetail && orderDetail.shiftDetail.id,
          uuid: orderDetail.uuid,
          payment_type: orderDetail.payment_type,
          createdBy: orderDetail.createdBy
        }

        //get transfer
        let orderDetails = await OnePortalDB.runQuery(DB, `SELECT * FROM "order" WHERE order_id=${orderDetail.id}`);

        let orderObjectKeyValue = ObjectLib.getKeyValue(createData);

        //validate product exist or not
        if (orderDetails && Array.isArray(orderDetails) && orderDetails.length == 0) {

          if (orderObjectKeyValue) {
            // insert data into sqlite
            await OnePortalDB.runQuery(DB, `INSERT INTO "order" (${orderObjectKeyValue.keyString}) VALUES (${orderObjectKeyValue.createPlaceHolderString})`, orderObjectKeyValue.valuesArrray);
          }
        } else {
          //update the product data
          await OnePortalDB.runQuery(DB, `UPDATE "order" SET ${orderObjectKeyValue.updatePlaceHolderArray} WHERE order_id=${orderDetail.id}`, orderObjectKeyValue.valuesArrray);
        }

        this.getOrderProducts(null, orderDetail.id, async (error, orderProductList) => {

          if (orderProductList && orderProductList.length > 0) {

            for (let i = 0; i < orderProductList.length; i++) {

              const { id, orderId, product_id, quantity, sale_price, orderProductId, company_id, createdAt, updatedAt, media_id, media_url, store_id, price } = orderProductList[i];

              const orderProductCreateData = {
                order_product_id: orderProductId,
                order_id: orderId,
                product_id: product_id,
                quantity,
                sale_price: sale_price,
                price,
                store_id,
                media_id,
                media_url,
                company_id,
                created_at: createdAt,
                updated_at: updatedAt
              }


              //get transfer
              let orderproductExist = await OnePortalDB.runQuery(DB, `SELECT * FROM order_product WHERE product_id=${product_id} AND order_id=${orderId}`);

              let orderProductObjectKeyValue = ObjectLib.getKeyValue(orderProductCreateData);


              //validate product exist or not
              if (orderproductExist && Array.isArray(orderproductExist) && orderproductExist.length == 0) {

                if (orderProductObjectKeyValue) {
                  // insert data into sqlite
                  await OnePortalDB.runQuery(DB, `INSERT INTO order_product (${orderProductObjectKeyValue.keyString}) VALUES (${orderProductObjectKeyValue.createPlaceHolderString})`, orderProductObjectKeyValue.valuesArrray);
                }
              } else {
                //update the product data
                await OnePortalDB.runQuery(DB, `UPDATE order_product SET ${orderProductObjectKeyValue.updatePlaceHolderArray} WHERE product_id=${product_id} AND order_id=${orderId}`, orderProductObjectKeyValue.valuesArrray);
              }

            }
          }

        })

      }
    } catch (err) {
      console.log(err);
    }
  }

  async getOrderProductFromDB(orderId, callback) {
    try {

      if (orderId) {

        let updatedOrderProductList = new Array();

        //create total quantoty
        let totalAmount = 0;

        let totalQuantity = 0;

        let orderProductList = await OnePortalDB.runQuery(DB, `SELECT * FROM order_product WHERE order_id=${orderId} ORDER BY id DESC`);

        if (orderProductList && orderProductList.length > 0) {

          for (let i = 0; i < orderProductList.length; i++) {

            const {
              id,
              order_product_id,
              order_id,
              product_id,
              quantity,
              unit_price,
              price,
              store_id,
              media_id,
              media_url,
              company_id,
              created_at,
              updated_at } = orderProductList[i];

            //validate quantity exist or not
            if (price) {
              totalAmount += parseFloat(price);
            }

            if (quantity) {
              totalQuantity += quantity;
            }
            let productDetail = await OnePortalDB.runQuery(DB, `SELECT * FROM product_index WHERE product_id=${product_id}`);

            if (productDetail && productDetail.length > 0) {

              productDetail = productDetail[0];

              updatedOrderProductList.push({
                localOrderProductId: id,
                image: productDetail.featured_media_url,
                product_display_name: productDetail.product_display_name,
                name: productDetail.product_name,
                id: productDetail.product_id,
                orderId: order_id,
                orderProductId: order_product_id,
                product_id: productDetail.product_id,
                quantity: quantity,
                brand_name: productDetail.brand_name,
                sale_price: unit_price,
                mrp: productDetail.mrp,
                company_id: productDetail.company_id,
                createdAt: created_at,
                updatedAt: updated_at,
                media_id: media_id,
                media_url: media_url,
                store_id: store_id,
                price: price,
              })
            }
          }
          return callback(null, updatedOrderProductList, totalAmount, totalQuantity)
        } else {
          return callback(null, [], "", "")
        }
      }


    } catch (err) {
      console.log(err);
      return callback(err, [], "")
    }
  }

  async orderProductBulkInsert(orderId, orderProducts, totalAmount) {
    try {

      if (orderId && orderProducts) {

        let bodyData = {
          orderId: orderId,
          orderProducts: orderProducts,
          totalAmount
        };

        apiClient.post(`${endpoints().orderProductAPI}/bulkInsert`, bodyData, (error, response) => {

        })
      }
    } catch (err) {
      console.log(err);
    }
  }

  async orderProductBulkUpdate(orderProducts, totalAmount) {
    try {
      if (orderProducts) {


        let bodyData = {
          orderProducts: orderProducts,
          totalAmount
        };

        apiClient.put(`${endpoints().orderProductAPI}/bulkUpdate`, bodyData, (error, response) => {

        })
      }
    } catch (err) {
      console.log(err);
    }
  }

  async updateOrderProducts(orderId) {
    try {
      let orderProductList = await OnePortalDB.runQuery(DB, `SELECT * FROM order_product WHERE order_id=${orderId}`);

      let orderDetail = await OnePortalDB.runQuery(DB, `SELECT * FROM 'order' WHERE order_id=${orderId}`);

      let totalAmount;

      if (orderDetail && orderDetail.length > 0) {
        orderDetail = orderDetail[0];
        totalAmount = orderDetail && orderDetail.total_amount;
      }

      let addedOrderProductList = new Array();

      let updateOrderProductList = new Array();

      if (orderProductList && orderProductList.length > 0) {

        for (let i = 0; i < orderProductList.length; i++) {
          const {
            order_product_id,
            order_id,
            product_id,
            quantity,
            unit_price,
            price,
            store_id,
            media_id,
            media_url,
            company_id,
          } = orderProductList[i];


          if (!order_product_id) {
            addedOrderProductList.push({
              order_id,
              product_id,
              quantity,
              unit_price,
              price,
              store_id,
              media_id,
              media_url,
              company_id,
            })
          } else {
            updateOrderProductList.push({
              order_product_id,
              order_id,
              product_id,
              quantity,
              unit_price,
              price,
              store_id,
              media_id,
              media_url,
              company_id,
            })
          }
        }

        if (updateOrderProductList && updateOrderProductList.length > 0) {
          this.orderProductBulkUpdate(updateOrderProductList, totalAmount, () => { });
        }

        if (addedOrderProductList && addedOrderProductList.length > 0) {
          this.orderProductBulkInsert(orderId, addedOrderProductList, totalAmount, () => { });
        }

      }

      return true;

    } catch (err) {
      console.log(err);
    }
  }

  async completeOrder(orderId, body, callback) {
    try {
      if (orderId) {

        apiClient
          .put(`${endpoints().orderAPI}/completeOrder/${orderId}`, body, (error, response) => {
            return callback(null, response);
          })
      }
    } catch (err) {
      return callback(err, null);
    }
  }
  async createCustomerOrder(bodyData, callback) {
    try {
      if (bodyData) {

        let orderCreate = `${endpoints().customerOrderAPI}`;

        apiClient
          .post(orderCreate, bodyData, (error, response) => {
              return callback(null, response)
          })
      }
    } catch (err) {
      return callback(err, null)
    }
  }


}

const orderService = new OrderService();

export default orderService;
