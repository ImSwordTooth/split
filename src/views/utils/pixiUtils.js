import {getDataById} from "./common";

/**
 * 判断点击的是哪个图形，按照图形创建顺序倒叙
 *
 * @param {Object} point 点坐标
 * @param {Number} point.x 横坐标
 * @param {Number} point.y 纵坐标
 *
 * @param {PIXI.Application}  app
 *
 * @return {Object} 点击命中的图形
 *
 * */


export const hitTest = (point, app, dataList) => {
    let allChildren = getAllChildren(app)
    const firstIndex = allChildren.findIndex(b => b.hitFirst)
    // 如果有被标记的图形，就把他置为首位
    if (firstIndex > -1) {
        const first = allChildren.splice(firstIndex, 1)
        allChildren.push(first[0])
    }
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
export const getAllChildren = (app, container) => {
    let arr = []
    if (container) {
        return app.stage.children.filter(a => /^\d(_\d)*$/g.test(a.name) && a.name.indexOf(container.name) === 0 && container.name !== a.name)
    } else {
        return app.stage.children.filter(a => /^\d(_\d)*$/g.test(a.name))
    }

    //
    // const getChildren = (obj, arr) => {
    //     obj.children.forEach(o => {
    //         if (/^\d(_\d)*$/g.test(o.name)) {
    //             arr.push(o)
    //             if (o.children && o.children.length > 0) {
    //                 return getChildren(o, arr)
    //             } else {
    //                 return arr
    //             }
    //         }
    //     })
    // }
    //
    // getChildren(container, arr)
    // return arr
}

export const updateLineStyle = (obj, lineWidth, color, alpha) => {
    obj.lineStyle(lineWidth, color, alpha)
    // lineWidth = lineWidth;
    // obj.lineColor = color;
    // obj.alpha = alpha;
    obj.dirty++;
    obj.clearDirty++;
}
