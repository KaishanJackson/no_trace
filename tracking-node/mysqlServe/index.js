const mysql = require('mysql')
const connection=mysql.createConnection({
    host:'localhost',
    prot:'3036',
    user:'root',
    password:'Gs940527',
    database:'buryingSql'
})
module.exports = connection