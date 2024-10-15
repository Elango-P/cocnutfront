import apiClient from "../apiClient";
import { endpoints } from "../helper/ApiEndPoint";
import asyncStorageService from "./AsyncStorageService";
import SQLLiteDB from "../lib/SQLLiteDB";
import Number from "../lib/Number";
import ArrayList from "../lib/ArrayList";
import Url from "../lib/Url";

class StatusService {

  static async search(objectName, callback) {
    let data = await asyncStorageService.getStatusList()

    let lists = [];
    await apiClient.get(`${endpoints().StatusAPI}/search?pagination=false`, async (error, response) => {
      const statusLists = response.data.data;
      if (statusLists && statusLists.length > 0) {
        statusLists.forEach((statusList) => {
          lists.push({
            value: statusList.id,
            sort_order: statusList.sort_order,
            objectName: statusList.objectName,
            nextStatus: statusList.nextStatus
          });
        });
      }
      if (lists && lists.length > 0)
        callback && callback(lists);
      lists = JSON.stringify(lists);
      await asyncStorageService.setStatusList(lists);
    })

  };

  static async getStatusIdByName(objectName, groupId) {
    try {

      if (objectName && groupId) {

        let status = await SQLLiteDB.runQuery(SQLLiteDB.DB, `SELECT * FROM status WHERE object_name='${objectName}' AND group_id=${groupId}`);

        if (ArrayList.isNotEmpty(status)) {
          return status[0].status_id;
        }

        return null
      }

    } catch (err) {
      console.log(err);
    }

  }

  static async getNextStatus(currentStatusId, projectId, callback) {
    try {
      let statusList = new Array();

      if (currentStatusId) {

        let statusDetail;

        let statusId;

        let where = ""

        if (projectId) {
          where = `status_id=${currentStatusId} AND project_id=${projectId}`
        } else {
          where = `status_id=${currentStatusId}`
        }

        let status = await SQLLiteDB.runQuery(SQLLiteDB.DB, `SELECT * FROM status WHERE ${where}`);

        if (ArrayList.isNotEmpty(status)) {

          let nextStatusIds = status[0].next_status_id;

          if (nextStatusIds) {

            nextStatusIds = nextStatusIds.split(",");

            if (nextStatusIds && nextStatusIds.length > 0) {

              for (let i = 0; i < nextStatusIds.length; i++) {

                statusId = Number.Get(nextStatusIds[i]);

                statusDetail = await SQLLiteDB.runQuery(SQLLiteDB.DB, `SELECT * FROM status WHERE status_id=${statusId}`);
                if (ArrayList.isNotEmpty(statusDetail)) {
                  statusList.push(statusDetail[0])
                }
              }
            }
          }
        }
        callback && callback(status)
      }

      return statusList;

    } catch (err) {
      console.log(err);
      return callback(err, null)
    }

  }

  static async list(objectName, objectId) {
    try {
      let statusList = [];
  
      // Check if objectName is provided
      if (objectName) {
        let objectNameStr = objectName.toString();
  
        // Initialize the base query
        let query = `SELECT * FROM status WHERE object_name = ?`;
        let params = [objectNameStr]; // Add objectName to the params array
  
        // Check if objectId is provided
        if (objectId) {
          if (Array.isArray(objectId) && objectId.length > 0) {
            // If it's an array, use the IN clause
            query += ` AND object_id IN (${objectId.map(() => '?').join(',')})`;
            params.push(...objectId); // Add all IDs to params array
          } else {
            // If it's a single value, use the equality check
            query += ` AND object_id = ?`;
            params.push(objectId); // Add the single ID to params array
          }
        }
  
        // Execute the query with parameters
        let status = await SQLLiteDB.runQuery(SQLLiteDB.DB, query, params);
  
        // Filter the status based on objectName (though this is redundant with the query)
        statusList = status?.filter((status) => status.object_name === objectNameStr);
  
        return statusList;
      }
    } catch (err) {
      console.log(err);
      return callback(err, null);
    }
  }

  static async getList(objectName, projectId) {
    try {

      if (objectName && projectId) {

        let status = await SQLLiteDB.runQuery(SQLLiteDB.DB, `SELECT * FROM status WHERE object_name='${objectName}' AND project_id=${projectId}`);
        let StatusList = status?.filter((status) => status.object_name == objectName)
        return StatusList
      }
    } catch (err) {
      console.log(err);
      return callback(err, null)
    }

  }

  static async getFirstStatus(objectName) {

    if (objectName) {

      let status = await SQLLiteDB.runQuery(SQLLiteDB.DB, `SELECT * FROM status WHERE object_name='${objectName}' ORDER BY sort_order ASC`);

      if (ArrayList.isNotEmpty(status)) {
        return {
          status_id: status[0].status_id,
          default_owner: status[0].default_owner
        };
      }

      return null
    }
  }

  static async get(statusId) {

    if (statusId) {

      let status = await SQLLiteDB.runQuery(SQLLiteDB.DB, `SELECT status_id,name,allow_edit,allow_cancel FROM status WHERE status_id=${statusId}`);

      if (ArrayList.isNotEmpty(status)) {
        return status[0];
      }

      return null
    }
  }

  static async statusList(params, callback) {
    await apiClient.get(Url.get(`${endpoints().StatusAPI}/list`, params), async (error, response) => {
      return callback(response && response.data &&  response.data.data ?  response.data.data : [])
    })
  }

}

export default StatusService;
