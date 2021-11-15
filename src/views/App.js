import React, {PureComponent} from "react";
import * as PIXI from 'pixi.js'
import { connect } from 'react-redux'
import Point from "./components/Point"
import DataTree from "./components/DataTree";
import DragLine from "./components/DragLine/index";
import ToolBar from "./ToolBar";
import {changeActiveId, changeDataList, changeMode, changeScale} from "../store/action";
import { StyledApp } from './styles'

class App extends PureComponent{
    state = {
        app: null,
        rightWidth: 500,
        isMoveMode: false,
    }

    componentDidMount() {
        const appElement = document.getElementById('app')
        const appWidth = window.innerWidth
        const appHeight = window.innerHeight - 48 // 减去 toolbar 的高度
        const app = new PIXI.Application({
            width: appWidth,
            height: appHeight,
            antialias: true,
            transparent: true,
            resolution: 1,
        })
        app.stage.interactive = true
        app.stage.hitArea = new PIXI.Rectangle(0, 0, appWidth, appHeight)

        // canvas 要覆盖住整个image
        app.renderer.view.style.position = 'absolute';
        app.renderer.view.style.top = '0';
        app.renderer.view.style.left = '0';
        app.renderer.view.style.zIndex = '3';

        // 添加图片
        const texture = PIXI.Texture.from('https://x0.ifengimg.com/ucms/2021_46/4616816EE196C3DDF3FD415009BEB5D27901E2C8_size392_w750_h1624.png')
        const image = new PIXI.Sprite(texture);
        image.name = 'bc'

        app.stage.addChild(image)
        appElement.appendChild(app.view);
        this.setState({
            app,
        })
        document.addEventListener('keydown', this.keyEvent, false)
        document.addEventListener('wheel', this.resize, false)
    }

    componentWillUnmount() {
        const { app } = this.state
        document.removeEventListener('keydown', this.keyEvent, false)
        document.removeEventListener('wheel', this.resize, false)
        app.stage.removeAllListeners()
    }

    keyEvent = (e) => {
        const { app, isMoveMode } = this.state
        const { scale, activeId, dataList } = this.props
        // Delete 并且选中了一个图形
        if (e.keyCode === 46 && activeId !== '') {
            app.stage.removeChild(app.stage.children.find(a => activeId === a.name))
            const newDataList = [...dataList]
            newDataList.splice(dataList.findIndex(({ id }) => id.toString() === activeId), 1)
            changeDataList(newDataList)
            changeActiveId('')
            changeMode('choose')
        }

        // 空格 并且没有在移动模式
        if(e.keyCode === 32 && !isMoveMode) {
            app.stage.cursor = 'grab'
            changeMode('choose')
            this.setState({ // 改为选择模式
                isMoveMode: true,
            })
            app.stage.removeAllListeners() // 先清理事件
            // 注册鼠标按下事件，记录起点
            app.stage.on('mousedown', (e) => {
                app.stage.cursor = 'grabbing'
                let { offsetX: oldX, offsetY: oldY } = e.data.originalEvent

                // 移动时记录终点，更新画布的坐标，修改画布点击区域位置，然后更新起点
                const handleStageMove = (e) => {
                    const { offsetX: newX, offsetY: newY } = e
                    app.stage.x += newX - oldX
                    app.stage.y += newY - oldY
                    app.stage.hitArea.x -= (newX - oldX) / scale
                    app.stage.hitArea.y -= (newY - oldY) / scale
                    oldX = newX
                    oldY = newY
                }

                // 抬起时取消移动，修改光标，清理事件
                const cancelStageMove = () => {
                    this.setState({
                        isMoveMode: false
                    })
                    app.stage.cursor = 'default'
                    app.stage.removeAllListeners()
                    document.removeEventListener('mousemove', handleStageMove)
                    document.removeEventListener('mouseup', cancelStageMove)
                }

                // 注册鼠标移动和抬起事件
                document.addEventListener('mousemove', handleStageMove)
                document.addEventListener('mouseup', cancelStageMove)
            })
            // 注册键盘抬起事件，抬起了事件就结束了
            document.addEventListener('keyup', this.cancelMove)
        }
    }

    cancelMove = () => {
        const { app } = this.state
        app.stage.cursor = 'default'
        this.setState({
            isMoveMode: false
        })
        app.stage.removeAllListeners()
        document.removeEventListener('keyup', this.cancelMove)
    }

    resize = (e, to) => {
        const { app } = this.state
        // 要按 command
        if (e && !e.metaKey) {
            return
        }
        const { x, y, scale } = app.stage
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

    handlePointChange = (newData) => {
        const { dataList } = this.props
        const index = dataList.findIndex(a => a.id === newData.id)
        const newList = [...dataList]
        newList.splice(index, 1, newData)
        changeDataList(newList)
    }

    handleWidthChange = (width) => {
        this.setState({
            rightWidth: width
        })
    }

    render() {
        const { app, rightWidth } = this.state
        const { dataList, scale, activeId } = this.props
        const activeGraphics = dataList.find(a => a.id === activeId)
        return (
            <StyledApp>
                <ToolBar app={app}/>
                <div className="main">
                    <div className="left">
                        <div className="operate" id="app">
                            {
                                app && activeGraphics &&
                                <Point app={app} data={{...activeGraphics}} scale={scale} onChange={this.handlePointChange}/>
                            }
                        </div>
                    </div>
                    <div className="data" style={{ width: `${rightWidth}px` }}>
                        <DragLine width={rightWidth} onChange={this.handleWidthChange}/>
                        <DataTree />
                    </div>
                </div>
            </StyledApp>
        )
    }
}

function mapStateToProps(state) {
    const { mode, scale, activeId,  dataList } = state;
    return { mode, scale, activeId, dataList }
}

export default connect(mapStateToProps)(App);
