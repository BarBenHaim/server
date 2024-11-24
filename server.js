const http = require('http')
const app = require('./app')
const { initSocket } = require('./config/socket')
const connectDB = require('./config/db')

require('dotenv').config()

connectDB()

const server = http.createServer(app)

initSocket(server)

const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
