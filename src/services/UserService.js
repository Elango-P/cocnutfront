import apiClient from "../apiClient";
import { endpoints } from "../helper/ApiEndPoint";
import Permission from "../helper/Permission";
import { getFullName } from "../lib/Format";
import Url from "../lib/Url";
import PermissionService from "./PermissionService";


class UserService {

    async getList(callback) {
        try {
                let list = new Array();

                apiClient.get(`${endpoints().UserAPI}/list`, (error, response) => {
                    if (response.data && response.data && response?.data?.data) {
                        let userList = response?.data?.data;
                        if (userList && userList.length > 0) {
                            for (let i = 0; i < userList.length; i++) {
                                list.push({
                                    firstName: userList[i].first_name,
                                    lastName: userList[i].last_name,
                                    id: userList[i].id,
                                    media_url: userList[i].media_url

                                });
                            }
                            return callback(null, list);
                        }
                    }
                })

        } catch (err) {
            console.log(err);
            return callback(err, []);
        }

    }

    async list(params, callback) {
        try {
            let apiUrl = await Url.get(`${endpoints().UserAPI}/list`, params);
    
            apiClient.get(apiUrl, (error, response) => {
                let userList = [];
                let data = response?.data?.data;
                if (data && data.length > 0) {
                    for (let i = 0; i < data.length; i++) {
                        const fullName = getFullName(data[i].first_name, data[i].last_name);
                            if (!fullName) {
                            continue;
                        }
    
                        userList.push({
                            label: fullName,
                            value: data[i].id,
                            id: data[i].id,
                            image: data[i].media_url,
                            firstName: data[i].first_name,
                            lastName: data[i].last_name,
                        });
                    }
                }
                // Set response in state
                callback && callback(userList);
            });
    
        } catch (err) {
            console.log(err);
        }
    }
    

    async search(params, callback) {
        try {
            let apiUrl = await Url.get(`${endpoints().UserAPI}/search`, params)
            apiClient.get(apiUrl, (error, response) => {

                let userList = new Array();
                let data = response?.data?.data;
                if (data && data.length > 0) {
                    for (let i = 0; i < data.length; i++) {
                        userList.push({
                            fullname: data[i].fullname,
                            firstName: data[i].first_name,
                            lastName: data[i].last_name,
                            mobileNumber: data[i].mobileNumber1,
                            email: data[i].email,
                            roleName: data[i].role_name,
                            role_id: data[i].role_id,
                            type: data[i].type,
                            id: data[i].id,
                            media_url: data[i].userImage,
                            status: data[i].status,
                            timeZone: data[i].timeZone,
                            last_loggedIn_At: data[i].last_loggedin_at,
                            reset_mobile_data: data[i].reset_mobile_data,

                        });
                    }
                }
                // Set response in state
                callback && callback(userList);

            });

        } catch (err) {
            console.log(err);
        }
    }
    async getProjectUserList(params, callback) {
        try {
            let apiUrl = await Url.get(`${endpoints().UserAPI}/project/user/list`, params)
            apiClient.get(apiUrl, (error, response) => {

                let userList = new Array();
                let data = response?.data?.data;
                if (data && data.length > 0) {
                    for (let i = 0; i < data.length; i++) {
                        userList.push({
                            label: getFullName(data[i].first_name, data[i].last_name),
                            value: data[i].id,
                            image: data[i].media_url
                        });
                    }
                }
                // Set response in state
                callback && callback(userList);

            });

        } catch (err) {
            console.log(err);
        }
    }

    async getSalesExecutiveList(callback) {
        try {

            apiClient.get(`${endpoints().UserAPI}/list`, (error, response) => {
                if (response.data && response.data) {
                    return callback(null, response);
                }
            })

        } catch (err) {
            console.log(err);
            return callback(err, []);
        }

    }

    async get(userId, callback) {
        try {

            apiClient.get(`${endpoints().UserAPI}/${userId}`, (error, response) => {
                if (response.data && response.data) {
                    return callback(null, response);
                }
            })

        } catch (err) {
            console.log(err);
            return callback(err, []);
        }

    }
    async create(bodyData, callback) {
        try {
            if (bodyData) {
                apiClient.post(`${endpoints().UserAPI}`, bodyData, (error, res) => {
                    return callback(null, res)
                })
            }

        } catch (err) {
            console.log(err);
            return callback(err, "")
        }
    }

    async update(id, updateData, callback) {
        try {
            apiClient.put(`${endpoints().UserAPI}/${id}`, updateData, (error, res) => {

                return callback(null, res)

            })
        }
        catch (err) {
            console.log(err);
        }
    }
    async bulkUpdate(data, callback) {
        try {
            apiClient.put(`${endpoints().UserAPI}/bulkUpdate`, data, (error, res) => {

                return callback(null, res)

            })
        }
        catch (err) {
            console.log(err);
        }
    }


    async updateForceSync(id, updateData, callback) {
        try {
            apiClient.put(`${endpoints().UserAPI}/forceSync/${id}`, updateData, (error, res) => {

                return callback(null, res)

            })
        }
        catch (err) {
            console.log(err);
        }
    }

    async Delete(id, callback) {
        try {
            if (id) {


                // apiClient
                apiClient.delete(`${endpoints().UserAPI}/${id}`, (error, res) => {

                    return callback(res);
                })
            }
        } catch (err) {
            console.log(err);
            return callback(err, null);
        }
    }

    async SingUp(bodyData, callback) {
        try {
            // apiClient
            apiClient.public("post", `${endpoints().UserAPI}/signUp`, bodyData, (error, res) => {

                return callback(error, res);
            })
        } catch (err) {
            console.log(err);
            return callback(err, null);
        }
    }

    async getProfileData(callback) {
        try {

            apiClient.get(`${endpoints().UserAPI}/`, (error, response) => {
                if (response.data && response.data) {
                    return callback(null, response);
                }
            })

        } catch (err) {
            console.log(err);
            return callback(err, []);
        }

    }

}

const userService = new UserService();

export default userService;