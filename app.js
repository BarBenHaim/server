const express = require('express')
const cors = require('cors')
const codeblockRoutes = require('./routes/codeBlocks.js')
const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/codeblocks', codeblockRoutes)

module.exports = app
