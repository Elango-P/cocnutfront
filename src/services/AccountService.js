import apiClient from "../apiClient";
import { endpoints } from "../helper/ApiEndPoint";
import Url from "../lib/Url";

class AccountService {
  async GetList(params, callback) {
    try {
      let apiUrl = await Url.get(`${endpoints().accountAPI}/list`, params);
      apiClient.get(apiUrl, (error, response) => {
        let accountList = new Array();
        let data = response?.data?.data;
        if (data && data.length > 0) {
          for (let i = 0; i < data.length; i++) {
            accountList.push({
              label: data[i].name,
              value: data[i].id,
              cash_discount: data[i].cash_discount,
              payment_account: data[i].payment_account,
              billing_name: data[i].billing_name,
            });
          }
        }
        // Set response in state
        callback && callback(accountList);
      });
    } catch (err) {
      console.log(err);
    }
  }


  async search(params, callback) {
    try {
      let apiUrl = await Url.get(`${endpoints().accountAPI}/search`, params);
      apiClient.get(apiUrl, (err, response) => {
        return callback(null, response);
      });
    } catch (err) {
      console.log(err);
    }
  }

  async update(id, updateData, callback) {
    try {
      apiClient.put(
        `${endpoints().accountAPI}/${id}`,
        updateData,
        (error, res) => {
          return callback(null, res);
        }
      );
    } catch (err) {
      console.log(err);
    }
  }

  async create(bodyData, callback) {
    try {
      apiClient.post(`${endpoints().accountAPI}`, bodyData, (error, res) => {
        return callback(null, res);
      });
    } catch (err) {
      console.log(err);
    }
  }

  async delete(id, callback) {
    try {
      apiClient.delete(`${endpoints().accountAPI}/${id}`, (error, response) => {
        if (response && response.data && response.data.message) {
          return callback(response.data.message);
        }
      });
    } catch (err) {
      console.log(err);
    }
  }

  async get(id,callback) {
    try {
        if (id) {

       apiClient.get(`${endpoints().accountAPI}/${id}`, (error, response) => {
        return callback(null, response);
        })
        }

    } catch (err) {
        console.log(err);
        return null;
    }
}

}

const accountService = new AccountService();

export default accountService;
