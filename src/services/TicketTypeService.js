import Url from "../lib/Url";
import apiClient from "../apiClient";
import { endpoints } from "../helper/ApiEndPoint";

class TicketTypeService {


  async search(params, callback) {
    try {
      let apiUrl = await Url.get(`${endpoints().projectTicketTypeAPI}/list`, params)
      apiClient.get(apiUrl, (err, response) => {
        return callback(null, response);
      });

    } catch (err) {
      console.log(err);
    }
  }
}

const ticketTypeService = new TicketTypeService()

export default ticketTypeService;