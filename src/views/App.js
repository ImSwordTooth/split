import React, {PureComponent} from "react";
import * as PIXI from 'pixi.js'
import { connect } from 'react-redux'
import Point from "./components/Point"
import ToolBar from "./ToolBar";
import { changeMode, changeScale, deleteData} from "../store/action";
import { StyledApp } from './styles'
import {getAllChildren} from "./utils/pixiUtils";
import Setting from "./components/Setting";

class App extends PureComponent{
    state = {
        isMoveMode: false
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
        image.zIndex = -1
        app.stage.addChild(image)
        app.stage.sortableChildren = true
        appElement.appendChild(app.view);
        window.app = app
        document.addEventListener('keydown', this.keyEvent, false)
        document.addEventListener('wheel', this.resize, false)
    }

    componentWillUnmount() {
        const { app } = window
        document.removeEventListener('keydown', this.keyEvent, false)
        document.removeEventListener('wheel', this.resize, false)
        app.stage.removeAllListeners()
    }

    keyEvent = (e) => {
        const { isMoveMode } = this.state
        const { app } = window
        const { scale, activeId } = this.props
        // Delete 并且选中了一个图形
        if (e.keyCode === 46 && activeId !== '') {
            const active = app.stage.children.find(a => activeId === a.name)
            app.stage.removeChild(active)
            const children = getAllChildren(active)
            for (let i=0; i<children.length; i++) {
                app.stage.removeChild(children[i])
            }
            deleteData(activeId)
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
        const { app } = window
        app.stage.cursor = 'default'
        this.setState({
            isMoveMode: false
        })
        app.stage.removeAllListeners()
        document.removeEventListener('keyup', this.cancelMove)
    }

    resize = (e, to) => {
        const { app } = window
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

    render() {
        return (
            <StyledApp>
                <ToolBar />
                <div className="main">
                    <div className="left">
                        <div className="operate" id="app">
                            <Point />
                        </div>
                    </div>
                    <div className="data">
                        <Setting />
                    </div>
                </div>
            </StyledApp>
        )
    }
}

function mapStateToProps(state) {
    const { mode, scale, activeId,  dataMap } = state;
    return { mode, scale, activeId, dataMap }
}

export default connect(mapStateToProps)(App);
