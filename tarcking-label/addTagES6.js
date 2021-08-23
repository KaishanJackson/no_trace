//获取dom元素
let $ = (dom) => {
    return document.querySelector(dom)
}
//获取xPath
let getDomXPath = (element) => {
    if (element.id !== "") return 'id("' + element.id + '")';
    if (element === document.body) return element.tagName;

    var ix = 0;
    var siblings = element.parentNode.childNodes;
    for (var i = 0; i < siblings.length; i++) {
        var sibling = siblings[i];
        if (sibling === element) return getDomXPath(element.parentNode) + "/" + element.tagName + "[" + (ix + 1) + "]";
        if (sibling.nodeType === 1 && sibling.tagName === element.tagName) ix++;
    }
}



//拖拽面板
let Drag = (element, isDown) => {
    var dv = element;
    var x = 0;
    var y = 0;
    var l = 0;
    var t = 0;
    isDown = false;
    function isBack(e){
        return e==='INPUT'||e==='BUTTON'
    }
    dv.onmousedown = function (e) {
        if(isBack(e.target.tagName)) return false
        x = e.clientX;
        y = e.clientY;
        l = dv.offsetLeft;
        t = dv.offsetTop;
        isDown = true;
        dv.style.cursor = "move"
    };
    window.onmousemove = function (e) {
        if(isBack(e.target.tagName)) return false
        if (isDown == false) return false
        var nx = e.clientX;
        var ny = e.clientY;
        var nl = nx - (x - l);
        var nt = ny - (y - t);
        dv.style.left = nl + "px";
        dv.style.top = nt + "px"
    };
    dv.onmouseup = function (e) {
        if(isBack(e.target.tagName)) return false
        isDown = false;
        dv.style.cursor = "default"
    };
}

//xhr请求
let xhrPromise = ({ url, method = "GET", params = {}, data = {} }) => {
    return new Promise((resolve, reject) => {
        method = method.toUpperCase()
        let queryString = "";
        Object.keys(params).forEach(key => {
            queryString += `${key}=${params[key]}&`;
        });
        if (queryString) {
            queryString = queryString.substring(0, queryString.length - 1);
            url += "?" + queryString;
        }
        const request = new XMLHttpRequest();
        request.open(method, url, true);
        if (method === "GET") {
            request.send();
        } else if (method === "POST") {
            request.setRequestHeader(
                "Content-Type",
                "application/json;charset=utf-8"
            );
            request.send(JSON.stringify(data));
        }
        request.onreadystatechange = function () {
            if (request.readyState !== 4) {
                return;
            }
            const { status, statusText } = request;
            if (status >= 200 && status < 300) {
                const response = {
                    data: JSON.parse(request.response),
                    status,
                    statusText
                }
                resolve(response);
            } else {
                reject(new Error("request error status is " + status));
            }
        };
    });
}

let tagStyle = `
p{
    mrgin:0;
    padding:0
}
html,body{
    min-height:100%
}
.mask_box_normal{
    width:100%;
    height:100%;
    position:absolute;
    top:0;
    letft:0;
    z-index:2147483645;
    display:none
}
.tag_borad_box{
    width:460px;
    max-height:100vh;
    margin:5px;
    z-index:2147483646;
    box-shadow: 0px 0px 3px 3px #e5e5e5;
    position: absolute;right:0;
    top:0;
    padding:10px;
    background-color:#fff;
}
.vesion_remark_box{
    width:100%;
    border-top:1px solid #ccc
}
.input_box{
    display:flex;
    align-items:center;
    height:30px;
    margin-top:10px
}
.tag_input{
    width:200px;
    height:25px;
    border:1px solid #ccc;
    border-radius:3px
}
.tag_btn_box{
    width:100%;
    display:flex;
    justify-content:flex-end;
    padding:10px
}
.btn{
    margin-left:10px;
    padding:5px 10px;
    background-color:#40a9ff;
    color:#fff;
    border:none;
    border-radius: 4px;
    cursor: pointer;
}
.dom_list_box{
    width:100%;
    max-height:50vh;
    overflow:auto;
    border-top:1px solid #ddd
}
.tag_top_box{
    width:100%;
    padding:10px
}
.tag_move_dom_box{
    position:absolute;
    display:none;
    border:2px solid #B22222;
}
.tag_select_dom_box{
    position:absolute;
    display:none;
    border:2px solid #1E90FF;
}
.btn:hover{
    background:#4B0082
}
.btn:active{
    background:#B22222
}
.wait_put_box{
    width:100%;
    overflow:hidden;
    overflow-wrap:break-word;
    padding:5px
}
`
    //加签构造函数
    class CreateAddBoard {
        constructor() {
            //操作框
            this.selectElement = ''
            this._this = this
            this.rootDom = document.createElement('div')
            this.addHtmlTag()
            this.addStyleTag()
            this.addMask()
            this.controlData = {
                isDown: false,
                isSelect: false,
                putList: [],
                putMap: [],
                waitPutObj: {},
                vesion: '',
                remarks: ''
            }
            this.observer(this.controlData, 'isSelect', this.controlData.isSelect, this.isSelectChange.bind(this))
            //dom事件管理器
            this.elementMap = [
                { element: $('#add_tag_mask_box'), moveFunc: this.maskMoveEvent.bind(this), clickFunc: this.maskClickEvent.bind(this) },
                { element: $('#add_btn'), moveFunc: null, clickFunc: this.startBuryingPoint.bind(this) },
                { element: $('#cancel_btn'), moveFunc: null, clickFunc: this.cancelAll.bind(this) },
                { element: $('#submit_btn'), moveFunc: null, clickFunc: this.submit.bind(this) },
                { element: $('#vesion_input'), moveFunc: null, oninput: this.setvesion.bind(this) },
                { element: $('#remarks_input'), moveFunc: null, oninput: this.setRemarks.bind(this) }
            ]
            Drag(document.querySelector("#add_tag_borad_box"), this.controlData.isDown)
            this.addFunction(this.elementMap)
        }
        setvesion(e) {
            this.controlData.vesion = e.target.value
        }
        setRemarks(e) {
            this.controlData.remarks = e.target.value
        }
        //提交
        submit() {
            if(this.controlData.putMap.length<1) {
                alert('当前没有选择加签内容')
                return false
            }
            if (this.noSure('确认提交')) return
            let _this = this
            let param = []
            this.controlData.putMap.forEach(ele => {
                let obj = {}
                obj = ele
                obj.vesion = _this.controlData.vesion
                obj.remarks = _this.controlData.remarks
                param.push(obj)
            })
            xhrPromise({
                url: 'http://192.168.253.65:3000/save',
                method: 'post',
                data: {
                    jsonList: param
                }
            }).then(function (res) {
                if (res.data.code == 200) {
                    _this.controlData.putMap = []
                    _this.controlData.putList = []
                    _this.controlData.waitPutObj = {}
                    $('#vesion_input').value = ''
                    $('#remarks_input').value = ''
                    _this.controlData.vesion = ''
                    _this.controlData.remarks = ''
                    $("#dom_list_box").innerHTML = null
                    $('.tag_move_dom_box').style.display = 'none'
                    alert('提交成功')
                } else if(res.data.code == 400){
                    let messageStr = `
                    发现${res.data.message.length}条重复
                    重复xPath为：
                    `
                    res.data.message.forEach((ele,index)=>{
                        messageStr+=`
                        ${index+1}:${ele}
                        `
                    })
                    alert(messageStr);
                } else {
                    alert(res.data.message);
                }
            });
        }
        //取消
        cancelAll() {
            let message = this.controlData.putList.length<1?'是否停止加签':'确认取消此次加签'
            if (this.noSure(message)) return
            this.controlData.putMap = []
            this.controlData.putList = []
            this.controlData.waitPutObj = {}
            $('#vesion_input').value = ''
            $('#remarks_input').value = ''
            this.controlData.vesion = ''
            this.controlData.remarks = ''
            console.log(this.controlData.vesion)
            $("#dom_list_box").innerHTML = null
            $('.tag_move_dom_box').style.display = 'none'
            this.controlData.isSelect = false
        }
        //弹窗
        noSure(message) {
            if (confirm(message)) {
                return false
            } else {
                return true
            }
        }
        //创建加签信息选项
        createTagInfoContent(info) {
            let box = document.createElement('div')
            box.style.marginBottom = '5px'
            let text = document.createElement('div')
            text.innerHTML = JSON.stringify(info)
            text.className = 'wait_put_box'
            let cancelBtn = document.createElement('button')
            cancelBtn.className = 'btn'
            cancelBtn.innerHTML = '删除'
            cancelBtn.onclick = () => {
                if (this.noSure('确认删除此条')) return
                let listIndex = this.controlData.putList.indexOf(info)
                var putIndex;
                this.controlData.putMap.forEach((ele, index) => {
                    if (ele.xPath == info.xPath && ele.url == info.url) {
                        putIndex = index
                    }
                })
                this.controlData.putMap.splice(putIndex, 1)
                this.controlData.putList.splice(listIndex, 1)
                box.parentNode.removeChild(box)
            }
            let okBtn = document.createElement('button')
            okBtn.className = 'btn'
            okBtn.innerHTML = '选中'
            okBtn.onclick = () => {
                if (okBtn.innerHTML == '选中') {
                    okBtn.innerHTML = '撤销选中'
                    inp.disabled = "disabled"
                    this.controlData.putMap.push(info)
                    this.controlData.putMap = [...new Set(this.controlData.putMap)]
                    text.style.color = 'red'
                } else {
                    okBtn.innerHTML = '选中'
                    inp.disabled = false
                    var putIndex;
                    this.controlData.putMap.forEach((ele, index) => {
                        if (ele.xPath == info.xPath && ele.url == info.url) {
                            putIndex = index
                        }
                    })
                    this.controlData.putMap.splice(putIndex, 1)
                    text.style.color = 'black'
                }
            }
            //input输入框
            let inp = document.createElement('input')
            inp.className = 'tag_input'
            inp.oninput = (e) => {
                let index = this.controlData.putList.indexOf(info)
                this.controlData.putList[index].label = e.target.value
                text.innerHTML = JSON.stringify(this.controlData.putList[index])
            }
            box.appendChild(text)
            box.appendChild(inp)
            box.appendChild(cancelBtn)
            box.appendChild(okBtn)
            return box
        }
        //添加信息到上传队列
        addWaitPutObjToPutList(obj) {
            if (JSON.stringify(obj) == JSON.stringify({})) return false
            if (this.controlData.putList.indexOf(obj) > -1) {
                alert('重复添加')
                return false
            }
            this.controlData.putList.push(obj)
            this.controlData.putList = [...new Set(this.controlData.putList)]
            this.controlData.waitPutObj = {}
            $("#dom_list_box").appendChild(this.createTagInfoContent(obj))
        }
        //监听部分数据
        observer(obj, key, val, callback) {
            Object.defineProperty(obj, key, {
                enumerable: true,
                configurable: true,
                get() {
                    return val
                },
                set(newVal) {
                    callback(newVal)
                }
            })
        }
        isSelectChange(newVal) {
            if (newVal) {
                $('#add_tag_mask_box').style.display = 'block'
                $('#add_btn').style.display = 'none'
            } else {
                $('#add_tag_mask_box').style.display = 'none'
                $('#add_btn').style.display = 'block'
            }
        }
        //添加遮罩层
        addMask() {
            let mask = document.createElement('div')
            mask.className = 'mask_box_normal'
            mask.id = 'add_tag_mask_box'
            document.body.appendChild(mask)
            //红色框
            let moveDom = document.createElement('div')
            moveDom.className = 'tag_move_dom_box'
            moveDom.id = 'tag_move_dom_box'
            document.body.appendChild(moveDom)
            //蓝色框
            let selectDom = document.createElement('div');
            selectDom.className = 'tag_select_dom_box'
            selectDom.id = 'tag_select_dom_box'
            document.body.appendChild(selectDom)
        }
        addHtmlTag() {
            let htmlTagStr = `
            <div id = 'add_tag_borad_box' class = 'tag_borad_box'>
                <div class='tag_top_box'>
                    <button id='add_btn' class='btn'>添加埋点</button>
                    <div id='wait_put_box' class='wait_put_box'>
                        
                    </div> 
                </div>    
                <div id='dom_list_box' class='dom_list_box'>
                
                </div> 
                <div class = 'vesion_remark_box'>
                    <div class = 'input_box'>
                        <p class = 'input_lable'>版本：</p>
                        <input id = 'vesion_input' type='text' class='tag_input'></input>  
                    </div> 
                    <div class = 'input_box'>
                        <p class = 'input_lable'>备注：</p>
                        <input id = 'remarks_input'  type='text' class='tag_input'></input>  
                    </div> 
                </div>
                <div class='tag_btn_box'>
                    <button id='cancel_btn' class='btn'>取消</button>
                    <button id='submit_btn' class='btn'>提交</button>
                </div>
            </div>
            `
            this.rootDom.innerHTML = htmlTagStr
            document.body.appendChild(this.rootDom)
        }
        addStyleTag() {
            let style = document.createElement("style")
            style.type = "text/css";
            style.rel = "stylesheet";
            style.appendChild(document.createTextNode(tagStyle))
            let head = document.getElementsByTagName('head')[0]
            head.appendChild(style)
        }
        //遮罩层鼠标移动事件
        maskMoveEvent(e) {
            e.target.style.display = 'none'
            $('.tag_move_dom_box').style.display = 'none'
            var element = document.elementFromPoint(e.clientX, e.clientY);
            e.target.style.display = 'block'
            this.showMovetBox(element)
            this.selectElement = element
        }
        //遮罩层点击找到dom
        maskClickEvent(e) {
            e.target.style.display = 'none'
            var element = document.elementFromPoint(e.clientX, e.clientY);
            e.target.style.display = 'block'
            this.addWaitPutObjToPutList(this.getWaitPutObj(this.selectElement))
            this.controlData.isSelect = false
            $('.tag_move_dom_box').style.display = 'none'
        }
        //给对应dom添加事件
        addFunction(elementList) {
            elementList.forEach(elementObj => {
                elementObj.element.onclick = elementObj.clickFunc ? elementObj.clickFunc : null
                elementObj.element.onmousemove = elementObj.moveFunc ? elementObj.moveFunc : null
                elementObj.element.oninput = elementObj.oninput ? elementObj.oninput : null
            })
        }
        //开始添加埋点
        startBuryingPoint() {
            this.controlData.isSelect = true
        }
        //显示红色选择框
        showMovetBox(element) {
            var rect = element.getBoundingClientRect();
            $('.tag_move_dom_box').style.display = 'block'
            $('.tag_move_dom_box').style.width = rect.width + 'px';
            $('.tag_move_dom_box').style.height = rect.height + 'px';
            $('.tag_move_dom_box').style.left = rect.left + 'px';
            $('.tag_move_dom_box').style.top = rect.top + 'px';
        }
        //get节点信息
        getWaitPutObj(element) {
            return {
                xPath: getDomXPath(element),
                tagName: element.nodeName,
                url: window.location.href
            }
        }
    }
    
    export default CreateAddBoard