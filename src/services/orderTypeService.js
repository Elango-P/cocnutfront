import apiClient from "../apiClient";
import { endpoints } from "../helper/ApiEndPoint";
import Url from "../lib/Url";
import SQLLiteDB from "../lib/SQLLiteDB";
import OrderType from "../helper/OrderType";
import SyncService from "./SyncService";
import ArrayList from "../lib/ArrayList";

class OrderTypeService {
  static async list(params) {
    try {
      let query = `SELECT * FROM order_type`;

      let OrderTypeData = await SQLLiteDB.runQuery(SQLLiteDB.DB, query);

      let orderTypeList = [];

      if (OrderTypeData && OrderTypeData.length > 0) {
        // Fixing the loop condition

        for (let i = 0; i < OrderTypeData.length; i++) {
          orderTypeList.push({
            value: OrderTypeData[i]?.order_type_id,
            label: OrderTypeData[i]?.name,
            name: OrderTypeData[i]?.name,
            id: OrderTypeData[i]?.order_type_id,
            show_customer_selection:
              OrderTypeData[i]?.show_customer_selection ==
              OrderType.ENABLE_CUSTOMER_SELECTION
                ? true
                : false,
            allow_store_order:
              OrderTypeData[i]?.allow_store_order == OrderType.IS_STORE_ORDER
                ? true
                : false,
            allow_delivery:
              OrderTypeData[i]?.allow_delivery == OrderType.IS_DELIVERY_ORDER
                ? true
                : false,
          });
        }
      } else {
        let apiUrl = "";

        if (params) {
          apiUrl = await Url.get(`${endpoints().orderTypeAPI}/list`, params);
        } else {
          apiUrl = await Url.get(`${endpoints().orderTypeAPI}/list`);
        }

        // Wrapping the API call in a Promise to handle async behavior
        const response = await new Promise((resolve, reject) => {
          apiClient.get(apiUrl, (err, response) => {
            if (err) reject(err);
            resolve(response);
          });
        });

        if (response && response?.data && response?.data.length > 0) {
          for (let i = 0; i < response?.data.length; i++) {
            orderTypeList.push({
              value: response?.data[i]?.id,
              label: response?.data[i]?.name,
              name: response?.data[i]?.name,
              id: response?.data[i]?.id,
              show_customer_selection:
                response?.data[i]?.show_customer_selection ==
                OrderType.ENABLE_CUSTOMER_SELECTION
                  ? true
                  : false,
              allow_store_order:
                response?.data[i]?.allow_store_order == OrderType.IS_STORE_ORDER
                  ? true
                  : false,
              allow_delivery:
                response?.data[i]?.allow_delivery == OrderType.IS_DELIVERY_ORDER
                  ? true
                  : false,
            });
          }

          if (ArrayList.isArray(response?.data)) {
            await SyncService.SyncOrderType(response?.data);
          }
        }
      }
      return orderTypeList;
    } catch (err) {
      console.log(err);
    }
  }
}

export default OrderTypeService;
