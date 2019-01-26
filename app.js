let express = require('express')
let ws = require('./websocket')

let app = express()
app.use(express.static('public'))
app.get('/', function(req, res) {
    console.log('Got index page path to: ' + __dirname + '/public/index.html')
    res.sendFile(__dirname + '/public/index.html')
})
app.get('/favicon.ico', function(req, res) {
    console.log('Got ico path to: ' + __dirname + '/public/resource/favicon.ico')
    res.send(__dirname + '/public/resource/favicon.ico')
})
app.listen(80, function() {
    console.log('server started...')
})
ws.listen({port:81})