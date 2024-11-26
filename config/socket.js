const { Server } = require('socket.io')
const { executeCodeSafely } = require('../utils/executeCode')
const CodeBlock = require('../models/CodeBlock')
let rooms = {}
const fetchInitialCodeForRoom = async roomId => {
    try {
        // Query the database for the code block with the given ID
        const codeBlock = await CodeBlock.findById(roomId)

        // If found, return the initialCode
        if (codeBlock) {
            return codeBlock.initialCode
        } else {
            console.error('Code block with ID ${roomId} not found.')
            return 'function defaultFunction() { console.log("Default code"); }' // Fallback code
        }
    } catch (err) {
        console.error('Error fetching initial code for room ${roomId}:', err)
        return 'function errorFallback() { console.error("Failed to load code"); }' // Fallback code in case of an error
    }
}

const initSocket = server => {
    const io = require('socket.io')(server, {
        cors: {
            origin: ['http://localhost:3000', 'https://moveo-bar-ben-haim.onrender.com'],
            methods: ['GET', 'POST'],
        },
    })

    console.log('here it prints ')
    io.on('connection', socket => {
        console.log('New client connected:', socket.id)

        socket.on('joinRoom', async roomId => {
            try {
                // Fetch the initial code for the room and log it
                const initialCode = await fetchInitialCodeForRoom(roomId)
                console.log('Resolved Initial Code:', initialCode)

                // Initialize the room if it doesn't exist
                if (!rooms[roomId]) {
                    rooms[roomId] = { mentor: null, students: [], code: initialCode } // Use the fetched initial code
                }

                const room = rooms[roomId]

                // Assign roles
                if (!room.mentor) {
                    room.mentor = socket.id
                    socket.emit('assignRole', 'mentor')
                } else {
                    room.students.push(socket.id)
                    socket.emit('assignRole', 'student')
                }

                // Join the room and notify users
                socket.join(roomId)
                io.in(roomId).emit('updateUsersCount', room.students.length + 1)

                // Send the current code to the newly joined client
                socket.emit('codeUpdate', room.code)

                // Handle code changes
                socket.on('codeChange', code => {
                    room.code = code
                    socket.to(roomId).emit('codeUpdate', code)
                })

                // Handle code execution
                socket.on('executeCode', async code => {
                    const result = await executeCodeSafely(code)
                    socket.emit('executionResult', result)
                })

                // Handle disconnection
                socket.on('disconnect', () => {
                    console.log(`Client disconnected: ${socket.id}`)

                    if (room.mentor === socket.id) {
                        io.in(roomId).emit('mentorLeft')
                        delete rooms[roomId]
                    } else {
                        room.students = room.students.filter(id => id !== socket.id)
                        if (room.students.length === 0 && !room.mentor) {
                            delete rooms[roomId]
                        } else {
                            io.in(roomId).emit('updateUsersCount', room.students.length + 1)
                        }
                    }

                    socket.removeAllListeners()
                })
            } catch (error) {
                console.error('Error initializing room or fetching initial code:', error)
            }
        })
    })
}

module.exports = { initSocket }
