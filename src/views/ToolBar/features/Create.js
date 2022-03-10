import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import * as PIXI from 'pixi.js'
import { GlowFilter } from '@pixi/filter-glow'
import RandomColor from 'randomcolor'
import Color from 'color'
import { Tooltip } from 'antd'
import Icon from '../../components/Icon'
import { changeMode, changeActiveId, changeEditId, changeDataMap } from '@action'
import { getDataById, hex2PixiColor, startChoose } from '../../utils/common'
import { hitTest } from '../../utils/pixiUtils'

const outlineFilter = new GlowFilter({ distance: 8, outerStrength: 3, color: 0xaaaaaa, quality: 1 })

class Create extends PureComponent {

    static propTypes = {
        colorType: PropTypes.string, // 随机颜色范围
        colorLightness: PropTypes.string, // 颜色亮度
    }

    state = {
        hitObject: null, // 创建模式，鼠标hover的图形，放在这里是起到缓存的作用
        nextRectColor: '' // 即将创建的图形的颜色，随机颜色
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
        if (e.keyCode === 82 && !e.metaKey ) {
            this.drawNormal()
        }
    }

    drawNormal = () => {
        const { dataMap, colorType, colorLightness } = this.props
        const { app } = window
        const blocks = app.stage.children.filter(c => c.name !== 'bc' && c.name !== 'point')
        changeMode('rect')
        blocks.forEach(b => b.interactive = false)
        app.stage.removeAllListeners()
        app.stage.on('pointermove', this.findHit)
        let start = {}
        let duringRect = new PIXI.Graphics()
        app.stage.cursor = 'crosshair'

        let pixiColor
        let color = RandomColor({ luminosity: colorLightness, hue: colorType})
        pixiColor = hex2PixiColor(color)
        if (colorType !== 'hue') {
            this.setState({
                nextRectColor: color
            })
        }
        const handleEnd = (event) => {
            const { parentId, scale, extraSetting } = this.props
            const { hitObject: hit } = this.state
            const end = {...event.data.global}

            const shape = new PIXI.Graphics()
            app.stage.removeChild(duringRect)
            // 如果只移动了很小的距离，就不创建
            if (Math.abs(end.x - start.x) < 2 && Math.abs(end.y-start.y) < 2) {
                app.stage.off('pointerup')
                app.stage.off('pointerupoutside')
                return
            }

            const width = Math.abs(end.x-start.x) / scale
            const height = Math.abs(end.y-start.y) / scale
            shape.lineStyle(4, pixiColor, 1)
            shape.beginFill(pixiColor, 0.2)
            shape.drawRect(
                0,
                0,
                width,
                height
            )
            shape.x = (Math.min(start.x, end.x) - app.stage.x) / scale
            shape.y = (Math.min(start.y, end.y) - app.stage.y) / scale
            shape.endFill()

            // 有命中，在命中的容器内创建
            if (parentId || hit) {
                const newDataMap = { ...dataMap }
                let parent
                if (parentId) {
                    parent = getDataById(parentId, newDataMap)
                } else {
                    parent = getDataById(hit.name, newDataMap)
                }

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
                shape.name = newId
                shape.text = `组件${newId}`
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
                shape.text = `组件${newId}`
                app.stage.addChild(shape)
                changeActiveId(newId)
                changeEditId(newId)
            }
            start = {}
            const textStyle = {
                fontFamily: 'Arial',
                fontSize: '13px',
                fontWeight: 'bold',
                fill: color,
                stroke: Color(color).isLight() ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                strokeThickness: 4,
                dropShadow: true,
                dropShadowColor: '#cccccc',
                dropShadowAngle: Math.PI / 6,
                dropShadowDistance: 2,
                dropShadowBlur: 4,
                wordWrap: true, //是否允许换行
                wordWrapWidth: 440 //换行执行宽度
            }
            let basicText = new PIXI.Text(shape.text, textStyle)
            basicText.name = 'text'
            basicText.x = 0
            basicText.y = -24
            basicText.resolution = 2
            basicText.visible = extraSetting.isShowText
            shape.addChild(basicText)
            this.drawNormal()
            app.stage.off('pointerup')
            app.stage.off('pointerupoutside')
        }

        app.stage.on('pointerdown', (event) => {
            const { parentId, dataMap } = this.props
            const { hitObject: hit } = this.state

            if (colorType === 'hue' && (parentId || hit)) {
                let parent = getDataById(parentId || hit.name, dataMap)
                color = RandomColor({ hue: parent ? parent.color : '', luminosity: colorLightness })
            }
            pixiColor = hex2PixiColor(color)
            this.setState({
                nextRectColor: color
            })

            if (event.data.button !== 0) {
                return
            }
            start = {...event.data.global}
            app.stage.off('pointermove', this.findHit)
            duringRect.visible = false
            duringRect.name = 'tmp'
            app.stage.addChild(duringRect)

            app.stage.on('pointermove', (event) => {
                duringRect.visible = true
                const current = {...event.data.global}
                duringRect.clear()
                duringRect.lineStyle(4, pixiColor, 1)
                duringRect.beginFill(pixiColor, 0.2)
                duringRect.drawRect(
                    (start.x - app.stage.x) / app.stage.scale.x,
                    (start.y - app.stage.y) / app.stage.scale.y,
                    (current.x-start.x) / app.stage.scale.x,
                    (current.y-start.y) / app.stage.scale.y
                )
                duringRect.endFill()
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
                hitObject.filters = []
                hitObject.isHit = false
            }
            if (hit) {
                hit.filters = [outlineFilter]
                hit.isHit = true // 标记一下，用于全局清除
            }
            this.setState({
                hitObject: hit
            })
        }
    }

    render() {
        const { mode } = this.props
        const { nextRectColor } = this.state

        return (
            <Tooltip title="创建矩形 (R)">
                <button onClick={this.drawNormal} className={`btn ${mode === 'rect' ? 'active': ''}`} style={mode === 'rect' ? { color: nextRectColor } : {}}>
                    <Icon icon="rect"/>
                </button>
            </Tooltip>
        )
    }
}

function mapStateToProps(state) {
    const { mode, scale, parentId, dataMap, extraSetting } = state;
    return { mode, scale, parentId, dataMap, extraSetting }
}

export default connect(mapStateToProps)(Create)
