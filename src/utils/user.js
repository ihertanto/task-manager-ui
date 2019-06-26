const request = require('request')
const {TASKMAN_API_URL} = process.env

const cleanUserObject = (userObject) => {    
    if (userObject.name==='') {
        delete userObject.name
    }
    if (userObject.password==='') {
        delete userObject.password
    }
    if (userObject.age==='') {
        delete userObject.age
    } else {
        userObject.age = parseInt(userObject.age)
    }
    return userObject
}

const login = (requestData, callback) => {
    const url = TASKMAN_API_URL + '/users/login'
    
    request.post({
        url, 
        json: requestData, 
    }, function(err,httpResponse,body){
        if ( err ) {
            callback('Something went wrong: ' + err, undefined)
        } else if ( httpResponse.statusCode !== 200) {
            callback('Please check username & password', undefined)
        } else {
            callback(undefined, body)
        }
    })
}

const logout = (token, callback) => {
    const url = TASKMAN_API_URL + '/users/logoutAll'
    request.post({
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

const register = (requestData, callback) => {
    const url = TASKMAN_API_URL + '/users'
    
    request.post({
        url, 
        json: requestData, 
    }, function(err,httpResponse,body){
        if ( err ) {
            callback('Something went wrong: ' + err, undefined)
        } else if ( httpResponse.statusCode !== 201 ) {
            callback('Something went wrong: ' + body.message, undefined)
        } else {
            callback(undefined, body)
        }
    })
}

const updateProfile = (token, requestData, callback) => {
    const url = TASKMAN_API_URL + '/users/me'
    request.patch({
        url, 
        json: requestData, 
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

const deleteProfile = (token, callback) => {
    const url = TASKMAN_API_URL + '/users/me'
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


module.exports = {
    login,
    logout,
    cleanUserObject,
    register,
    updateProfile,
    deleteProfile,
}