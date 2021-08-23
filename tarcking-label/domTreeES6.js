class DomTree {
    constructor(dom, addWaitPutObjToPutList, getWaitPutObj, editIsSelect, showMovetBox) {
        this.editFatherIsSelect = editIsSelect
        this.handleDom = dom
        this.boardBox = this.createDomTreeBoard()
        this.styleTag = this.createStyleNode()
        document.body.appendChild(this.boardBox)
        document.body.appendChild(this.styleTag)
        this.eventMap = [
            { dom: document.querySelector('.close_tree_box'), click: this.treeBoardClose.bind(this) },
            { dom: document.getElementById('sure_select_dom_tree_dom'), click: this.sureSelectDomTreeDom.bind(this) }
        ]
        this.eventDispatch(this.eventMap)
        this.showSelectDomTree(dom, document.querySelector('.dom_tree_show_box'), 0)
        this.getSelectDom = null
        this.addWaitPutObjToPutList = addWaitPutObjToPutList
        this.getWaitPutObj = getWaitPutObj
        this.showMovetBox = showMovetBox
        this.indexList = []
    }
    //确定dom事件
    sureSelectDomTreeDom() {
        if (this.getSelectDom === null) {
            alert('请选择dom')
            return false
        }
        let domLavel = Math.max(...this.indexList)
        if(domLavel>4){
            if (!confirm(`选择节点层级为${domLavel}层，层级过多，是否确认？`)) {
                return false
            } 
        }
        this.addWaitPutObjToPutList(this.getWaitPutObj(this.getSelectDom))
        this.treeBoardClose()

    }
    //递归所选组件，判断层级
    domForEach(dom, domIndex) {
        if (dom.tagName === 'HEAD' || dom.tagName === 'STYLE' || dom.tagName === 'SCRIPT' || dom.className === 'tag_add_all_dom_box' || dom.className === 'board_select_all_box_in_this_box') return false
        let index = domIndex ? domIndex : 1
        let domList = [...dom.children]
        if (domList.length > 0) {
            index += 1
            domList.forEach(e => {
                this.domForEach(e, index)
            })
        }
        this.indexList.push(index)
    }
    //删除所有树
    treeBoardClose() {
        this.closeChild(document.body, this.boardBox)
        this.closeChild(document.body, this.styleTag)
        this.editFatherIsSelect()
        document.querySelector('.tag_move_dom_box').style.display = 'none'
    }
    //删除树
    closeChild(father, child) {
        let fatherList = [...father.children]
        let index = fatherList.indexOf(child)
        father.removeChild(fatherList[index])
    }
    //dom选择器主体
    showSelectDomTree(dom, appendDom, padding) {
        if (dom.tagName === 'HEAD' || dom.tagName === 'STYLE' || dom.tagName === 'SCRIPT' || dom.className === 'tag_add_all_dom_box' || dom.className === 'board_select_all_box_in_this_box') return false
        let _this = this
        let paddingLeft = padding + 10
        let fatherDom = document.createElement('div')
        fatherDom.style.paddingLeft = paddingLeft + 'px'
        let childDom = document.createElement('div')
        childDom.style.display = 'flex'
        let addChild = document.createElement('div')
        let childContent = document.createElement('div')
        childContent.innerHTML = `${dom.tagName}(${getTheDomXPath(dom)})`
        let list = [...dom.children]
        childContent.className = 'child_content_select_color'
        childContent.style.cursor = 'pointer'
        childContent.addEventListener('click', (e) => {
            _this.domForEach(dom)
            if (childContent.style.color === 'red') {
                childContent.style.color = 'black'
                _this.getSelectDom = null
                return false
            }
            document.querySelectorAll('.child_content_select_color').forEach(e => {
                e.style.color = 'black'
            })
            this.showMovetBox(dom)
            childContent.style.color = 'red'
            _this.getSelectDom = dom
        })
        if (dom.children.length > 0) {
            addChild = document.createElement('button')
            addChild.innerHTML = '+'
            addChild.style.cursor = 'pointer'
            addChild.addEventListener('click', (e) => {
                list.forEach(e => {
                    this.showSelectDomTree(e, fatherDom, paddingLeft)
                })
                list = []
            })
        }
        childDom.appendChild(addChild)
        childDom.appendChild(childContent)
        fatherDom.appendChild(childDom)
        appendDom.appendChild(fatherDom)
    }
    //dom选择器面板
    createDomTreeBoard() {
        let boardBox = document.createElement('div')
        boardBox.className = 'board_select_all_box_in_this_box'
        let str = `
            <div class="dom_tree_board_background">
                <div class='dom_tree_select_box'>
                    <div class='dom_tree_select_head'>
                        <div class='close_tree_box'>X</div> 
                    </div> 
                    <div class='dom_tree_show_box'>

                    </div> 
                    <div class='dom_tree_select_buttom'>
                        <button id='sure_select_dom_tree_dom' class='btn sure_dom_tree_select'>确定</button>
                    </div>
                </div> 
            </div>
        `
        boardBox.innerHTML = str
        return boardBox
    }
    //面板样式设置
    createStyleNode() {
        let styleBox = document.createElement('style')
        let styleStr = `
            .dom_tree_board_background{
                width:100vw;
                height:100vh;
                position:absolute;
                top:0;
                left:0;
                background:rgb(0,0,0,.3);
                z-index:2147483648;
                display:flex;
                justify-content:center;
                align-items:center
            }
            .dom_tree_select_box{
                min-width:500px;
                min-height:300px;
                border-radius:5px;
                border-shadow: 0 0 3px #ccc;
                background:#fff;
                display:flex;
                flex-direction: column;
                justify-content: space-between;
                align-items:center
            }
            .dom_tree_select_head{
                width:100%;
                height:35px;
                border-bottom:1px solid #ccc;
                display:flex;
                justify-content:flex-end;
                align-items:center
            }
            .close_tree_box{
                font-size:20px;
                padding-right:10px;
                cursor:pointer
            }
            .dom_tree_select_buttom{
                width:100%;
                border-top:1px solid #ccc;
                display:flex;
                justify-content:flex-end;
                padding:10px
            }
            .dom_tree_show_box{
                max-height:600px;
                min-height:200px;
                max-width:1000px;
                overflow:auto
            }
        `
        // styleBox.appendChild(document.createTextNode(styleBox))
        styleBox.innerHTML = styleStr
        return styleBox
    }
    //面板的dom添加事件
    eventDispatch(options) {
        let eventMap = options
        eventMap.forEach(e => {
            e.dom.addEventListener('click', () => {
                e.click()
            })
        })
    }
}

let getTheDomXPath = (element) => {
    if (element.id !== "") return 'id("' + element.id + '")';
    if (element === document.body) return element.tagName;

    var ix = 0;
    var siblings = element.parentNode.childNodes;
    for (var i = 0; i < siblings.length; i++) {
        var sibling = siblings[i];
        if (sibling === element) return getTheDomXPath(element.parentNode) + "/" + element.tagName + "[" + (ix + 1) + "]";
        if (sibling.nodeType === 1 && sibling.tagName === element.tagName) ix++;
    }
}