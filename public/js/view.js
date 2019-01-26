//创建html元素，返回创建的元素对象
function createElement(parent, tag, option, innerHTML = null) {
    let element = document.createElement(tag)
    for(let key in option) {
        element[key] = option[key]
    }
    if(innerHTML != null) {
        element.innerHTML = innerHTML
    }
    parent.appendChild(element)

    return element
}