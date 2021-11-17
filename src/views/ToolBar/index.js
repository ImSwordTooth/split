import React, {PureComponent} from 'react'
import * as PIXI from 'pixi.js'
import { connect } from 'react-redux'
import {changeMode, changeScale, changeDataMap, changeActiveId, changeEditId} from '../../store/action'
import UploadImage from "../components/UploadImage";
import {getAllChildren, hitTest, updateLineStyle} from "../utils/pixiUtils";
import {getDataById} from "../utils/common";

class ToolBar extends PureComponent {

    state = {
        hitObject: null
    }

    choose = () => {
        const {  scale } = this.props
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
                const { dataMap } = this.props
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
                                    const data = getDataById(children[i].name, activeData)
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

    drawNormal = (e) => {
        const { dataMap, scale } = this.props
        const { app } = window
        const blocks = app.stage.children.filter(c => c.name !== 'bc' && c.name !== 'point')
        changeMode('rect')
        blocks.forEach(b => b.interactive = false)
        app.stage.removeAllListeners()
        app.stage.on('pointermove', this.findHit)
        let start = {}
        let ing = false
        let duringRect = new PIXI.Graphics()
        app.stage.cursor = 'crosshair'

        const handleEnd = (event) => {
            if (ing) {
                const end = {...event.data.global}
                const shape = new PIXI.Graphics()
                app.stage.removeChild(duringRect)
                shape.lineStyle(2, 0x1099bb, .85)
                shape.beginFill(0x1099bb, 0.1)
                const width = Math.abs(end.x-start.x) / scale
                const height = Math.abs(end.y-start.y) / scale
                shape.drawRect(
                    0,
                    0,
                    width,
                    height
                )

                shape.x = (Math.min(start.x, end.x) - app.stage.x) / scale
                shape.y = (Math.min(start.y, end.y) - app.stage.y) / scale
                shape.endFill()
                ing = false
                start = {}
                // 有命中，在命中的容器内创建
                const { hitObject: hit } = this.state

                if (hit) {
                    const newDataMap = { ...dataMap }
                    const parent = getDataById(hit.name, newDataMap)
                    const newId = parent.id + '_' + parent.willCreateKey + ''
                    parent.children.push({
                        id: newId,
                        name: `组件${newId}`,
                        x: shape.x,
                        y: shape.y,
                        width,
                        height,
                        children: [],
                        willCreateKey: 1
                    })
                    parent.willCreateKey++
                    // shape.x -= parent.x
                    // shape.y -= parent.y
                    shape.name = newId
                    app.stage.addChild(shape)

                    changeActiveId(newId)
                    changeEditId(newId)
                    changeDataMap(newDataMap)
                } else {
                    // 没有命中，创建到总容器内
                    const newId = dataMap.willCreateKey + ''
                    changeDataMap({
                        ...dataMap,
                        willCreateKey: dataMap.willCreateKey + 1,
                        children: [
                            ...dataMap.children,
                            {
                                id: newId,
                                name: `组件${newId}`,
                                x: shape.x,
                                y: shape.y,
                                width,
                                height,
                                children: [],
                                willCreateKey: 1
                            }
                        ]
                    })
                    shape.name = newId
                    app.stage.addChild(shape)
                    changeActiveId(newId)
                    changeEditId(newId)
                }
                this.drawNormal()
            }
        }

        app.stage.on('pointerdown', (event) => {
            start = {...event.data.global}
            app.stage.off('pointermove', this.findHit)
            duringRect.visible = false
            duringRect.name = 'tmp'
            app.stage.addChild(duringRect)
            ing = true

            app.stage.on('pointermove', (event) => {
                duringRect.visible = true
                if (ing) {
                    const current = {...event.data.global}
                    duringRect.clear()
                    duringRect.lineStyle(2, 0x1099bb, 1)
                    duringRect.beginFill(0x1099bb, 0.1)
                    duringRect.drawRect(
                        (start.x - app.stage.x) / app.stage.scale.x,
                        (start.y - app.stage.y) / app.stage.scale.y,
                        (current.x-start.x) / app.stage.scale.x,
                        (current.y-start.y) / app.stage.scale.y
                    )
                    duringRect.endFill()
                }
            })
            app.stage.on('pointerup', handleEnd)
            app.stage.on('pointerupoutside', handleEnd)
        })
    }

    findHit = (event) => {
        const { hitObject } = this.state
        const hit = hitTest(event.data.global)
        if (!hitObject || !hit || (hitObject && hit && hit.name !== hitObject.name)) {
            if (hitObject) {
                hitObject.tint = 0xffffff
            }
            if (hit) {
                hit.tint = 0x7c7c7c;
            }
            this.setState({
                hitObject: hit
            })
        }

    }


    resize = (e, to) => {
        const { scale } = this.props
        const { app } = window
        // 要按 command
        if (e && !e.metaKey) {
            return
        }
        const { x, y } = app.stage
        const newScale = to || Number((scale.y - e.deltaY / 300).toFixed(2))
        if (newScale <= 4 && newScale >= 0.1) {
            app.stage.setTransform(x,y, newScale, newScale)
            app.stage.hitArea.x = -app.stage.x / newScale
            app.stage.hitArea.y = -app.stage.y / newScale
            app.stage.hitArea.width = app.view.width / newScale
            app.stage.hitArea.height = app.view.height / newScale

            changeScale(newScale)
        }
    }

    resizeTo = size => {
        this.resize(null, size)
    }

    test = () => {
        // window.app.stage.children.find(a => a.name === '1_1').hitFirst = true
    }

    render() {
        const { mode, scale } = this.props
        return (
            <div>
                <div className="toolbar">
                    <div>
                        <button onClick={this.choose} className={mode === 'choose' ? 'active': ''}>选择</button>
                        <button onClick={this.drawNormal} className={mode === 'rect' ? 'active': ''}>矩形</button>
                        <span>当前缩放度：{scale}</span>
                        <button onClick={() => this.resizeTo( 0.5)}>缩放到50%</button>
                        <button onClick={() => this.resizeTo( 1)}>缩放到100%</button>
                        <UploadImage />
                        <button onClick={this.test}>测试标记</button>
                    </div>
                    <div>
                        <span style={{marginRight: '20px'}}>空格+鼠标拖拽移动画布</span>
                        <span>command+滚轮放大缩小</span>
                    </div>

                </div>
            </div>
        )
    }
}

function mapStateToProps(state) {
    const { mode, scale, dataMap } = state;
    return { mode, scale, dataMap }
}

export default connect(mapStateToProps)(ToolBar)
