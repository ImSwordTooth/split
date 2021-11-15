import React, {PureComponent} from 'react'
import PropTypes from 'prop-types'
import * as PIXI from 'pixi.js'
import { connect } from 'react-redux'
import { changeMode, changeScale, changeDataList, changeActiveId } from '../../store/action'
import UploadImage from "../components/UploadImage";

class ToolBar extends PureComponent {

    static propTypes = {
        app: PropTypes.object
    }

    state = {
        maxNum: 1
    }

    choose = () => {
        const { app, scale } = this.props
        changeMode('choose')
        app.stage.removeAllListeners()
        const blocks = app.stage.children.filter(c => c.name !== 'bc' && c.name !== 'point')
        blocks.forEach((item, index) => {
            item.cursor = 'move'
            item.removeAllListeners()
            item.interactive = true
            item.on('pointerdown',  (event) => {
                const { dataList } = this.props
                let ing = true
                let { x: startX, y: startY } = {...event.data.global}
                const dataIndex = dataList.findIndex(a => a.id === item.name)
                if (dataIndex > -1) {
                    changeActiveId(item.name)
                    item.on('pointermove',  (event) => {
                        if (ing) {
                            const { x: endX, y: endY } = {...event.data.global}
                            item.x += (endX - startX) / scale
                            item.y += (endY - startY) / scale
                            const newDataList = [...dataList]
                            newDataList.splice(dataIndex, 1, {
                                ...newDataList[dataIndex],
                                x: item.x,
                                y: item.y
                            })

                            changeDataList(newDataList)
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
        const { maxNum } = this.state
        const { app, dataList, scale } = this.props
        const blocks = app.stage.children.filter(c => c.name !== 'mask')
        changeMode('rect')
        blocks.forEach(b => b.interactive = false)
        app.stage.removeAllListeners()
        let start = {}
        let ing = false
        let duringRect = new PIXI.Graphics()
        app.stage.cursor = 'crosshair'

        const handleEnd = (that, event) => {
            if (ing) {
                const end = {...event.data.global}
                const shape = new PIXI.Graphics()
                app.stage.removeChild(duringRect)
                shape.lineStyle(2, 0x1099bb, .85)
                shape.beginFill(0x1099bb, 0.1)
                const width = (end.x-start.x) / scale
                const height = (end.y-start.y) / scale
                shape.drawRect(
                    0,
                    0,
                    (end.x-start.x) / scale,
                    (end.y-start.y) / scale
                )

                shape.x = (Math.min(start.x, end.x) - app.stage.x) / scale
                shape.y = (Math.min(start.y, end.y) - app.stage.y) / scale
                const thisId = maxNum.toString()
                changeDataList([...dataList, {
                    id: thisId,
                    name: `组件${maxNum}`,
                    x: shape.x,
                    y: shape.y,
                    width,
                    height
                }])
                shape.endFill()
                shape.name = maxNum + ''
                ing = false
                start = {}
                app.stage.addChild(shape)
                this.choose()
                app.stage.cursor = 'default'
                changeActiveId(thisId)
                this.setState({
                    maxNum: maxNum + 1
                })
            }
        }

        app.stage.on('pointerdown', function (event) {
            start = {...event.data.global}
            duringRect.visible = false
            duringRect.name = 'tmp'
            app.stage.addChild(duringRect)
            ing = true

            app.stage.on('pointermove', function (event) {
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
            app.stage.on('pointerup', function (event) { handleEnd(this, event) })
            app.stage.on('pointerupoutside', function (event) { handleEnd(this, event) })
        })
    }


    resize = (e, to) => {
        const { app, scale } = this.props
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

    render() {
        const { app, mode, scale } = this.props
        return (
            <div>
                <div className="toolbar">
                    <div>
                        <button onClick={this.choose} className={mode === 'choose' ? 'active': ''}>选择</button>
                        <button onClick={this.drawNormal} className={mode === 'rect' ? 'active': ''}>矩形</button>
                        <span>当前缩放度：{scale}</span>
                        <button onClick={() => this.resizeTo( 0.5)}>缩放到50%</button>
                        <button onClick={() => this.resizeTo( 1)}>缩放到100%</button>
                        <UploadImage app={app}/>
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
    const { mode, scale, dataList } = state;
    return { mode, scale, dataList }
}

export default connect(mapStateToProps)(ToolBar)
