const request = require('request')
const {TASKMAN_API_URL} = process.env

const getTasks = (token, callback) => {
    const url = TASKMAN_API_URL + '/tasks?sortBy=createdAt:asc'
    
    request.get({
        url, 
        headers: {
            Authorization: 'Bearer ' + token
        }
    }, function(err,httpResponse,body){
        if ( err ) {
            callback('Something went wrong: ' + err, undefined)
        } else if ( httpResponse.statusCode !== 200) {
            callback('Something went wrong: ' + body, undefined)
        } else {
            callback(undefined, body)
        }
    })
}

const createTask = (token, requestData, callback) => {
    const url = TASKMAN_API_URL + '/tasks'
    
    request.post({
        url, 
        headers: {
            Authorization: 'Bearer ' + token
        },
        json: requestData
    }, function(err,httpResponse,body){
        if ( err ) {
            callback('Something went wrong: ' + err, undefined)
        } else if ( httpResponse.statusCode !== 201) {
            callback('Something went wrong: ' + body, undefined)
        } else {
            callback(undefined, body)
        }
    })
}

const deleteTask = (token, id, callback) => {
    const url = TASKMAN_API_URL + '/tasks/' + id
    request.delete({
        url, 
        headers: {
            Authorization: 'Bearer ' + token
        }
    }, function(err,httpResponse,body){
        if ( err || httpResponse.statusCode !== 200) {
            console.log(err)
            console.log(httpResponse.statusCode)
            callback('Something went wrong: ' + err, undefined)
        } else {
            console.log(body)
            callback(undefined, body)
        }
    })
}

const getTask = (token, id, callback) => {
    const url = TASKMAN_API_URL + '/tasks/' + id
    
    request.get({
        url, 
        headers: {
            Authorization: 'Bearer ' + token
        },
    }, function(err,httpResponse,body){
        if ( err ) {
            callback('Something went wrong: ' + err, undefined)
        } else if ( httpResponse.statusCode !== 200) {
            callback('Something went wrong: ' + body, undefined)
        } else {
            callback(undefined, body)
        }
    })
}

const updateTask = (token, id, requestData, callback) => {
    const url = TASKMAN_API_URL + '/tasks/' + id
    
    request.patch({
        url, 
        headers: {
            Authorization: 'Bearer ' + token
        },
        json: requestData
    }, function(err,httpResponse,body){
        if ( err ) {
            callback('Something went wrong: ' + err, undefined)
        } else if ( httpResponse.statusCode !== 200) {
            callback('Something went wrong: ' + body, undefined)
        } else {
            callback(undefined, body)
        }
    })
}

module.exports = {
    getTasks,
    createTask,
    deleteTask,
    getTask,
    updateTask
}