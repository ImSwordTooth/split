import React, { PureComponent } from 'react'
import * as PIXI from 'pixi.js'
import { connect } from 'react-redux'
import axios from 'axios'
import { message, notification } from 'antd'
import ToolBar from './ToolBar'
import Setting from './Setting'
import Conflict from './Other/Conflict'
import Point from './Other/Point'
import { changeEnv, changeParentId, deleteData, changeDataMap, changeActiveId } from '@action'
import { getChipArrayFromDataMap, getDataById, resize, startChoose, transferPaste } from './utils/common'
import { getAllChildren } from './utils/pixiUtils'
import { StyledApp } from './styles'

let deleteTimer = null

class App extends PureComponent{
    state = {
        isMoveMode: false, // 是否为移动模式，移动模式代表可以拖拽画布
        isDeleting: false, // 删除节点的timer
        isConflictReady: false, // 数据准备完毕之后，再开启解冲突
        splitChip: [], // 个性化来的，config_split.js 里带的碎片信息，需要扁平化
        allDataChip: [] // 个性化来的，allData 里的碎片信息，需要格式化为和 splitChip 相同的结构
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
            resolution: 1, // 分辨率，使用不同分辨率和像素密度的显示更容易
        })
        app.stage.interactive = true // 舞台可点击
        app.stage.hitArea = new PIXI.Rectangle(0, 0, appWidth, appHeight) // 点击区域为跟着屏幕大小的矩形

        // canvas 要覆盖住整个image
        app.renderer.view.style.position = 'absolute';
        app.renderer.view.style.top = '0';
        app.renderer.view.style.left = '0';
        app.renderer.view.style.zIndex = '3';

        // 添加图片
        if (dataMap.bc.image) {
            const texture = PIXI.Texture.from(dataMap.bc.image)
            const image = new PIXI.Sprite(texture);
            image.name = 'bc'
            image.zIndex = -1
            app.stage.addChild(image)
        }

        /**
         * 临时写死的默认图
         * */
        const texture = PIXI.Texture.from('https://i1.letvimg.com/lc14_lemf/202311/28/10/15/Snipaste_2023-11-28_10-14-36.png')
        const image = new PIXI.Sprite(texture);
        image.name = 'bc'
        image.zIndex = -1
        app.stage.addChild(image)


        app.stage.sortableChildren = true
        appElement.appendChild(app.view);
        window.app = app
        window.addEventListener('message', this.receiveMessage, false)
        document.addEventListener('keydown', this.keyEvent, false)
        document.addEventListener('wheel', resize, false)
        window.onbeforeunload = (e) => {
            if (this.props.env.indexOf('custom') === 0 || this.props.dataMap.children.length > 0) {
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

    receiveMessage = (e) => {
        if (window.location.origin === e.origin) {
            return
        }
        const { type, isSplitEmpty, data } = e.data
        switch (type) {
            case 'custom': {
                // 已收到消息，发送反馈
                window.opener.postMessage({ type: 'received' }, '*')
                if (!isSplitEmpty) {
                    transferPaste(data.splitConfig)
                    changeEnv('custom')
                } else {
                    changeEnv('custom_new')
                }
                this.compareChip(data.splitConfig, data.allData)
                setTimeout(() => {
                    const newDataMap = {...this.props.dataMap}
                    newDataMap.name = data.splitConfig.name || 'newProject'
                    newDataMap.cname = data.path
                    changeDataMap(newDataMap)
                    changeActiveId('0')
                })
                console.log('成功', e)
                break;
            }
            default: break;
        }
    }

    keyEvent = (e) => {
        const { isMoveMode, isDeleting } = this.state
        const { app } = window
        const { scale, activeId, parentId, dataMap } = this.props
        const ignoreTag = ['input', 'textarea', 'select', 'button']
        if (ignoreTag.includes(e.target.tagName.toLowerCase())) {
            return
        }
        // Delete || Backspace 并且选中了一个图形
        if ((e.keyCode === 46 || e.keyCode === 8) && activeId !== '') {
            const active = app.stage.children.find(a => activeId === a.name)
            const newDataMap = {...dataMap}
            const activeNode = getDataById(activeId, newDataMap)
            const isWithTrack = activeNode.config && activeNode.config.track && activeNode.config.track.trackId
            if (isDeleting || !isWithTrack) {
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
                if (isDeleting) {
                    axios.post('http://test0.platform.ifengidc.com/platform/server/trackApi/deleteTrack', {
                        id: activeNode.config.track.trackId
                    }).then(res => {
                        if (res.data.code === 0) {
                            activeNode.config = {
                                ...activeNode.config,
                                track: {
                                    ...(activeNode.config ? activeNode.config.track : {}),
                                    trackId: ''
                                }
                            }
                            changeDataMap(newDataMap)
                            this.setState({ isDeleting: false })
                            message.success('删除成功')
                            notification.destroy('delete')
                            clearTimeout(deleteTimer)
                            deleteTimer = null
                        }
                    })
                }
                return
            }
            if (isWithTrack && !isDeleting) {
                this.setState({ isDeleting: true })
                deleteTimer = setTimeout(() => {
                    this.setState({ isDeleting: false })
                }, 5000)
                notification.warning({
                    key: 'delete',
                    message: <h5>该节点带有埋点，删除节点会同时删除埋点信息</h5>,
                    description:
                        <div style={{fontSize: '12px'}}>
                            <strong>5</strong> 秒内再次点击 <span className="key">Delete</span> 或者 <span
                            className="key">Backspace</span> 立即删除
                            <div className="progress" style={{marginTop: '4px'}}/>
                        </div>
                    ,
                    duration: 5,
                    style: {
                        width: '400px'
                    },
                    onClose: () => this.setState({ isDeleting: false })
                })
            }
        }

        // 空格 并且没有在移动模式
        if(e.keyCode === 32 && !isMoveMode) {
            e.stopPropagation()
            startChoose()
            app.stage.children.filter(c => c.name !== 'bc').forEach(c => c.interactive = false)
            app.stage.cursor = 'grab'
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

    compareChip = (splitConfig, allData) => {
        const splitChip = getChipArrayFromDataMap(splitConfig)
        let allDataChip = []
        const AvailableChipType = ['getStaticFragment', 'getRecommendFragment', 'getStructureFragment']
        const ChipTypeMap = {
            getStaticFragment: 'static',
            getRecommendFragment: 'recommend',
            getStructureFragment: 'struct'
        }
        allData.transferV3.forEach(data => {
            if (AvailableChipType.includes(data[2])) {
                allDataChip.push({
                    chipId: data[3],
                    chipType: ChipTypeMap[data[2]],
                    chipData: {
                        name: data[0].split(':')[0],
                        title: data[0].split(':')[1] || data[0].split(':')[0]
                    }
                })
            }
        })
        this.setState({
            splitChip,
            allDataChip,
            isConflictReady: true
        })
    }

    render() {
        const { isConflictReady, splitChip, allDataChip } = this.state
        const { isFreeze } = this.props
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
                    {
                        isConflictReady &&
                        <Conflict splitChip={splitChip} allDataChip={allDataChip} />
                    }
                    {
                        isFreeze &&
                        <div className="freeze" />
                    }
                </div>
            </StyledApp>
        )
    }
}

function mapStateToProps(state) {
    const { env, mode, scale, activeId, parentId, dataMap, isFreeze } = state;
    return { env, mode, scale, activeId, parentId, dataMap, isFreeze }
}

export default connect(mapStateToProps)(App);
