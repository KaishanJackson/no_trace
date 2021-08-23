const connection = require('./index')
function saveNode(saveList) {
    let saveNodeList = []
    saveList.forEach(e => {
        saveNodeList.push(saveOneNode(e))
    })
    return saveNodeList
}

function saveOneNode(e) {
    return new Promise((resolve, reject) => {
        let sql = 'insert into buryingPointInfo set X_PATH=? , TAG_NAME=? , URL=?, REMARKS=?, VESION=?,LABEL=?'
        let add_value = [e.xPath, e.tagName, e.url, e.remarks, e.vesion, e.label]
        connection.query(sql, add_value, (err, result) => {
            try {
                if (err) {
                    resolve(err)
                } else {
                    resolve('success')
                }
            } catch (error) {
                resolve(error)
            }


        })
    })
}
function searchAllNode() {
    let sql = `SELECT * FROM buryingpointinfo`
    return new Promise((resolve, reject) => {
        connection.query(sql, (err, res) => {
            try {
                if (err) reject(err)
                resolve(res)
            } catch (error) {
                reject(error)
            }
        })
    })
}
function searchNodeAll(searchList){
    let searchPromiseList = []
    searchList.forEach(e => {
        searchPromiseList.push(searchNode(e))
    })
    return searchPromiseList
}

function searchNode(searObj) {
    return new Promise((resolve, reject) => {
        let xPath = searObj.xPath
        let url = searObj.url
        let vesion = searObj.vesion
        let sql = `SELECT * FROM buryingpointinfo WHERE X_PATH='${xPath}' and URL = '${url}' and VESION = '${vesion}'`
        connection.query(sql, (err, res) => {
            try{
                if (res.length > 0) {
                    res.forEach(e => {
                        resolve(e)
                    })
                }else{
                    resolve('catch')
                }
            }catch(error){
                resolve('catch')
            }

        })
    })
}

function deletNode(id) {
    connection.query(`DELETE FROM buryingpointinfo WHERE ID = '${id}'`, (err, ers) => {
        try {
            if (err) return err
            if (res) return res
        } catch (err) {
            return err
        }
    })
}
module.exports = {
    saveNode,
    searchAllNode,
    searchNodeAll
}