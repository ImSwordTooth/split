import crypto from 'crypto'
import store from '../../store'
import { changeActiveId, changeDataMap, changeMode, changeScale, changeEditId } from '@action'
import { getAllChildren } from './pixiUtils'

/**
 * 通过id从树中获取节点
 *
 * @param {String} id 节点id
 * @param {Object} obj 搜寻的范围
 *
 * @return {Object} 节点
 * */
export const getDataById = (id, obj) => {
    if (obj.id === id){
        return obj;
    } else {
        for (let i=0; i<obj.children.length;i++){
            if (id.split('_').length === 1) {
                if (id === obj.children[i].id){
                    return getDataById(id, obj.children[i]);
                }
            } else {
                if (id.indexOf(obj.children[i].id + '_') === 0 || id === obj.children[i].id){
                    return getDataById(id, obj.children[i]);
                }
            }
        }
    }
}


/**
 * 切换到选择模式，有不少地方需要用到
 *
 * */
export const startChoose = () => {
    const { app } = window
    changeMode('choose')
    changeEditId('')
    app.stage.cursor = 'default'
    app.stage.removeAllListeners()
    const blocks = getAllChildren()
    blocks.forEach((item, index) => {
        item.cursor = 'move'
        item.removeAllListeners()
        item.interactive = true
        item.on('pointerdown',  (event) => {
            if (event.data.button !== 0) { // 只响应鼠标左键
                return
            }
            const { scale, dataMap } = store.getState()
            let ing = true
            let { x: startX, y: startY } = {...event.data.global}
            const newDataMap = {...dataMap}
            const activeData = getDataById(item.name, newDataMap)
            if (activeData) {
                changeActiveId(item.name)
                item.on('pointermove',  (event) => {
                    if (ing) {
                        const { x: endX, y: endY } = {...event.data.global}
                        item.x += (endX - startX) / scale
                        item.y += (endY - startY) / scale
                        activeData.x = item.x
                        activeData.y = item.y

                        // 如果按了 command，就单独移动，否则就和子元素一起移动
                        if (!event.data.originalEvent.metaKey) {
                            const children = getAllChildren(item)
                            if (children.length > 0) {
                                for (let i=0; i<children.length; i++) {
                                    children[i].x += (endX - startX) / scale
                                    children[i].y += (endY - startY) / scale
                                    const data = getDataById(children[i].name, newDataMap)
                                    data.x = children[i].x
                                    data.y = children[i].y
                                }
                            }
                        }

                        changeDataMap(newDataMap)
                        startX = endX
                        startY = endY
                    }
                })
                item.on('pointerup', () => { ing = false })
                item.on('pointerupoutside', () => { ing = false })
            }
        })
    })
}

export const resize = (e, to) => {
    const { app } = window
    const { scale } = store.getState()
    // 要按 command
    if (e && !e.metaKey) {
        return
    }
    const { x, y } = app.stage
    const newScale = to || Number((scale - e.deltaY / 300).toFixed(2))
    if (newScale <= 4 && newScale >= 0.1) {
        app.stage.setTransform(x, y, newScale, newScale)
        app.stage.hitArea.x = -app.stage.x / newScale
        app.stage.hitArea.y = -app.stage.y / newScale
        app.stage.hitArea.width = app.view.width / newScale
        app.stage.hitArea.height = app.view.height / newScale

        changeScale(newScale)
    }
}

// hex 颜色 -> pixi 颜色
export const hex2PixiColor = (color) => {
    return parseInt(color.replace('#', '0x'), 16)
}

// 复制文本
export const copyText = (text, callback) => {
    const tag = document.createElement('input');
    tag.setAttribute('id', 'cp_input');
    tag.value = text;
    document.body.appendChild(tag);
    tag.select();
    document.execCommand('copy');
    document.body.removeChild(tag)
    if(callback) {
        callback(text)
    }
}

/**
 * MD5 签名
 * @param {String} str
 * @returns {string}
 */
export const md5 = str => {
    const md5 = crypto.createHash('md5');
    md5.update(str || '', 'utf8');
    return md5.digest('hex');
};

