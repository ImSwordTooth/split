import crypto from 'crypto'
import { message } from 'antd'
import * as PIXI from 'pixi.js'
import Color from 'color'
import store from '../../store'
import { changeActiveId, changeDataMap, changeMode, changeScale, changeEditId } from '@action'
import { getAllChildren } from './pixiUtils'

/**
 * 通过id从树中获取节点
 *
 * @param {String} id 节点id
 * @param {Object} obj 搜寻的范围，默认值为 dataMap
 *
 * @return {Object} 节点
 * */
export const getDataById = (id, obj = store.getState().dataMap) => {
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
    const hit = app.stage.children.find(a => !!a.isHit)
    if (hit) {
        hit.filters = []
    }
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
    const newScale = to || Number((scale + e.wheelDeltaY / 120 / 100).toFixed(2)) // 滚动到指定缩放度，没有的话就看鼠标滚动距离
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

export const getPublicPath = () => {
    return process.env.NODE_ENV === 'production' ? '/utils/split' : ''
}

/**
 * 把数据转化为内容，一般是粘贴或者跳转
 *
 * @param {String|Object} data 数据，如果是字符串类型，需要先转成对象
 *
 * */
export const transferPaste = (data) => {
    const { extraSetting } = store.getState()

    const transferPaste_pixi = (obj) => {
        if (obj.children.length > 0) {
            for (let c of obj.children) {
                const textStyle = {
                    fontFamily: 'Arial',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    fill: c.color,
                    stroke: Color(c.color).isLight() ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                    strokeThickness: 4,
                    dropShadow: true,
                    dropShadowColor: '#cccccc',
                    dropShadowAngle: Math.PI / 6,
                    dropShadowDistance: 2,
                    dropShadowBlur: 4,
                    wordWrap: true, //是否允许换行
                    wordWrapWidth: 440 //换行执行宽度
                }
                const graphics = new PIXI.Graphics()
                const color = hex2PixiColor(c.color)
                graphics.name = c.id
                graphics.lineStyle(4, color, 1)
                graphics.beginFill(color, 0.2)
                graphics.x = c.x
                graphics.y = c.y
                graphics.text = c.name
                graphics.drawRect(0, 0, c.width, c.height)
                graphics.endFill()
                let basicText = new PIXI.Text(graphics.text, textStyle)
                basicText.name = 'text'
                basicText.x = 0
                basicText.y = -24
                basicText.resolution = 2
                basicText.visible = extraSetting.isShowText
                graphics.addChild(basicText)
                window.app.stage.addChild(graphics)
                transferPaste_pixi(c)
            }
        }
    }

    const { app } = window
    let res = {}
    if (typeof data === 'string') {
        try{
            // eslint-disable-next-line no-new-func
            res = new Function(`return ${data}`)()
        } catch (e) {
            try {
                res = JSON.parse(data)
            } catch (e) {
                message.error(`转换失败：${e}`)
                return
            }
        }
    } else {
        res = data
    }

    try {
        changeActiveId('')
        changeDataMap(res)
        for (let i of window.app.stage.children.filter(a => a.name !== 'bc' && a.name !== 'point')) {
            window.app.stage.removeChild(i)
        }
        if (res.bc.image) {
            const texture = PIXI.Texture.from(res.bc.image)
            const image = new PIXI.Sprite(texture);
            image.name = 'bc'
            image.zIndex = -1
            image.setTransform(0, 0, res.bc.scale, res.bc.scale)
            window.app.stage.removeChild(...app.stage.children.filter(c => c.name === 'bc'))
            app.stage.addChild(image)
        }
        transferPaste_pixi(res)
        startChoose()
        message.success('粘贴成功！')
    } catch (e) {
        message.error(`转换失败: ${e}`)
    }
}

/**
 * 从 dataMap 中取出碎片信息，并返回一个数组
 * 一般用于数据的导出，或者和个性化里的 allData 比较
 *
 * @param {Object} dataMap 可选，如果没有提供一个数据源，就使用默认的 store 里的
 * */
export const getChipArrayFromDataMap = (dataMap = store.getState().dataMap) => {
    let res = []

    const getChip = (obj) => {
        if (obj.config && obj.config.chip && obj.config.chip.length > 0) {
            obj.config.chip.forEach(c => {
                res.push({...c, id: obj.id})
            })
        }
        if (obj.children && obj.children.length > 0) {
            for (let i in obj.children) {
                getChip(obj.children[i])
            }
        }
    }

    getChip(dataMap)
    return res
}

/**
 * 从 dataMap 中取出预设组件，并返回一个数组
 * 一般用于数据的导出
 *
 * @param {Object} dataMap 可选，如果没有提供一个数据源，就使用默认的 store 里的
 * */
export const getPreComponentArrayFromDataMap = (dataMap = store.getState().dataMap) => {
    let res = []

    const getPreComponent = (obj) => {
        if (obj.config && obj.config.component && obj.config.component.preComponent) {
            res.push(...obj.config.component.preComponent)
        }
        if (obj.children && obj.children.length > 0) {
            for (let i in obj.children) {
                getPreComponent(obj.children[i])
            }
        }
    }
    getPreComponent(dataMap)
    return res
}

/**
 * TODO
 * */
export const GetTrackFromDataMap = () => {

}

