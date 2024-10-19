const { default: apiClient } = require("../apiClient");
const { endpoints } = require("../helper/ApiEndPoint");
const { default: Url } = require("../lib/Url");



class LoyaltyService {
    static async search(params, callback) {
        try {
            let apiUrl = await Url.get(`${endpoints().accountLoyalty}/search`, params)
            apiClient.get(apiUrl, (err, response) => {
              return callback(response.data.data);
            });
      
          } catch (err) {
            console.log(err);
          }
    }
}
module.exports = LoyaltyService;