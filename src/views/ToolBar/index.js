import React, {PureComponent} from 'react'
import * as PIXI from 'pixi.js'
import { connect } from 'react-redux'
import {changeMode, changeScale, changeDataMap, changeActiveId, changeEditId} from '../../store/action'
import UploadImage from "../components/UploadImage";
import {hitTest} from "../utils/pixiUtils";
import {getDataById, getRandomColor, hex2PixiColor, startChoose} from "../utils/common";
import { StyledToolbar } from './styles'
import {Button, message} from "antd";

class ToolBar extends PureComponent {

    state = {
        hitObject: null
    }

    componentDidMount() {
        document.addEventListener('keydown', this.keyEvent, false)
    }

    componentWillUnmount() {
        const { app } = window
        document.removeEventListener('keydown', this.keyEvent, false)
        app.stage.removeAllListeners()
    }

    keyEvent = (e) => {
        const { mode } = this.props

        // Esc 取消创建
        if (e.keyCode === 27 && mode === 'rect') {
            startChoose()
        }

        // ---------------  在文本框等内不监听的情况
        const ignoreTag = ['input', 'textarea', 'select', 'button']
        if (ignoreTag.includes(e.target.tagName.toLowerCase())) {
            return
        }
        // R 创建矩形
        if (e.keyCode === 82 && mode !== 'rect') {
            this.drawNormal()
        }
    }

    drawNormal = () => {
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
        const color = getRandomColor()
        const pixiColor = hex2PixiColor(color)

        const handleEnd = (event) => {
            if (ing) {
                const end = {...event.data.global}
                const shape = new PIXI.Graphics()
                app.stage.removeChild(duringRect)
                shape.lineStyle(2, pixiColor, 1)
                shape.beginFill(pixiColor, 0.2)
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
                        color,
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
                                color,
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
                    duringRect.lineStyle(2, pixiColor, 1)
                    duringRect.beginFill(pixiColor, 0.2)
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
                hit.tint = 0xc7c7c7;
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

    test2 = () => {
        const res = getDataById('1_1', this.props.dataMap)
        console.log(res)
    }

    print = () => {
        const { dataMap } = this.props
        message.success('已打印到控制台')
        console.log('dataMap：', dataMap)
    }

    render() {
        const { mode, scale } = this.props
        return (
            <StyledToolbar>
                <div>
                    <button onClick={startChoose} className={mode === 'choose' ? 'active': ''}>选择</button>
                    <button onClick={this.drawNormal} className={mode === 'rect' ? 'active': ''}>矩形</button>
                    <span>当前缩放度：{scale}</span>
                    <button onClick={() => this.resizeTo( 0.5)}>缩放到50%</button>
                    <button onClick={() => this.resizeTo( 1)}>缩放到100%</button>
                    <UploadImage />
                    <button onClick={this.test}>测试标记</button>
                    <button onClick={this.test2}>1_1</button>
                </div>
                <div>
                    <span style={{marginRight: '20px'}}>空格+鼠标拖拽移动画布</span>
                    <span style={{marginRight: '20px'}}>command+滚轮放大缩小</span>
                    <Button type="primary" onClick={this.print}>数据</Button>
                </div>
            </StyledToolbar>
        )
    }
}

function mapStateToProps(state) {
    const { mode, scale, dataMap } = state;
    return { mode, scale, dataMap }
}

export default connect(mapStateToProps)(ToolBar)
