function fileReader() {
    const _BYTES_PER_CHUNK = 1200
    let _currentChunk = 0
    let _fileReader
    let _file

    this.sendBytes = 0
    this.createFile = function(file) {
        _file = file
        _fileReader =  new FileReader()
    }

    this.setOnLoad = function(send) {
        let that = this
        _fileReader.onload = function() {
            that.sendBytes += _fileReader.result.byteLength
            send(_fileReader.result)
            _currentChunk++
            if(_BYTES_PER_CHUNK * _currentChunk < _file.size) {
                that.readNextChunk()
            }
        }
    }

    this.readNextChunk = function() {
        let start = _BYTES_PER_CHUNK * _currentChunk
        let end = Math.min(_file.size, start + _BYTES_PER_CHUNK)
        _fileReader.readAsArrayBuffer(_file.slice(start, end))
    }

    function BrowserType() 
     { 
       var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串 
       var isFF = userAgent.indexOf("Firefox") > -1; //判断是否Firefox浏览器
          
        if (isFF) { return true} 
        else { return false }
      }
}