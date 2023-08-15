// @ts-nocheck
import axios from 'axios';
import config from '../../config.json';
import ServerMessageParser from '../ServerMessageParser';

/**
 * For authentication using JsonWebToken
 */
class Authentication {
    isAdmin() {
        if (!this.isUserAuthenticated()) {
            return false;
        }

        let user = this.getCurrentUser();
        if (user.roles.includes("Admin")) {
            return true;
        }
        return false;
    }

    isCompany() {
        if (!this.isUserAuthenticated()) {
            return false;
        }

        let user = this.getCurrentUser();
        if (user.roles.includes("Company")) {
            return true;
        }
        return false;
    }

    isCandidate() {
        if (!this.isUserAuthenticated()) {
            return false;
        }

        let user = this.getCurrentUser();
        if (user.roles.includes("Candidate")) {
            return true;
        }
        return false;
    }

    //  Check if current user is authenticated
    isUserAuthenticated() {
        let authToken = localStorage.getItem("authToken");
        if (authToken == null || authToken == undefined || authToken.length == 0) {
            return false;
        }
        return true;
    }

    generateAuthorizationHeader() {
        let authToken = localStorage.getItem("authToken");
        let tokenType = localStorage.getItem("tokenType");
        return tokenType + " " + authToken;
    }

    //  Get current user information
    getCurrentUser() {
        if (localStorage.getItem("user") != null) {
            return JSON.parse(localStorage.getItem("user"));
        }
    }

    changePassword(oldPassword, newPassword) {
        return new Promise((resolve, reject) => {
            if (!this.isUserAuthenticated()) {
                reject("Người dùng chưa đăng nhập");
            }

            axios({
                method: "PUT",
                url: `${config.server.domain}/password/change`,
                headers: {
                    Authorization: this.generateAuthorizationHeader(),
                },
                data: {
                    oldPassword: oldPassword,
                    newPassword: newPassword,
                }
            }).then((response) => {
                resolve(response.data);
            }).catch((error) => {
                reject(error);
            })
        })
    }

    //  Send login request to server
    //  Receive token and save to localStorage
    //  Get current user data from server and save to localStorage
    login(username, password) {
        return new Promise((resolve, reject) => {
            axios({
                method: "POST",
                url: `${config.server.domain}/login`,
                headers: {
                    "Content-Type": "application/json;charset=UTF-8",
                },
                data: {
                    email: username,
                    password: password,
                }
            }).then((response) => {
                let authToken = response.data.accessToken;
                let tokenType = response.data.tokenType;
                if (
                    authToken === undefined ||
                    authToken == null ||
                    authToken.length === 0
                ) {
                    reject("Không nhận được token đăng nhập");
                    return;
                }

                localStorage.setItem("authToken", authToken);
                localStorage.setItem("tokenType", tokenType);

                let url = ""
                if (response.data.user.roles[0] == "Company") {
                    url = `${config.server.domain}/company/${response.data.user.id}`
                } else if (response.data.user.roles[0] == "Candidate") {
                    url = `${config.server.domain}/candidate/${response.data.user.id}`
                } else {
                    localStorage.setItem("user", JSON.stringify(response.data.user));
                    resolve()
                    return
                }
                axios({
                    method: "GET",
                    url: url,
                    headers: {
                        Authorization: this.generateAuthorizationHeader()
                    }
                }).then((res) => {
                    localStorage.setItem("user", JSON.stringify({
                        ...response.data.user,
                        ...res.data
                    }));
                    resolve();
                    return
                })
            }).catch((error) => {
                if (error.response != undefined) {
                    reject(ServerMessageParser.parseObject(error.response.data));
                } else {
                    reject(["Không thể kết nối tới server"])
                }
            })
            // let request = new XMLHttpRequest();
            // request.open("POST", config.server.api.login.url);
            // request.setRequestHeader(
            //     "Content-Type",
            //     "application/json;charset=UTF-8"
            // );
            // request.onload = function () {
            //     if (this.status >= 200 && this.status < 400) {
            //         let response = JSON.parse(this.response);
            //         let authToken = response["accessToken"];
            //         let tokenType = response["tokenType"];
            //         if (
            //             authToken === undefined ||
            //             authToken == null ||
            //             authToken.length === 0
            //         ) {
            //             reject("Không nhận được token đăng nhập");
            //             return;
            //         }

            //         localStorage.setItem("authToken", authToken);
            //         localStorage.setItem("tokenType", tokenType);

            //         localStorage.setItem("user", JSON.stringify(response["user"]));
            //         resolve();
            //         return
            //     } else {
            //         let errors = ServerMessageParser.parse(this.response);
            //         reject(errors[0]);
            //         return
            //     }
            // };
            // request.send(
            //     JSON.stringify({
            //         email: username,
            //         password: password,
            //     })
            // );
        });
    }

    logout() {
        localStorage.removeItem("authToken");
        localStorage.removeItem("tokenType");
        localStorage.removeItem("user");
    }
}

export default new Authentication();
