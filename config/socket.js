const { Server } = require('socket.io')
const { executeCodeSafely } = require('../utils/executeCode')

let rooms = {}

const initSocket = server => {
    const io = new Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
    })

    io.on('connection', socket => {
        console.log('New client connected:', socket.id)

        socket.on('joinRoom', roomId => {
            if (!rooms[roomId]) {
                rooms[roomId] = { mentor: null, students: [], code: '' }
            }

            const room = rooms[roomId]

            if (!room.mentor) {
                room.mentor = socket.id
                socket.emit('assignRole', 'mentor')
            } else {
                room.students.push(socket.id)
                socket.emit('assignRole', 'student')
            }

            socket.join(roomId)
            io.in(roomId).emit('updateUsersCount', room.students.length + 1)
            socket.emit('codeUpdate', room.code)

            socket.on('codeChange', code => {
                room.code = code
                socket.to(roomId).emit('codeUpdate', code)
            })

            socket.on('executeCode', async code => {
                const result = await executeCodeSafely(code)
                socket.emit('executionResult', result)
            })

            socket.on('disconnect', () => {
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
            })
        })
    })
}

module.exports = { initSocket }
