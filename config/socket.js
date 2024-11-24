const { Server } = require('socket.io')

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
                rooms[roomId] = { mentor: null, students: [] }
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
            console.log(`Client ${socket.id} joined room ${roomId}`)

            socket.on('codeChange', code => {
                console.log(`Code change in room ${roomId} by ${socket.id}:`, code)
                socket.to(roomId).emit('codeUpdate', code)
            })

            socket.on('disconnect', () => {
                console.log('Client disconnected:', socket.id)

                if (room.mentor === socket.id) {
                    console.log(`Mentor left room ${roomId}`)
                    if (room.students.length === 0) {
                        delete rooms[roomId]
                    } else {
                        room.mentor = null
                        io.in(roomId).emit('mentorLeft')
                    }
                } else {
                    room.students = room.students.filter(id => id !== socket.id)
                    console.log(`Student ${socket.id} left room ${roomId}`)

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
