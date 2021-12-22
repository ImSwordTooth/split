import React, { PureComponent } from 'react'
import * as PIXI from 'pixi.js'
import { connect } from 'react-redux'
import ToolBar from './ToolBar'
import Setting from './Setting'
import Point from './components/Point'
import { changeMode, changeParentId, deleteData } from '@action'
import { resize, startChoose } from './utils/common'
import { getAllChildren } from './utils/pixiUtils'
import { StyledApp } from './styles'

class App extends PureComponent{
    state = {
        isMoveMode: false // 是否为移动模式，移动模式代表可以拖拽画布
    }

    componentDidMount() {
        const { dataMap } = this.props
        PIXI.utils.skipHello() // 跳过 pixi 的欢迎语
        const appElement = document.getElementById('app')
        const appWidth = window.innerWidth
        const appHeight = window.innerHeight - 48 // 减去 toolbar 的高度
        const app = new PIXI.Application({
            width: appWidth,
            height: appHeight,
            antialias: true, // 抗锯齿
            transparent: true, // 背景透明
            resolution: 1, // 解析度
        })
        app.stage.interactive = true // 舞台可点击
        app.stage.hitArea = new PIXI.Rectangle(0, 0, appWidth, appHeight) // 点击区域为跟着屏幕大小的矩形

        // canvas 要覆盖住整个image
        app.renderer.view.style.position = 'absolute';
        app.renderer.view.style.top = '0';
        app.renderer.view.style.left = '0';
        app.renderer.view.style.zIndex = '3';

        // 添加图片
        const texture = PIXI.Texture.from(dataMap.bc.image)
        const image = new PIXI.Sprite(texture);
        image.name = 'bc'
        image.zIndex = -1
        app.stage.addChild(image)
        app.stage.sortableChildren = true
        appElement.appendChild(app.view);
        window.app = app
        document.addEventListener('keydown', this.keyEvent, false)
        document.addEventListener('wheel', resize, false)
        window.onbeforeunload = (e) => {
            if (this.props.dataMap.children.length > 0) {
                e.returnValue = false
            }
        }
    }

    componentWillUnmount() {
        const { app } = window
        document.removeEventListener('keydown', this.keyEvent, false)
        document.removeEventListener('wheel', resize, false)
        app.stage.removeAllListeners()
    }

    keyEvent = (e) => {
        const { isMoveMode } = this.state
        const { app } = window
        const { scale, activeId, parentId } = this.props
        const ignoreTag = ['input', 'textarea', 'select', 'button']
        if (ignoreTag.includes(e.target.tagName.toLowerCase())) {
            return
        }
        // Delete || Backspace 并且选中了一个图形
        if ((e.keyCode === 46 || e.keyCode === 8) && activeId !== '') {
            const active = app.stage.children.find(a => activeId === a.name)
            app.stage.removeChild(active)
            const children = getAllChildren(active)
            for (let i=0; i<children.length; i++) {
                app.stage.removeChild(children[i])
            }
            if (activeId === parentId) {
                changeParentId('')
            }
            deleteData(activeId)
            startChoose()
        }

        // 空格 并且没有在移动模式
        if(e.keyCode === 32 && !isMoveMode) {
            app.stage.children.filter(c => c.name !== 'bc').forEach(c => c.interactive = false)
            e.stopPropagation()
            app.stage.cursor = 'grab'
            changeMode('choose')
            this.setState({ // 改为选择模式
                isMoveMode: true,
            })
            app.stage.removeAllListeners() // 先清理事件
            // 注册鼠标按下事件，记录起点
            app.stage.on('mousedown', (e) => {
                app.stage.cursor = 'grabbing'
                let { x: oldX, y: oldY } = {...e.data.global}

                // 移动时记录终点，更新画布的坐标，修改画布点击区域位置，然后更新起点
                const handleStageMove = (e) => {
                    const { x: newX, y: newY } = {...e.data.global}
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
                }

                // 注册鼠标移动和抬起事件
                app.stage.on('mousemove', handleStageMove)
                app.stage.on('mouseup', cancelStageMove)
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
        app.stage.children.filter(c => c.name !== 'bc').forEach(c => c.interactive = true)
        app.stage.removeAllListeners()
        document.removeEventListener('keyup', this.cancelMove)
    }

    render() {
        return (
            <StyledApp>
                <ToolBar />
                <div className="main">
                    <div className="operate" id="app">
                        <Point />
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
    const { mode, scale, activeId, parentId, dataMap } = state;
    return { mode, scale, activeId, parentId, dataMap }
}

export default connect(mapStateToProps)(App);
