# 服务器信息交换
## 登录
用户登录后，获取所有在线用户列表
```javascript
//client 客户端发送
{
    type: 'login'      //消息类型（字符串）
    name: 'username'   //登录用户名（字符串）
}

//server 服务端发送
{
    type: 'login'       //消息类型（字符串）
    success: boolen     //状态（布尔值）
}
```

## 交换WebRTC信息
### offer 发起请求
客户端A：
```javascript
//client 客户端发送
{
    type: 'offer'            //消息类型（字符串）
    name: 'username'         //发起方用户名（字符串）
    othername: 'otherName'   //接收方用户名（字符串）
    offer: offer             //发起方offer信息（对象）
}

//server 服务端发送
{
    type: 'offer'       //消息类型（字符串）
    name: 'username'    //发起方用户名（字符串）
    offer: offer        //发起方offer信息（对象）
}
```

### answer 应答请求
客户端B：
```javascript
//client 客户端发送
{
    type: 'answer'           //消息类型（字符串）
    name: 'username'         //发起方用户名（字符串）
    othername: 'otherName'   //接收方用户名（字符串）
    answer: answer           //发起方answer信息（对象）
}

//server 服务端发送
{
    type: 'answer'      //消息类型（字符串）
    name: 'username'    //发起方用户名（字符串）
    answer: answer      //发起方answer信息（对象）
}
```

### ICE候选路径
ice处理事件响应后，AB同时触发
```javascript
//client 客户端发送
{
    type: 'candidate'        //消息类型（字符串）
    name: 'username'         //发起方用户名（字符串）
    othername: 'otherName'   //接收方用户名（字符串）
    candidate: candidate     //发起方candidate信息（对象）
}

//server 服务端发送
{
    type: 'candidate'        //消息类型（字符串）
    name: 'username'         //发起方用户名（字符串）
    candidate: candidate     //发起方candidate信息（对象）    
}
```

### leave 结束连接请求
连接关闭，等待新的连接
```javascript
//client 客户端发送
{
    type: 'leave'              //消息类型（字符串）
    name: 'username'           //发起方用户名（字符串）
    othername: 'otherName'     //接收方用户名（字符串）
}

//server 服务端发送
{
    type: 'leave'        //消息类型（字符串）
    name: 'username'     //发起方用户名（字符串）
}
```

## 推送用户列表
服务端推送所有在线用户
```javascript
//server 服务端发送
{
    type: 'userlist'       //消息类型（字符串）
    users: array           //加入/离线用户名（数组）
}
```

服务端推送新登录/登出的用户
```javascript
{
    type: 'updata'      //消息类型（字符串）
    action: 'login'     //用户动作（字符串）
    name: 'username'    //新登录用户名（字符串）
}

action：'login'/'offline'
```

## 其他
### 异常
服务端发送异常格式
```javascript
{
    type: 'error'           //消息类型（字符串）
    message: information    //具体异常信息（字符串）
}
```

# 客户端
客户端维护一个所有在线用户的列表
通过列表生成连接通道