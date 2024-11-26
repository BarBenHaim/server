const express = require('express')
const cors = require('cors')
const path = require('path')
const codeblockRoutes = require('./routes/codeBlocks.js')
const app = express()

app.use(cors())
app.use(express.json())

// Serve static files from frontend build
app.use(express.static(path.join(__dirname, 'public')))

// API routes
app.use('/api/codeblocks', codeblockRoutes)

// Catch-all for frontend routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

module.exports = app
