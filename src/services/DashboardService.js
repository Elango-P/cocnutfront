
import apiClient from "../apiClient";
import { endpoints } from "../helper/ApiEndPoint";
import Status from "../helper/Status";
import DateTime from "../lib/DateTime";
import Url from "../lib/Url";
import activityService from "./ActivityService";
import AttendanceService from "./AttendanceService";
import fineService from "./FineService";
import orderTotalAmountService from "./OrderTotalAmountService";
import ticketService from "./TicketServices";

class DashboardService {

    async get(callback) {

        AttendanceService.getDashboardData((error, response) => {

            return callback(error, response)

        })
    }
    async getCount(params, callback) {
        try {
          let apiUrl = await Url.get(`${endpoints().mobileDashboardApi}/get`, params)
          apiClient.get(apiUrl, (err, response) => {
            return callback(null,response);
          });
    
        } catch (err) {
          console.log(err);
        }
      }

    async getFine(callback,param={}) {
        let params = { sort: "date", sortDir: "DESC", group: Status.GROUP_PENDING, pageSize: 2,...param };
        fineService.search(params, (err, response) => {

            let fines = response && response?.data && response?.data?.data;

            callback(fines)
        });
    }
    async getActivity(callback,param={}) {
        let params = { sort: "id", sortDir: "DESC", group: Status.GROUP_PENDING, pageSize: 3,...param };
        activityService.search(params, (err, response) => {

            let activites = response && response?.data && response?.data?.data;

            callback(activites)
        });
    }



    async getTicket(callback) {
        let params = { group: Status.GROUP_PENDING, startDate: DateTime.formatDate(new Date()), endDate: DateTime.toISOEndTimeAndDate(new Date()) };
        ticketService.searchTicket(params, (err, response) => {

            let tickets = response && response?.data && response?.data?.data;

            callback(tickets)
        });
    }
    async getOrder(setTodayAmount) {

        orderTotalAmountService.getTodayAmount(null, (error, response) => {
            let todayAmount = response && response?.data && response?.data?.todayAmount?.amount;

            setTodayAmount(todayAmount);
        })
    }
    
}
const dashboardService = new DashboardService();

export default dashboardService;