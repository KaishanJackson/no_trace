const connection = require('./index')

function saveSub(e) {
    return new Promise((resolve, reject) => {
        let sql = 'insert into clickinfo set X_PATH=? ,TEXT=? ,URL=?,NODE_NAME=?,TIME=?,EVENT=? , HEADER=? , BODY=?,EQUIPMENT=?,REQUEST_URL=?,FUNCTION_ARGUMENTS=?,FUNCTION_BODY=?,USER_INFO=?'
        let add_value = [e.xPath, e.text, e.url, e.nodeName,e.time,e.event,e.header,e.body,JSON.stringify(e.equipment),e.baseUrl,e.arguments,e.functionBody,JSON.stringify(e.userinfo)]
        console.log(sql,add_value)
        connection.query(sql, add_value, (err, result) => {
            try {
                if (err) {
                    reject(err)
                } else {
                    resolve('success')
                }
            } catch (error) {
                reject(error)
            }
        })
    })
}

function getSaveList(eventList){
    let list = []
    eventList.forEach(eventMap=>{
        list.push(saveSub(eventMap))
    })
    return list
}

module.exports = {
    saveSub,
    getSaveList
}