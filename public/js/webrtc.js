function WebRTCClient() {
    let _connection
    let _localUser
    let _remoteUser
    let _dataChannel

    this.sendHandle = null
    this.recvHandle = null

    this.onCreateConnection = function(localName, remoteName) {
        _localUser = localName
        _remoteUser = remoteName
        if(hasRTCPeerConnection()) {
            _connection = new RTCPeerConnection({
                optional: [{RtpDataChannels: true}]
            })
            return true
        } else {
            return false
        }
    }

    this.setCandidateHandle = function() {
        //设置ice处理事件
        _connection.onicecandidate = event => {
            if(event.candidate) {
                this.sendHandle({
                    type: 'candidate',
                    name: _localUser,
                    othername: _remoteUser,
                    candidate: event.candidate
                })
            }
        }
    }

    this.onOpenDataChannel = function() {
        _dataChannel = _connection.createDataChannel('passage', {
            reliable: false
        })

        _connection.ondatachannel = event => {
            let receiveChannel = event.channel

            receiveChannel.onmessage = event => {
                console.log('Got Data Channel Message:', event.data)
                this.recvHandle(event.data)
            }
            receiveChannel.onopen = () => {
                console.log(name + ' has connected')
            }
            receiveChannel.onclose = () => {
                console.log('The Data Channel is Closed')
            }
        }
    }

    this.sendOffer = function() {
        _connection.createOffer().then(offer => {
            _connection.setLocalDescription(offer)
            this.sendHandle({
                type: 'offer',
                name: _localUser,
                othername: _remoteUser,
                offer: offer
            })
        })
    }

    this.sendAnswer = function(offer) {
        _connection.setRemoteDescription(new RTCSessionDescription(offer)).then(() => {
            _connection.createAnswer().then(answer => {
                //answer.sdp = answer.sdp.replace('b=AS:30', 'b=AS:1638400')
                _connection.setLocalDescription(answer)
                this.sendHandle({
                    type: 'answer',
                    name: _localUser,
                    othername: _remoteUser,
                    answer: answer
                })
            })
        })
    }

    this.recvAnswer = function(answer) {
        _connection.setRemoteDescription(new RTCSessionDescription(answer))
    }

    this.recvCandidate = function(candidate) {
        _connection.addIceCandidate(new RTCIceCandidate(candidate))
    }

    this.userLeave = function() {
        this.sendHandle({
            type: 'leave',
            name: _localUser,
            othername: _remoteUser,
        })
    }

    this.closeConnection = function() {
        _connection.close()
        _connection.onicecandidate = null
    }

    this.sendMesssge = function(message) {
        if(message.type != null){
            let messageJson = JSON.stringify(message)
            _dataChannel.send(messageJson)
        } else {
            _dataChannel.send(message)
        }
    }

    function hasRTCPeerConnection() {
        window.RTCPeerConnection = window.RTCPeerConnection ||
        window.webkitRTCPeerConnection || window.mozRTCPeerConnection
        
        window.RTCSessionDescription = window.RTCSessionDescription ||
        window.webkitRTCSessionDescription || window.mozRTCSessionDescription
    
        window.RTCIceCandidate = window.RTCIceCandidate ||
        window.webkirRTCIceCandidate || window.mozRTCIceCandidate
    
        return !!window.RTCPeerConnection
    }
}