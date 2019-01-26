let WebSocket = require('ws').Server

let resHandle = new Map()
let users = {}

function WebSocketServer(option) {
    let wsserver = new WebSocket(option)

    wsserver.on('connection', function(connection) {
        connection.otherUsers = new Set() //所有的接收方用户

        connection.on('message', function(event) {
            console.log('The connection to message', event)
            let data = JSON.parse(event)
            if(data.type != null) {
                resHandle.get(data.type)(connection, data)
            } else {
                sendTo(conn, {
                    type: 'error',
                    message: 'data is not JSON'
                })
            }
        })

        connection.on('close', function() {
            let myName = connection.name
            if(myName != null) {
                delete users[myName]
                for(let item of connection.otherUsers.values()) {
                    resHandle.get('leave')(users[item], {
                        type: 'leave',
                        name: myName,
                        othername: item
                    })
                }

                //登出后，给其他用户推送我
                for(let item in users) {
                    if(item == myName) {
                        continue
                    }
                    sendTo(users[item], {
                        type: 'updata',
                        action: 'offline',
                        name: myName
                    })
                }
            }
            console.log('user [ ' + myName + ' ] exit')
        })

        connection.on('error', function(error) {
            console.log('The connection to error', error)
        })
    })

    wsserver.on('listening', function() {
        console.log('WebSocket server started...')
    })
}

function sendTo(conn, message) {
    let messageJson = JSON.stringify(message)

    console.log('send to', messageJson)
    try{
        if(conn.readyState == conn.OPEN) {
            conn.send(messageJson)
        } else {
            console.log('send fail, connection state is:', conn.readyState)
        }
    } catch(error) {
        console.log('send have an error:', error)
    }
}

resHandle.set('login', function(conn, data) {
    let name = data.name
    if(users[name] != null) {
        sendTo(conn, {
            type: 'login',
            success: false
        })
    } else {
        users[name] = conn
        conn.name = name
        sendTo(conn, {
            type: 'login',
            success: true,
        })

        let allUser = Object.keys(users)
        sendTo(conn, {
            type: 'userlist',
            users: allUser
        })

        //登录成功后，给其他用户推送我
        for(let item in users) {
            if(item == name) {
                continue
            }
            sendTo(users[item], {
                type: 'updata',
                action: 'login',
                name: name
            })
        }
    }
})

resHandle.set('offer', function(conn, data) {
    let name = data.name
    let other = data.othername
    let otherconn = users[other]

    if(otherconn != null) {
        sendTo(otherconn, {
            type: 'offer',
            name: name,
            offer: data.offer
        })
    } else {
        sendTo(conn, {
            type: 'error',
            message: 'offer send fail, otherconn is null'
        })
    }
})

resHandle.set('answer', function(conn, data) {
    let name = data.name
    let other = data.othername
    console.log(other)
    let otherconn = users[other]

    if(otherconn != null) {
        sendTo(otherconn, {
            type: 'answer',
            name: name,
            answer: data.answer
        })
    } else {
        sendTo(conn, {
            type: 'error',
            message: 'answer send fail, otherconn is null'
        })
    }
})

resHandle.set('candidate', function(conn, data) {
    let name = data.name
    let other = data.othername
    let otherconn = users[other]

    if(otherconn != null) {
        otherconn.otherUsers.add(conn.name)
        sendTo(otherconn, {
            type: 'candidate',
            name: name,
            candidate: data.candidate
        })
    } else {
        sendTo(conn, {
            type: 'error',
            message: 'candidate send fail, otherconn is null'
        })
    }
})

resHandle.set('leave', function(conn, data) {
    let name = data.name
    let other = data.othername
    let otherconn = users[other]

    if(otherconn != null) {
        otherconn.otherUsers.delete(name)
        sendTo(otherconn, {
            type: 'leave',
            name: name
        })
    } else {
        sendTo(conn, {
            type: 'error',
            message: 'leave send fail, otherconn is null'
        })
    }
})

module.exports = {
    listen: WebSocketServer
}