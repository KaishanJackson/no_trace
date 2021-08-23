const express = require('express')
const router = express.Router()
const { saveNode,searchAllNode,searchNodeAll } = require('../mysqlServe/addInfo')
const { saveSub ,getSaveList} = require('../mysqlServe/addSub')

router.post('/', (req, res) => {
    if (req.body == {}) {
        res.send({
            code: 300,
            message: '没有数据传入'
        })
    } else {
        let searchPromiseList = searchNodeAll(req.body.jsonList)
        Promise.all(searchPromiseList).then(results=>{
            if(results.indexOf('catch')<0){
                let resultList = []
                results.forEach(e=>{
                    resultList.push(e.X_PATH)
                })
                res.send({
                    code:400,
                    message:resultList
                })
            }else{
                let promiseList = saveNode(req.body.jsonList)
                Promise.all(promiseList).then(result => {
                    let code;
                    let message;
                    if (result.indexOf('success') < 0) {
                        code = 300;
                        message = '上传失败'
                    } else {
                        code = 200
                        if (req.body.jsonList.length == result.length) {
                            message = '上传成功'
                        } else {
                            message = `上传成功，有${req.body.jsonList.length - result.length}上传失败`
                        }
                    }
                    res.send({
                        code,
                        message
                    })
                })
            }
        })

    }
})

router.post('/savesub', (req, res) => {
    if(!Array.isArray(req.body.eventMap)){
        let code;
        let message;
        saveSub(req.body.eventMap).then(res => {
            console.log(res)
            code = 200;
            message = res
        }).catch(err => {
            console.log(err)
            code = 300;
            message = err;
        })
        res.send({
            code,
            message
        })
    }else if(Array.isArray(req.body.eventMap)){
        let promiseList = getSaveList(req.body.eventMap)
        Promise.all(promiseList).then(result=>{
            res.send({
                code:200,
                message:'success'
            })
        })
    }   

})

router.get('/search',(req,res)=>{
    searchAllNode().then(result=>{
        res.send({
            code:200,
            data:result,
            message:'请求成功'
        })
    }).catch(err=>{
        res.send({
            code:300,
            message:err
        })
    })
})


module.exports = router