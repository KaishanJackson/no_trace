var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

//埋点构造函数
type requestMap = {
    event?: string,
    nodeName?: string,
    text?: string,
    xPath?: string,
    url: string,
    time: number,
    equipment: string,
    userinfo: {},
    header?: any,
    baseUrl?: string,
    body?: any,
    arguments?:any,
    functionBody?:string
}
class BuryingPoint {
    browser: any
    eventUserinfo: {}
    eventFunctions: any[]
    surePushList: []
    pushList: []
    constructor() {
        this.browser = getBrowser(window);
        this.eventUserinfo = {};
        this.eventFunctions = [];
        this.surePushList = [];
        this.pushList = localStorage.getItem('buryingPointPushList') ? JSON.parse(localStorage.getItem('buryingPointPushList')) : [];
        this.getSurePushList();
        this.setEvent.apply(this, arguments);
        this.listenHttp();
        this.xhrBurying();
        this.subBurying('click');
        this.subBurying('input');
        this.subBurying('change');
        this.subBurying('blur');
    }
    //通过xpath锁定Dom的节点
    searchDom(xpath: string): any {
        var result = document.evaluate(xpath, document, null, XPathResult.ANY_TYPE, null);
        return result.iterateNext();
    };
    //监听dom节点的变化
    listenDomChange(changeDom: any): void {
        var _this = this;
        changeDom.addEventListener('DOMNodeInserted', function (e: any) {
            var eventMap: requestMap = {
                event: 'select',
                nodeName: changeDom.nodeName,
                text: e.target.data,
                xPath: _this.getDomXPath(changeDom),
                url: window.location.href,
                time: new Date().getTime(),
                equipment: _this.browser,
                userinfo: _this.eventUserinfo
            };
            xhrLib({
                url: 'http://192.168.253.65:3000/save/savesub',
                method: 'post',
                data: {
                    eventMap
                }
            }).then(function (res) {
                console.log(res);
            }).catch(function (err) {
                console.log(err);
            });
        });
    };
    //通过返回的加签数据，对应节点添加监听
    addDomListener(list: any[]): void {
        var _this = this;
        list.forEach(function (obj) {
            if (obj.LABEL == 'select') {
                var listenDom = _this.searchDom(obj.X_PATH);
                console.log(listenDom);
                _this.listenDomChange(listenDom);
            }
        });
    };
    //先获取加签数据，根据加签数据筛选埋点
    getSurePushList(): void {
        var _this2 = this;

        xhrLib({
            url: 'http://192.168.253.65:3000/save/search',
            method: 'get'
        }).then(function (res: any) {
            if (res.data.code == 200) {
                _this2.surePushList = res.data.data;
            }
        }).catch(function (err) {
            console.log(err);
        });
    };
    //处理参数
    setEvent() {
        this.setEveryEvent.apply(this, arguments);
    };
    //改写传入的函数，加入埋点方法
    setEventListener(e: any): any {
        var myFunc = e;
        var funStr = '' + JSON.stringify(myFunc.toString());
        var userInfo = JSON.stringify(this.eventUserinfo);
        var broser = JSON.stringify(this.browser.client);
        console.log(broser);
        var str: string = e.name + ('= function(){ \n      (' + myFunc + ')(...arguments)\n      var myName\ = [...arguments]\n        var funcArg = [...arguments]\n        var funcBody = ' + funStr + '\n        var funcName = \'' + e.name + '\'\n      var functionMap={\n      event:funcName,\n      time: new Date().getTime(),\n      url: window.location.href,\n      arguments:funcArg,\n      functionBody:funcBody,\n      equipment: ' + broser + ',\n      userinfo:' + userInfo + '\n    }\n\n    xhrLib({\n      url: \'http://192.168.253.65:3000/save/savesub\',\n      method: \'post\',\n      data: {\n        eventMap: functionMap\n      }\n    }).then(res => {\n      console.log(res)\n    })\n}');
        return new Function('return ' + str)();
    };
    //xhr监听
    listenHttp() {
        (function () {
            if (typeof window.CustomEvent === "function") return false;

            function CustomEvent(event: any, params: any) {
                params = params || { bubbles: false, cancelable: false, detail: undefined };
                var evt = document.createEvent('CustomEvent');
                evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
                return evt;
            }

            CustomEvent.prototype = window.Event.prototype;

            (window as any).CustomEvent = CustomEvent;
        })();
        //xhr请求改写
        (function () {
            function ajaxEventTrigger(event) {
                var ajaxEvent = new CustomEvent(event, { detail: this });
                window.dispatchEvent(ajaxEvent);
            }

            var oldXHR = window.XMLHttpRequest;

            function newXHR() {
                var realXHR = new oldXHR();

                realXHR.addEventListener('abort', function () {
                    ajaxEventTrigger.call(this, 'ajaxAbort');
                }, false);

                realXHR.addEventListener('error', function () {
                    ajaxEventTrigger.call(this, 'ajaxError');
                }, false);

                realXHR.addEventListener('load', function () {
                    ajaxEventTrigger.call(this, 'ajaxLoad');
                }, false);

                realXHR.addEventListener('loadstart', function () {
                    ajaxEventTrigger.call(this, 'ajaxLoadStart');
                }, false);

                realXHR.addEventListener('progress', function () {
                    ajaxEventTrigger.call(this, 'ajaxProgress');
                }, false);

                realXHR.addEventListener('timeout', function () {
                    ajaxEventTrigger.call(this, 'ajaxTimeout');
                }, false);

                realXHR.addEventListener('loadend', function () {
                    ajaxEventTrigger.call(this, 'ajaxLoadEnd');
                }, false);

                realXHR.addEventListener('readystatechange', function () {
                    ajaxEventTrigger.call(this, 'ajaxReadyStateChange');
                }, false);

                var send = realXHR.send;
                realXHR.send = function () {
                    for (var _len = arguments.length, arg = Array(_len), _key = 0; _key < _len; _key++) {
                        arg[_key] = arguments[_key];
                    }

                    send.apply(realXHR, arg);
                    (realXHR as any).body = arg[0];
                    ajaxEventTrigger.call(realXHR, 'ajaxSend');
                };

                var open = realXHR.open;
                realXHR.open = function () {
                    for (var _len2 = arguments.length, arg = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                        arg[_key2] = arguments[_key2];
                    }

                    open.apply(realXHR, arg);
                    (realXHR as any).method = arg[0];
                    (realXHR as any).orignUrl = arg[1];
                    (realXHR as any).async = arg[2];
                    ajaxEventTrigger.call(realXHR, 'ajaxOpen');
                };

                var setRequestHeader = realXHR.setRequestHeader;
                (realXHR as any).requestHeader = {};
                realXHR.setRequestHeader = function (name, value) {
                    (realXHR as any).requestHeader[name] = value;
                    setRequestHeader.call(realXHR, name, value);
                };
                return realXHR;
            }

            (window as any).XMLHttpRequest = newXHR;
        })();
    };
    //获取Xpath
    getDomXPath(element) {
        if (element.id !== "") return 'id("' + element.id + '")';
        if (element === document.body) return element.tagName;

        var ix = 0;
        var siblings = element.parentNode.childNodes;
        for (var i = 0; i < siblings.length; i++) {
            var sibling = siblings[i];
            if (sibling === element) return this.getDomXPath(element.parentNode) + "/" + element.tagName + "[" + (ix + 1) + "]";
            if (sibling.nodeType === 1 && sibling.tagName === element.tagName) ix++;
        }
    };
    //xhr请求埋点
    xhrBurying = function () {
        var _this = this;
        window.addEventListener("ajaxReadyStateChange", function (e: any) {
            var xhr = e.detail;
            if (xhr.readyState == 4 && xhr.status == 200) {
                var eventMap: requestMap = {
                    header: xhr.getAllResponseHeaders(),
                    baseUrl: xhr.responseURL,
                    body: xhr.body,
                    url: window.location.href,
                    time: new Date().getTime(),
                    equipment: _this.browser,
                    userinfo: _this.eventUserinfo
                };
                if (eventMap.baseUrl == 'http://192.168.253.65:3000/save/savesub') return;

                xhrLib({
                    url: 'http://192.168.253.65:3000/save/savesub',
                    method: 'post',
                    data: {
                        eventMap: eventMap
                    }
                }).then(function (res) {
                    console.log(res);
                });
            }
        });
    };
    //函数埋点接口
    subFunction(funcArg: any, funcBody: string, funcName: string) {
        var _this = this;
        var functionMap:requestMap = {
            event: funcName,
            time: new Date().getTime(),
            url: window.location.href,
            arguments: funcArg,
            functionBody: funcBody,
            equipment: _this.browser,
            userinfo: _this.eventUserinfo
        };
        xhrLib({
            url: 'http://192.168.253.65:3000/save/savesub',
            method: 'post',
            data: {
                eventMap: functionMap
            }
        }).then(function (res) {
            console.log(res);
        });
    };
    //事件埋点
    subBurying = function (event: any) {
        var _this = this;
        document.addEventListener(event, debounce(function (e) {
            _this.addDomListener(_this.surePushList);
            var eventMap = {
                nodeName: e.target.nodeName,
                text: event == 'click' ? e.target.innerText : e.target.value,
                xPath: _this.getDomXPath(e.target),
                url: window.location.href,
                event: event,
                time: new Date().getTime(),
                equipment: _this.browser,
                userinfo: _this.eventUserinfo
            };
            var surePush = _this.surePushList.some(function (e) {
                return e.X_PATH == eventMap.xPath && e.URL == eventMap.url;
            });
            if (surePush) {
                _this.pushList.push(eventMap);
                localStorage.setItem('buryingPointPushList', JSON.stringify(_this.pushList));
            }
            if (_this.pushList.length < 10) {
                return;
            } else {
                console.log(_this.pushList);
                xhrLib({
                    url: 'http://192.168.253.65:3000/save/savesub',
                    method: 'post',
                    data: {
                        eventMap: _this.pushList
                    }
                }).then(function (res) {
                    _this.pushList = [];
                    console.log(res);
                });
            }
        }, 1000));
    };
    //参数遍历
    setEveryEvent():void {
        var _this = this;
        var args = [...arguments]
        args.forEach(function (e) {
            if ((typeof e === 'undefined' ? 'undefined' : _typeof(e)) == 'object') {
                _this.eventUserinfo = JSON.stringify(e);
            } else if (Array.isArray(e)) {
                _this.eventFunctions = e;
            } else if (typeof e == 'function') {
                _this.eventFunctions.push(e);
            } else {
                throw '参数必须为object或者array或者function';
            }
        });
        _this.eventFunctions.forEach(function (fun) {
            _this.setEventListener(fun);
        });
    };
}
//封装请求
function xhrLib(_ref: any) {
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
}

//函数防抖
function debounce(fn, delay) {
    var timer = null;
    return function () {
        var context = this;
        var args = arguments;
        if (timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(function () {
            fn.apply(context, args);
        }, delay);
    };
}

function getBrowser(window:any):string|any {
    var document = window.document,
        navigator = window.navigator,
        agent = navigator.userAgent.toLowerCase(),


        //IE8+支持.返回浏览器渲染当前文档所用的模式
        //IE6,IE7:undefined.IE8:8(兼容模式返回7).IE9:9(兼容模式返回7||8)
        //IE10:10(兼容模式7||8||9)
        IEMode = document.documentMode,


        //chorme
        chrome = window.chrome || false,
        System = {
            //user-agent
            agent: agent,
            //是否为IE
            isIE: /msie/.test(agent),
            //Gecko内核
            isGecko: agent.indexOf("gecko") > 0 && agent.indexOf("like gecko") < 0,
            //webkit内核
            isWebkit: agent.indexOf("webkit") > 0,
            //是否为标准模式
            isStrict: document.compatMode === "CSS1Compat",
            //是否支持subtitle
            supportSubTitle: function supportSubTitle() {
                return "track" in document.createElement("track");
            },
            //是否支持scoped
            supportScope: function supportScope() {
                return "scoped" in document.createElement("style");
            },
            //获取IE的版本号
            ieVersion: function ieVersion() {
                try {
                    return agent.match(/msie ([\d.]+)/)[1] || 0;
                } catch (e) {
                    console.log("error");
                    return IEMode;
                }
            },
            //Opera版本号
            operaVersion: function operaVersion() {
                try {
                    if (window.opera) {
                        return agent.match(/opera.([\d.]+)/)[1];
                    } else if (agent.indexOf("opr") > 0) {
                        return agent.match(/opr\/([\d.]+)/)[1];
                    }
                } catch (e) {
                    console.log("error");
                    return 0;
                }
            },
            //描述:version过滤.如31.0.252.152 只保留31.0
            versionFilter: function versionFilter() {
                if (arguments.length === 1 && typeof arguments[0] === "string") {
                    var version = arguments[0];
                    let start:number = version.indexOf(".");
                    if (start > 0) {
                        let end:number = version.indexOf(".", start + 1);
                        if (end !== -1) {
                            return version.substr(0, end);
                        }
                    }
                    return version;
                } else if (arguments.length === 1) {
                    return arguments[0];
                }
                return 0;
            }
        };

    try {
        //浏览器类型(IE、Opera、Chrome、Safari、Firefox)
        (System as any).type = System.isIE ? "IE" : window.opera || agent.indexOf("opr") > 0 ? "Opera" : agent.indexOf("chrome") > 0 ? "Chrome" :
            //safari也提供了专门的判定方式
            window.openDatabase ? "Safari" : agent.indexOf("firefox") > 0 ? "Firefox" : 'unknow';

        //版本号
        (System as any).version = (System as any).type === "IE" ? System.ieVersion() : (System as any).type === "Firefox" ? agent.match(/firefox\/([\d.]+)/)[1] : (System as any).type === "Chrome" ? agent.match(/chrome\/([\d.]+)/)[1] : (System as any).type === "Opera" ? System.operaVersion() : (System as any).type === "Safari" ? agent.match(/version\/([\d.]+)/)[1] : "0";

        //浏览器外壳
        (System as any).shell = function () {
            //遨游浏览器
            if (agent.indexOf("maxthon") > 0) {
                (System as any).version = agent.match(/maxthon\/([\d.]+)/)[1] || (System as any).version;
                return "傲游浏览器";
            }
            //QQ浏览器
            if (agent.indexOf("qqbrowser") > 0) {
                (System as any).version = agent.match(/qqbrowser\/([\d.]+)/)[1] || (System as any).version;
                return "QQ浏览器";
            }

            //搜狗浏览器
            if (agent.indexOf("se 2.x") > 0) {
                return '搜狗浏览器';
            }

            //Chrome:也可以使用window.chrome && window.chrome.webstore判断
            if (chrome && (System as any).type !== "Opera") {
                var external = window.external,
                    clientInfo = window.clientInformation,


                    //客户端语言:zh-cn,zh.360下面会返回undefined
                    clientLanguage = clientInfo.languages;

                //猎豹浏览器:或者agent.indexOf("lbbrowser")>0
                if (external && 'LiebaoGetVersion' in external) {
                    return '猎豹浏览器';
                }
                //百度浏览器
                if (agent.indexOf("bidubrowser") > 0) {
                    (System as any).version = agent.match(/bidubrowser\/([\d.]+)/)[1] || agent.match(/chrome\/([\d.]+)/)[1];
                    return "百度浏览器";
                }
                //360极速浏览器和360安全浏览器
                if (System.supportSubTitle() && typeof clientLanguage === "undefined") {
                    //object.key()返回一个数组.包含可枚举属性和方法名称
                    var storeKeyLen = Object.keys(chrome.webstore).length,
                        v8Locale = "v8Locale" in window;
                    return storeKeyLen > 1 ? '360极速浏览器' : '360安全浏览器';
                }
                return "Chrome";
            }
            return (System as any).type;
        };

        //浏览器名称(如果是壳浏览器,则返回壳名称)
        (System as any).name = (System as any).shell();
        //对版本号进行过滤过处理
        (System as any).version = (System as any).versionFilter((System as any).version);
    } catch (e) {
        console.log("error");
    }
    return {
        client: System
    };
}

