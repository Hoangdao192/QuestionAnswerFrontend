// @ts-nocheck
import axios from 'axios';
import Authentication from 'services/Authentication/Authentication';

// import config from '../../config.json';

const url = process.env.SERVER_URL

// const getTemplate = (_method = "get", _url = process.env.SERVER_URL, _data, _headers) => {
//     return new Promise((resolve, reject) => {
//         axios({
//             method: _method, //you can set what request you want to be
//             url: _url,
//             data: _data,
//             headers: _headers
//           })
//     });
// }

const getListMajor = () => {
    return new Promise((resolve, reject) => {
        axios({
            method: "get", //you can set what request you want to be
            url: "http://localhost:5000/api/major",
        })
            .then((res) => {
                resolve(res.data)
            })
            .catch(error => reject(error));
    });
}

const getListCompanyDefault = () => {
    return new Promise((resolve, reject) => {
        axios({
            method: "get", //you can set what request you want to be
            url: "http://localhost:5000/api/company",
        })
            .then((res) => {
                resolve(res.data.elements)
            })
            .catch(error => reject(error));
    });
}

const getListJobDefault = () => {
    return new Promise((resolve, reject) => {
        axios({
            method: "get", //you can set what request you want to be
            url: "http://localhost:5000/api/job",
        })
            .then((res) => {
                resolve(res.data.elements)
            })
            .catch(error => reject(error));
    });
}
const getListJobFullFilter = (_filterKey) => {
    let filterKey = { ..._filterKey };
    if (filterKey.jobTitle == null)
        delete filterKey.jobTitle;
    if (filterKey.major == null)
        delete filterKey.major;
    if (filterKey.workingForm == null) {
        delete filterKey.workingForm;
    }

    return new Promise((resolve, reject) => {
        axios({
            method: "get", //you can set what request you want to be
            url: "http://localhost:5000/api/job",
            params: filterKey,
        })
            .then((res) => {
                resolve(res.data.elements)
            })
            .catch(error => reject(error));
    });
}

const getCompanyById = (_id) => {
    if (_id >= 0) {
        return new Promise((resolve, reject) => {
            axios({
                method: "get", //you can set what request you want to be
                url: "http://localhost:5000/api/company/" + _id,
            })
                .then((res) => {
                    resolve(res.data)
                })
                .catch(error => reject(error));
        });
    } else {
        return new Promise((resolve, reject) => {
            reject(null);
        });
    }
}

const getCandidateInfoByid = (_id) => {
    if (_id >= 0) {
        return new Promise((resolve, reject) => {
            axios({
                method: "get", //you can set what request you want to be
                url: "http://localhost:5000/api/candidate/" + _id,
                headers: {
                    Authorization: Authentication.generateAuthorizationHeader()
                },
            })
                .then((res) => {
                    resolve(res.data)
                })
                .catch(error => reject(error));
        });
    } else {
        return new Promise((resolve, reject) => {
            reject(null);
        });
    }
}

const isSavedJob = (_idJob, _idCandidate) => {
    let isSavedJobResult = false;
    return new Promise((resolve, reject) => {
        axios({
            method: "get", //you can set what request you want to be
            url: "http://localhost:5000/api/job/save?candidateId=" + _idCandidate,
            headers: {
                Authorization: Authentication.generateAuthorizationHeader()
            },
        })
            .then((res) => {
                res.data.elements.forEach(item => {
                    if (item.id && item.id == _idJob) {
                        isSavedJobResult = true;
                    }
                });
                resolve(isSavedJobResult)
            })
            .catch(error => reject(error));
    });
}

const saveJob = (_idJob, _idCandidate) => {
    return new Promise((resolve, reject) => {
        axios({
            method: "post", //you can set what request you want to be
            url: "http://localhost:5000/api/job/save",
            headers: {
                "Authorization": Authentication.generateAuthorizationHeader(),
                "Content-Type": "application/json"
            },
            data: {
                "jobId": _idJob,
                "candidateId": _idCandidate
            }
        })
            .then((res) => {
                resolve(res)
            })
            .catch(error => reject(error));
    });
}

const unSaveJob = (_idJob, _idCandidate) => {
    return new Promise((resolve, reject) => {
        axios({
            method: "delete", //you can set what request you want to be
            url: "http://localhost:5000/api/job/save/" + _idJob,
            headers: {
                "Authorization": Authentication.generateAuthorizationHeader(),
            },
        })
            .then((res) => {
                resolve(res)
            })
            .catch(error => reject(error));
    });
}

export {
    getListMajor,
    getListCompanyDefault,
    getListJobDefault,
    getListJobFullFilter,
    getCompanyById,
    getCandidateInfoByid,
    isSavedJob,
    saveJob,
    unSaveJob,
};