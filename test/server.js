#!/usr/bin/env node

const path = require('path')
const express = require('express')
const app = express()

const templates = require('../app.js')({ viewsPath: path.join(__dirname, '../viewsSync') })

app.use(templates)
app.use('/test', express.static(path.join(__dirname, '../test')))

const server = app.listen(5050, function () {
    console.log('server started on port 5050')
})

// process manager
function terminate() {
    server.close()
    console.log(`server stopped`)
    process.exit(0)
}
process.on('SIGINT', terminate)
process.on('SIGTERM', terminate)
process.on('SIGUSR2', terminate)
