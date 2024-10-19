import apiClient from "../apiClient";
import { endpoints } from "../helper/ApiEndPoint";
import Url from "../lib/Url";


class ProjectService {
    
   static async list(params, callback) {
        try {
          let projectList= new Array();

          let apiUrl = await Url.get(`${endpoints().projectAPI}/list`, params)
          apiClient.get(apiUrl, (error, response) => {

            let data = response?.data?.data
            data.forEach((list)=>{
              projectList.push({
                label : list.name,
                value :  list.id,
                allow_for_assignee_change_permission: list?.allow_for_assignee_change_permission
              })
            })
            callback && callback(projectList)
                
        });
    
        } catch (err) {
          console.log(err);
        }
      }
   
    }
    

export default ProjectService;