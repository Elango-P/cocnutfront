import apiClient from "../apiClient";
import { endpoints } from "../helper/ApiEndPoint";
import Url from "../lib/Url";

class TicketService {
  async search(setIsLoading, callback) {
    try {
      setIsLoading && setIsLoading(true)

      await apiClient.get(`${endpoints().TicketApi}/search?`, (error, res) => {
        if (res.data) {
          setIsLoading && setIsLoading(false)
          return callback(res.data.data)
        }
      })
    } catch (err) {
      setIsLoading && setIsLoading(false)
      console.log(err);
    }
  }
  async searchTicket(params, callback) {
    try {
      let apiUrl = await Url.get(`${endpoints().TicketApi}/search`, params)
      apiClient.get(apiUrl, (err, response) => {
        return callback(null, response);
      });

    } catch (err) {
      console.log(err);
    }
  }

  async create(bodyData, callback) {
    try {

      apiClient.fetch(`${endpoints().TicketApi}`, bodyData, (error, response) => {
        return callback && callback(null, response);
      })

    } catch (err) {
      return callback(err, null);
    }
  }

  async update(id, updateData, callback) {

    apiClient.put(`${endpoints().TicketApi}/${id}`, updateData, (error, response) => {
      if (response && response.data && response.data.message) {
        return callback(null, response);
      }

    })
  }

  async get(params, callback) {
    try {
      apiClient.get(`${endpoints().TicketApi}/${JSON.stringify(params)}`, (error, response) => {
        return callback(null, response);
      })
    } catch (err) {
      console.log(err);
      return callback(err, []);
    }
  };
  
  async delete(id, callback) {
    try {
      apiClient.delete(`${endpoints().TicketApi}/${id}`, (error, response) => {
        if (response && response.data && response.data.message) {
          return callback(response.data.message);
        }


      })
    }
    catch (err) {
      console.log(err);
    }
  }

}
const ticketService = new TicketService()
export default ticketService;