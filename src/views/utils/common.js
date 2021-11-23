import store from '../../store'
import {changeActiveId, changeDataMap, changeEditId, changeMode} from "../../store/action";
import {getAllChildren} from "./pixiUtils";
import PIXI from "pixi.js";

export const getDataById = (id, obj, isPixi = false) => {
    const key = isPixi ? 'name': 'id'
    if (obj[key] === id){
        return obj;
    } else {
        for (let i=0; i<obj.children.length;i++){
            if (id.indexOf(obj.children[i][key]) === 0){
                return getDataById(id, obj.children[i], isPixi);
            }
        }
    }
}


/**
 * 切换到选择模式
 *
 * */
export const startChoose = () => {
    const { app } = window
    changeMode('choose')
    app.stage.cursor = 'default'
    app.stage.removeAllListeners()
    const blocks = getAllChildren()
    blocks.forEach((item, index) => {
        item.cursor = 'move'
        item.removeAllListeners()
        item.interactive = true
        item.on('pointerdown',  (event) => {
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
