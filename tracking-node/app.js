const express = require('express')
const app = express()
const cors = require('cors')
app.use(express.json()) 
app.use(express.urlencoded({ extended: false }))

app.use(cors())
app.use('/save',require('./router/useBuryingPointInfo'))

app.listen('3000',()=>{
    console.log('已启动')
})