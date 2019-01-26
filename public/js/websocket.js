function WebSocketClient(url) {
    let ws
    this.url = url
    this.recvHandle = null
    this.run = function() {
        ws = new WebSocket(this.url)

        ws.onopen = () => {
            console.log('connection to open')
        }

        ws.onmessage = event => {
            console.log('The connection to message', event.data)
            if(this.recvHandle instanceof Function) {
                this.recvHandle(JSON.parse(event.data))
            } else {
                console.log('recvHandle is not function')
            }
        }

        ws.onerror = error => {
            console.log('websocket have an error:', error)
        }
    }

    this.sendTo = function(data) {
        let messageJson = JSON.stringify(data)
        if(ws != null) {
            console.log('send to', messageJson)
            if(ws.readyState == ws.OPEN) {
                ws.send(messageJson)
            } else {
                console.log('send fail, connection state is:', ws.readyState)
            }
        } else {
            console.log('WebSocket is not run')
        }
    }
}