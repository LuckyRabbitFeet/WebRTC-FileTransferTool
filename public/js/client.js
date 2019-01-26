let ws = new WebSocketClient('ws://192.168.131.163:81')
let handlerMap = new Map()  //服务端消息处理队列

let titleName = document.querySelector('#title-name')
let loginPage = document.querySelector('#login-page')
let userNameInput = document.querySelector('#username')
let loginButton = document.querySelector('#login')
let panelPage = document.querySelector('#panel')
let userListPage = document.querySelector('#user-list')
let userTable = document.querySelector('#user-table')

let myName = null
let webrtcUsers = {}  //所有已经连接webrtc的用户
let webrtcName = []   //所有已经连接webrtc的用户名

//////////////////////////////////////////////////////////////////

handlerMap.set('login', function(data) {
    if(data.success != true) {
        alert('登录失败，该用户已经存在')
    } else {
        viewLogin()
    }
})

handlerMap.set('userlist', function(data) {
    setUserList(data.users)
})

handlerMap.set('updata', function(data) {
    if(data.action == 'login') {
        addUserToList(data.name)
    } else if(data.action == 'offline') {
        delUserToList(data.name)
    } else {
        console.log('type updata property offline error')
    }
})

handlerMap.set('offer', function(data) {
    btnColor(data.name, false)
    createPanelView(data.name)
    hangUpBtn(data.name)

    createWebRTC(myName, data.name)
    sendAnswer(data.name, data.offer)
})

handlerMap.set('answer', function(data) {
    recvAnswer(data.name, data.answer)
})

handlerMap.set('candidate', function(data) {
    setCandidate(data.name, data.candidate)
})

handlerMap.set('leave', function(data) {
    onLeave(data.name)
    delete webrtcUsers[data.name]

    btnColor(data.name, true)
    let userPanel = document.getElementById(`${data.name}-panel`)
    panelPage.removeChild(userPanel)
})

///////////////////////////////////////////////////////////////////

function viewLogin() {
    let name = userNameInput.value
    titleName.innerHTML = 'Hello [ ' + name + ' ], welcome to File GO~'
    loginPage.style.display = 'none'
    panelPage.style.display = 'block'
    userListPage.style.display = 'block'
}

function setUserList(users) {
    let name = userNameInput.value
    for(let item of users) {
        if(item == name) {
            continue
        }
        addUserToList(item)
    }
}

function addUserToList(username) {
    let tr = document.createElement('tr')
    let td1 = document.createElement('td')
    let td2 = document.createElement('td')

    tr.id = username
    td1.innerHTML = username
    td2.innerHTML = `<button id="${username}-btn" class="btn" style="width:100%">Call</button>`
    tr.appendChild(td1)
    tr.appendChild(td2)
    userTable.appendChild(tr)

    let tableBtn = document.getElementById(`${username}-btn`)
    callBtn(tableBtn, username)
}

function delUserToList(username) {
    let child = document.getElementById(username);  

    userTable.removeChild(child)
}

//call按钮响应事件
function callBtn(obj, username) {
    obj.addEventListener('click', function() {
        btnColor(username, false)
        createPanelView(username)
        hangUpBtn(username)

        createWebRTC(myName, username)
        sendOffer(username)
    })
}

function createWebRTC(myName, aimUserName) {
    let webrtc = new WebRTCClient()
    webrtcUsers[aimUserName] = webrtc
    webrtc.sendHandle = function(obj) {
        ws.sendTo(obj)
    }
    webrtc.onCreateConnection(myName, aimUserName)
    webrtc.setCandidateHandle()
    webrtc.onOpenDataChannel()
    webrtcUsers[aimUserName].recvHandle = function(data) {
        showRecv(aimUserName, data)
    }

    sendMessage(aimUserName)
    sendFile(aimUserName)
}

function sendOffer(username) {
    webrtcUsers[username].sendOffer()
}

function sendAnswer(username, offer) {
    webrtcUsers[username].sendAnswer(offer)
}

function recvAnswer(username, answer) {
    webrtcUsers[username].recvAnswer(answer)
}

function setCandidate(username, candidate) {
    webrtcUsers[username].recvCandidate(candidate)
}

function onLeave(username) {
    webrtcUsers[username].closeConnection()
}

//创建聊天面板
function createPanelView(username) {
    let div = createElement(panelPage, 'div', {
        id: `${username}-panel`,
        className: 'page panel-page'
    })
    createElement(div, 'span', {
        style: 'margin-right:10px'
    }, `To: ${username}`)
    createElement(div, 'input', {
        type: 'text',
        id: `${username}-message`,
        className: 'edit'
    })
    createElement(div, 'button', {
        id: `${username}-send`,
        className: `btn`,
        style: 'margin-left:10px'
    }, 'Send')
    createElement(div, 'button', {
        id: `${username}-sendfile`,
        className: `btn`,
        style: 'margin-left:10px'
    }, 'Send File')
    createElement(div, 'input', {
        type: 'file',
        id: `${username}-file`,
        className: `btn`,
        style: 'margin-left:10px'
    })
    createElement(div, 'div', {
        id: `${username}-received`,
        className: 'received'
    })
    createElement(div, 'button', {
        id: `${username}-hang-up`,
        className: 'btn'
    }, 'Hang Up')
}

//列表按钮颜色
function btnColor(username, bool) {
    console.log(`${username}-btn`)
    let tableBtn = document.getElementById(`${username}-btn`)
    if(bool == false) {
        tableBtn.disabled = true
        tableBtn.className = 'btn-disabled'
    } else {
        tableBtn.disabled = false
        tableBtn.className = 'btn'
    }
}

//发送消息按钮响应事件
function sendMessage(username) {
    let snedBtn = document.getElementById(`${username}-send`)
    snedBtn.addEventListener('click', function() {
        showText(username)
    })
}

//发送文件按钮响应事件
function sendFile(username) {
    let snedBtn = document.getElementById(`${username}-sendfile`)
    snedBtn.addEventListener('click', function() {
        showFile(username)
    })
}

//挂断按钮响应事件
function hangUpBtn(username) {
    let hangUp = document.getElementById(`${username}-hang-up`)
    hangUp.addEventListener('click', function() {
        btnColor(username, true)
        let userPanel = document.getElementById(`${username}-panel`)
        panelPage.removeChild(userPanel)

        sendLeave(username)
    })
}

//发送挂断消息
function sendLeave(username) {
    webrtcUsers[username].userLeave()
    webrtcUsers[username].closeConnection()
    delete webrtcUsers[username]
}

//把发送的文件显示到面板
function showFile(username) {
    let messageInput = document.getElementById(`${username}-file`)
    let received = document.getElementById(`${username}-received`)
    let val = messageInput.value

    console.log(messageInput.files[0].size)
    if(messageInput.files[0].size > 0) {
        let file = new fileReader()
        webrtcUsers[username].sendMesssge({
            type: 'file',
            filename: messageInput.files[0].name,
            size: messageInput.files[0].size
        })
        file.createFile(messageInput.files[0])
        file.setOnLoad(webrtcUsers[username].sendMesssge)
        file.readNextChunk()

        received.innerHTML += 'sendfile: ' + val + '<br>'
        received.scrollTop = received.scrollHeight

        let timer = setInterval(() => {
            received.innerHTML += 'sendfile: 文件发送中' + parseInt(file.sendBytes/messageInput.files[0].size * 100) + '%<br>'
            received.scrollTop = received.scrollHeight
            if(file.sendBytes === messageInput.files[0].size) {
                received.innerHTML += 'sendfile: 文件发送完成<br>'
                received.scrollTop = received.scrollHeight
    
                clearInterval(timer)
            }
        }, 3000);
    } else {
        received.innerHTML += 'sendfile: fail<br>'
        received.scrollTop = received.scrollHeight
    }
}

//提示文本发送
function showText(username) {
    let messageInput = document.getElementById(`${username}-message`)
    let received = document.getElementById(`${username}-received`)
    let val = messageInput.value

    webrtcUsers[username].sendMesssge({
        type: 'text',
        message: val
    })
    received.innerHTML += 'send: ' + val + '<br>'
    received.scrollTop = received.scrollHeight
}

let userFile = {} //从用户那里拿到的包的数组
//把接收的消息显示到面板
function showRecv(username, data) {
    let received = document.getElementById(`${username}-received`)
    let messageData = {}
    if(userFile[username] == null) {
        messageData = JSON.parse(data)
    }

    if(messageData.type == 'text') {
        received.innerHTML += 'recv: ' + messageData.message + '<br>'
        received.scrollTop = received.scrollHeight
    } else if (messageData.type == 'file') {
        console.log(messageData)
        userFile[username] = {}
        userFile[username].data = []
        userFile[username].filename = messageData.filename
        userFile[username].size = messageData.size
        userFile[username].bytesRecv = 0

        received.innerHTML += 'recv: 开始接收文件<br>'
        received.scrollTop = received.scrollHeight

        let starttimer = new Date()
        let timer = setInterval(() => {
            received.innerHTML += 'recv: 文件接收中' + parseInt(userFile[username].bytesRecv/userFile[username].size * 100) + '%<br>'
            received.scrollTop = received.scrollHeight
        
            if(userFile[username].bytesRecv === userFile[username].size) {
                let end = new Date()
                let used = end - starttimer;
                endDownload(username)
                delete userFile[username]
                received.innerHTML += 'recv: 文件接收完成, 耗时' + used+ 'ms<br>'
                received.scrollTop = received.scrollHeight
                clearInterval(timer)
            }
        }, 3000);
    } else if(userFile[username] != null) {
        console.log(data)
        if(BrowserType() == true) {
            userFile[username].bytesRecv += data.size
        } else {
            userFile[username].bytesRecv += data.byteLength
        }
        userFile[username].data.push(data)
    }
}

function endDownload(username) {
    let blob = new window.Blob(userFile[username].data)

    var link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = userFile[username].filename
    link.dispatchEvent(new MouseEvent(`click`, {bubbles: true, cancelable: true, view: window}))
    // /link.click()
}

function BrowserType() 
 { 
   var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串 
   var isFF = userAgent.indexOf("Firefox") > -1; //判断是否Firefox浏览器
      
    if (isFF) { return true} 
    else { return false }
  }

//////////////////////////////////////////////////////////////////
panelPage.style.display = 'none'
userListPage.style.display = 'none'

ws.run()
ws.recvHandle = function(data) {
    handlerMap.get(data.type)(data)
}

loginButton.addEventListener('click', function() {
    myName = userNameInput.value
    if(myName.length < 1 ||
        myName.length > 5) {
        alert('请限制用户名长度（1~5）')
    } else {
        ws.sendTo({
            type: 'login',
            name: myName
        })
    }
})