'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

//获取dom元素
var $ = function $(dom) {
    return document.querySelector(dom);
};
//获取xPath
var getDomXPath = function getDomXPath(element) {
    if (element.id !== "") return 'id("' + element.id + '")';
    if (element === document.body) return element.tagName;

    var ix = 0;
    var siblings = element.parentNode.childNodes;
    for (var i = 0; i < siblings.length; i++) {
        var sibling = siblings[i];
        if (sibling === element) return getDomXPath(element.parentNode) + "/" + element.tagName + "[" + (ix + 1) + "]";
        if (sibling.nodeType === 1 && sibling.tagName === element.tagName) ix++;
    }
};

//拖拽面板
var Drag = function Drag(element, isDown) {
    var dv = element;
    var x = 0;
    var y = 0;
    var l = 0;
    var t = 0;
    isDown = false;
    dv.onmousedown = function (e) {
        e.stopPropagation();
        x = e.clientX;
        y = e.clientY;
        l = dv.offsetLeft;
        t = dv.offsetTop;
        isDown = true;
        dv.style.cursor = "move";
    };
    window.onmousemove = function (e) {
        e.stopPropagation();
        if (isDown == false) return false;
        var nx = e.clientX;
        var ny = e.clientY;
        var nl = nx - (x - l);
        var nt = ny - (y - t);
        dv.style.left = nl + "px";
        dv.style.top = nt + "px";
    };
    dv.onmouseup = function (e) {
        e.stopPropagation();
        isDown = false;
        dv.style.cursor = "default";
    };
};

//xhr请求
var xhrPromise = function xhrPromise(_ref) {
    var url = _ref.url;
    var _ref$method = _ref.method;
    var method = _ref$method === undefined ? "GET" : _ref$method;
    var _ref$params = _ref.params;
    var params = _ref$params === undefined ? {} : _ref$params;
    var _ref$data = _ref.data;
    var data = _ref$data === undefined ? {} : _ref$data;

    return new Promise(function (resolve, reject) {
        method = method.toUpperCase();
        var queryString = "";
        Object.keys(params).forEach(function (key) {
            queryString += key + '=' + params[key] + '&';
        });
        if (queryString) {
            queryString = queryString.substring(0, queryString.length - 1);
            url += "?" + queryString;
        }
        var request = new XMLHttpRequest();
        request.open(method, url, true);
        if (method === "GET") {
            request.send();
        } else if (method === "POST") {
            request.setRequestHeader("Content-Type", "application/json;charset=utf-8");
            request.send(JSON.stringify(data));
        }
        request.onreadystatechange = function () {
            if (request.readyState !== 4) {
                return;
            }
            var status = request.status;
            var statusText = request.statusText;

            if (status >= 200 && status < 300) {
                var response = {
                    data: JSON.parse(request.response),
                    status: status,
                    statusText: statusText
                };
                resolve(response);
            } else {
                reject(new Error("request error status is " + status));
            }
        };
    });
};

var tagStyle = '\np{\n    mrgin:0;\n    padding:0\n}\nhtml,body{\n    min-height:100%\n}\n.mask_box_normal{\n    width:100%;\n    height:100%;\n    position:absolute;\n    top:0;\n    letft:0;\n    z-index:2147483645;\n    display:none\n}\n.tag_borad_box{\n    width:460px;\n    max-height:100vh;\n    margin:5px;\n    z-index:2147483646;\n    box-shadow: 0px 0px 3px 3px #e5e5e5;\n    position: absolute;right:0;\n    top:0;\n    padding:10px;\n    background-color:#fff;\n}\n.vesion_remark_box{\n    width:100%;\n    border-top:1px solid #ccc\n}\n.input_box{\n    display:flex;\n    align-items:center;\n    height:30px;\n    margin-top:10px\n}\n.tag_input{\n    width:200px;\n    height:25px;\n    border:1px solid #ccc;\n    border-radius:3px\n}\n.tag_btn_box{\n    width:100%;\n    display:flex;\n    justify-content:flex-end;\n    padding:10px\n}\n.btn{\n    margin-left:10px;\n    padding:5px 10px;\n    background-color:#40a9ff;\n    color:#fff;\n    border:none;\n    border-radius: 4px;\n    cursor: pointer;\n}\n.dom_list_box{\n    width:100%;\n    max-height:50vh;\n    overflow:auto;\n    border-top:1px solid #ddd\n}\n.tag_top_box{\n    width:100%;\n    padding:10px\n}\n.tag_move_dom_box{\n    position:absolute;\n    display:none;\n    border:2px solid #B22222;\n}\n.tag_select_dom_box{\n    position:absolute;\n    display:none;\n    border:2px solid #1E90FF;\n}\n.btn:hover{\n    background:#4B0082\n}\n.btn:active{\n    background:#B22222\n}\n.wait_put_box{\n    width:100%;\n    overflow:hidden;\n    overflow-wrap:break-word;\n    padding:5px\n}\n';
//加签构造函数

var CreateAddBoard = function () {
    function CreateAddBoard() {
        _classCallCheck(this, CreateAddBoard);

        //操作框
        this.selectElement = '';
        this._this = this;
        this.rootDom = document.createElement('div');
        this.addHtmlTag();
        this.addStyleTag();
        this.addMask();
        this.controlData = {
            isDown: false,
            isSelect: false,
            putList: [],
            putMap: [],
            waitPutObj: {},
            vesion: '',
            remarks: ''
        };
        this.observer(this.controlData, 'isSelect', this.controlData.isSelect, this.isSelectChange.bind(this));
        //dom事件管理器
        this.elementMap = [{ element: $('#add_tag_mask_box'), moveFunc: this.maskMoveEvent.bind(this), clickFunc: this.maskClickEvent.bind(this) }, { element: $('#add_btn'), moveFunc: null, clickFunc: this.startBuryingPoint.bind(this) }, { element: $('#cancel_btn'), moveFunc: null, clickFunc: this.cancelAll.bind(this) }, { element: $('#submit_btn'), moveFunc: null, clickFunc: this.submit.bind(this) }, { element: $('#vesion_input'), moveFunc: null, oninput: this.setvesion.bind(this) }, { element: $('#remarks_input'), moveFunc: null, oninput: this.setRemarks.bind(this) }];
        Drag(document.querySelector("#add_tag_borad_box"), this.controlData.isDown);
        this.addFunction(this.elementMap);
    }

    _createClass(CreateAddBoard, [{
        key: 'setvesion',
        value: function setvesion(e) {
            this.controlData.vesion = e.target.value;
        }
    }, {
        key: 'setRemarks',
        value: function setRemarks(e) {
            this.controlData.remarks = e.target.value;
        }
        //提交

    }, {
        key: 'submit',
        value: function submit() {
            if (this.controlData.putMap.length < 1) {
                alert('当前没有选择加签内容');
                return false;
            }
            if (this.noSure('确认提交')) return;
            var _this = this;
            var param = [];
            this.controlData.putMap.forEach(function (ele) {
                var obj = {};
                obj = ele;
                obj.vesion = _this.controlData.vesion;
                obj.remarks = _this.controlData.remarks;
                param.push(obj);
            });
            xhrPromise({
                url: 'http://192.168.253.65:3000/save',
                method: 'post',
                data: {
                    jsonList: param
                }
            }).then(function (res) {
                if (res.data.code == 200) {
                    _this.controlData.putMap = [];
                    _this.controlData.putList = [];
                    _this.controlData.waitPutObj = {};
                    $('#vesion_input').value = '';
                    $('#remarks_input').value = '';
                    _this.controlData.vesion = '';
                    _this.controlData.remarks = '';
                    $("#dom_list_box").innerHTML = null;
                    $('.tag_move_dom_box').style.display = 'none';
                    alert('提交成功');
                } else if (res.data.code == 400) {
                    var messageStr = '\n                    发现' + res.data.message.length + '条重复\n                    重复xPath为：\n                    ';
                    res.data.message.forEach(function (ele, index) {
                        messageStr += '\n                        ' + (index + 1) + ':' + ele + '\n                        ';
                    });
                    alert(messageStr);
                } else {
                    alert(res.data.message);
                }
            });
        }
        //取消

    }, {
        key: 'cancelAll',
        value: function cancelAll() {
            var message = this.controlData.putList.length < 1 ? '是否停止加签' : '确认取消此次加签';
            if (this.noSure(message)) return;
            this.controlData.putMap = [];
            this.controlData.putList = [];
            this.controlData.waitPutObj = {};
            $('#vesion_input').value = '';
            $('#remarks_input').value = '';
            this.controlData.vesion = '';
            this.controlData.remarks = '';
            console.log(this.controlData.vesion);
            $("#dom_list_box").innerHTML = null;
            $('.tag_move_dom_box').style.display = 'none';
            this.controlData.isSelect = false;
        }
        //弹窗

    }, {
        key: 'noSure',
        value: function noSure(message) {
            if (confirm(message)) {
                return false;
            } else {
                return true;
            }
        }
        //创建加签信息选项

    }, {
        key: 'createTagInfoContent',
        value: function createTagInfoContent(info) {
            var _this2 = this;

            var box = document.createElement('div');
            box.style.marginBottom = '5px';
            var text = document.createElement('div');
            text.innerHTML = JSON.stringify(info);
            text.className = 'wait_put_box';
            var cancelBtn = document.createElement('button');
            cancelBtn.className = 'btn';
            cancelBtn.innerHTML = '删除';
            cancelBtn.onclick = function () {
                if (_this2.noSure('确认删除此条')) return;
                var listIndex = _this2.controlData.putList.indexOf(info);
                var putIndex;
                _this2.controlData.putMap.forEach(function (ele, index) {
                    if (ele.xPath == info.xPath && ele.url == info.url) {
                        putIndex = index;
                    }
                });
                _this2.controlData.putMap.splice(putIndex, 1);
                _this2.controlData.putList.splice(listIndex, 1);
                box.parentNode.removeChild(box);
            };
            var okBtn = document.createElement('button');
            okBtn.className = 'btn';
            okBtn.innerHTML = '选中';
            okBtn.onclick = function () {
                if (okBtn.innerHTML == '选中') {
                    okBtn.innerHTML = '撤销选中';
                    inp.disabled = "disabled";
                    _this2.controlData.putMap.push(info);
                    _this2.controlData.putMap = [].concat(_toConsumableArray(new Set(_this2.controlData.putMap)));
                    text.style.color = 'red';
                } else {
                    okBtn.innerHTML = '选中';
                    inp.disabled = false;
                    var putIndex;
                    _this2.controlData.putMap.forEach(function (ele, index) {
                        if (ele.xPath == info.xPath && ele.url == info.url) {
                            putIndex = index;
                        }
                    });
                    _this2.controlData.putMap.splice(putIndex, 1);
                    text.style.color = 'black';
                }
            };
            //input输入框
            var inp = document.createElement('input');
            inp.className = 'tag_input';
            inp.oninput = function (e) {
                var index = _this2.controlData.putList.indexOf(info);
                _this2.controlData.putList[index].label = e.target.value;
                text.innerHTML = JSON.stringify(_this2.controlData.putList[index]);
            };
            box.appendChild(text);
            box.appendChild(inp);
            box.appendChild(cancelBtn);
            box.appendChild(okBtn);
            return box;
        }
        //添加信息到上传队列

    }, {
        key: 'addWaitPutObjToPutList',
        value: function addWaitPutObjToPutList(obj) {
            if (JSON.stringify(obj) == JSON.stringify({})) return false;
            if (this.controlData.putList.indexOf(obj) > -1) {
                alert('重复添加');
                return false;
            }
            this.controlData.putList.push(obj);
            this.controlData.putList = [].concat(_toConsumableArray(new Set(this.controlData.putList)));
            this.controlData.waitPutObj = {};
            $("#dom_list_box").appendChild(this.createTagInfoContent(obj));
        }
        //监听部分数据

    }, {
        key: 'observer',
        value: function observer(obj, key, val, callback) {
            Object.defineProperty(obj, key, {
                enumerable: true,
                configurable: true,
                get: function get() {
                    return val;
                },
                set: function set(newVal) {
                    callback(newVal);
                }
            });
        }
    }, {
        key: 'isSelectChange',
        value: function isSelectChange(newVal) {
            if (newVal) {
                $('#add_tag_mask_box').style.display = 'block';
                $('#add_btn').style.display = 'none';
            } else {
                $('#add_tag_mask_box').style.display = 'none';
                $('#add_btn').style.display = 'block';
            }
        }
        //添加遮罩层

    }, {
        key: 'addMask',
        value: function addMask() {
            var mask = document.createElement('div');
            mask.className = 'mask_box_normal';
            mask.id = 'add_tag_mask_box';
            document.body.appendChild(mask);
            //红色框
            var moveDom = document.createElement('div');
            moveDom.className = 'tag_move_dom_box';
            moveDom.id = 'tag_move_dom_box';
            document.body.appendChild(moveDom);
            //蓝色框
            var selectDom = document.createElement('div');
            selectDom.className = 'tag_select_dom_box';
            selectDom.id = 'tag_select_dom_box';
            document.body.appendChild(selectDom);
        }
    }, {
        key: 'addHtmlTag',
        value: function addHtmlTag() {
            var htmlTagStr = '\n            <div id = \'add_tag_borad_box\' class = \'tag_borad_box\'>\n                <div class=\'tag_top_box\'>\n                    <button id=\'add_btn\' class=\'btn\'>添加埋点</button>\n                    <div id=\'wait_put_box\' class=\'wait_put_box\'>\n                        \n                    </div> \n                </div>    \n                <div id=\'dom_list_box\' class=\'dom_list_box\'>\n                \n                </div> \n                <div class = \'vesion_remark_box\'>\n                    <div class = \'input_box\'>\n                        <p class = \'input_lable\'>版本：</p>\n                        <input id = \'vesion_input\' type=\'text\' class=\'tag_input\'></input>  \n                    </div> \n                    <div class = \'input_box\'>\n                        <p class = \'input_lable\'>备注：</p>\n                        <input id = \'remarks_input\'  type=\'text\' class=\'tag_input\'></input>  \n                    </div> \n                </div>\n                <div class=\'tag_btn_box\'>\n                    <button id=\'cancel_btn\' class=\'btn\'>取消</button>\n                    <button id=\'submit_btn\' class=\'btn\'>提交</button>\n                </div>\n            </div>\n            ';
            this.rootDom.innerHTML = htmlTagStr;
            document.body.appendChild(this.rootDom);
        }
    }, {
        key: 'addStyleTag',
        value: function addStyleTag() {
            var style = document.createElement("style");
            style.type = "text/css";
            style.rel = "stylesheet";
            style.appendChild(document.createTextNode(tagStyle));
            var head = document.getElementsByTagName('head')[0];
            head.appendChild(style);
        }
        //遮罩层鼠标移动事件

    }, {
        key: 'maskMoveEvent',
        value: function maskMoveEvent(e) {
            e.target.style.display = 'none';
            $('.tag_move_dom_box').style.display = 'none';
            var element = document.elementFromPoint(e.clientX, e.clientY);
            e.target.style.display = 'block';
            this.showMovetBox(element);
            this.selectElement = element;
        }
        //遮罩层点击找到dom

    }, {
        key: 'maskClickEvent',
        value: function maskClickEvent(e) {
            e.target.style.display = 'none';
            var element = document.elementFromPoint(e.clientX, e.clientY);
            e.target.style.display = 'block';
            this.addWaitPutObjToPutList(this.getWaitPutObj(this.selectElement));
            this.controlData.isSelect = false;
            $('.tag_move_dom_box').style.display = 'none';
        }
        //给对应dom添加事件

    }, {
        key: 'addFunction',
        value: function addFunction(elementList) {
            elementList.forEach(function (elementObj) {
                elementObj.element.onclick = elementObj.clickFunc ? elementObj.clickFunc : null;
                elementObj.element.onmousemove = elementObj.moveFunc ? elementObj.moveFunc : null;
                elementObj.element.oninput = elementObj.oninput ? elementObj.oninput : null;
            });
        }
        //开始添加埋点

    }, {
        key: 'startBuryingPoint',
        value: function startBuryingPoint() {
            this.controlData.isSelect = true;
        }
        //显示红色选择框

    }, {
        key: 'showMovetBox',
        value: function showMovetBox(element) {
            var rect = element.getBoundingClientRect();
            $('.tag_move_dom_box').style.display = 'block';
            $('.tag_move_dom_box').style.width = rect.width + 'px';
            $('.tag_move_dom_box').style.height = rect.height + 'px';
            $('.tag_move_dom_box').style.left = rect.left + 'px';
            $('.tag_move_dom_box').style.top = rect.top + 'px';
        }
        //get节点信息

    }, {
        key: 'getWaitPutObj',
        value: function getWaitPutObj(element) {
            return {
                xPath: getDomXPath(element),
                tagName: element.nodeName,
                url: window.location.href
            };
        }
    }]);

    return CreateAddBoard;
}();

exports.default = CreateAddBoard;