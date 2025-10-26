#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const express = require('express')

function create(options = {}) {
    const app = express()
    const viewsRouter = express.Router()
    const viewsPath = options.viewsPath || path.join(process.cwd(), 'views')
    const controlsPath = options.controlsPath || path.join(process.cwd(), 'controls')

    /**
     * Recursively list all files in a directory
     *
     * @param {string} directory
     * @returns {string[]}
     */
    function listFiles(directory) {
        const result = []
        const files = fs.readdirSync(directory)
        for (let fCnt = 0; fCnt < files.length; fCnt++) {
            const file = path.join(directory, files[fCnt])
            if (fs.statSync(file).isDirectory()) {
                result.push(...listFiles(file))
            } else {
                result.push(file.replace(viewsPath, '\\views'))
            }
        }
        return result
    }

    viewsRouter.get('/', function (req, res, next) {
        if (req.baseUrl === '/views') {
            const files = listFiles(viewsPath)
            res.send(files)
            return
        }
        next()
    })

    app.use('/bin', express.static(path.join(__dirname, 'bin')))
    app.use('/src', express.static(path.join(__dirname, 'src')))
    app.use('/views', express.static(viewsPath), viewsRouter)
    app.use('/controls', express.static(controlsPath))

    return app
}

module.exports = create
