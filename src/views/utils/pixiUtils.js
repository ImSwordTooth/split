import { getDataById } from './common'
import store from '../../store'

/**
 * 判断点击的是哪个图形，按照图形创建顺序倒叙
 *
 * @param {Object} point 点坐标
 * @param {Number} point.x 横坐标
 * @param {Number} point.y 纵坐标
 *
 * @return {Object} 点击命中的图形
 *
 * */
export const hitTest = (point) => {
    let allChildren = getAllChildren()
    for (let i=allChildren.length - 1; i>=0; i--) {
        const block = allChildren[i]
        const isIn = isPointInRect(point, { ...block.getLocalBounds(), x: block.x, y: block.y })
        if (isIn) {
            return block
        }
    }
}

/**
 * 判断点是否在矩形里
 * 
 * @param {Object} point 点坐标
 * @param {Number} point.x 横坐标
 * @param {Number} point.y 纵坐标
 * 
 * @param {Object} rect 矩形信息
 * @param {Number} rect.x 矩形左上角横坐标
 * @param {Number} rect.y 矩形左上角横坐标
 * @param {Number} rect.width 矩形宽度
 * @param {Number} rect.height 矩形高度
 * 
 * @return {Boolean} 是否在矩形内部
 * */
export const isPointInRect = (point, rect) => {
    return Boolean(point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height)
}

/**
 * 获取某个图形对象下的所有层级的children
 *
 * */
export const getAllChildren = (container) => {
    const { app } = window
    if (container) {
        return app.stage.children.filter(a => /^\d+(_\d)*$/g.test(a.name) && (a.name + '_').indexOf(container.name + '_') === 0 && container.name !== a.name)
    } else {
        return app.stage.children.filter(a => /^\d+(_\d)*$/g.test(a.name))
    }
}

/**
 * 修改图形的线条样式和填充样式
 *
 * @param {String} id 数据节点的id，也就是图形的name
 *
 * @param {Object} newLineStyle 新的线条样式
 * @param {Number} newLineStyle.lineWidth 线条宽度
 * @param {Number} newLineStyle.color 线条颜色
 * @param {Number} newLineStyle.alpha 线条透明度
 *
 * @param {Object} newFillStyle 新的填充样式
 * @param {Number} newFillStyle.color 填充颜色
 * @param {Number} newFillStyle.alpha 填充透明度
 *
 * */
export const updateLineStyle = (id, newLineStyle, newFillStyle) => {
    const { app } = window
    const { dataMap } = store.getState()
    const graphics = app.stage.children.find(a => a.name === id)
    const data =getDataById(id, dataMap)
    const { lineWidth, color, alpha } = newLineStyle
    const { color: fillColor, alpha: fillAlpha } = newFillStyle
    graphics.clear()
    graphics.lineStyle(lineWidth, color, alpha)
    graphics.beginFill(fillColor, fillAlpha)
    graphics.drawRect(
        0,
        0,
        data.width,
        data.height
    )
    graphics.endFill()
}
