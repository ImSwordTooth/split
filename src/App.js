import React, {PureComponent} from "react";
import * as PIXI from 'pixi.js'
import './App.css'
import UploadImage from "./components/UploadImage";
import Point from "./components/Point"
import DataTree from "./components/DataTree";
import DragLine from "./components/DragLine";

class App extends PureComponent{
  state = {
    app: null,
    scale: 1,
    width: 500,
    dataList: [],
    maxNum: 1,
    activeId: '',
    editType: '',
    isMoveMode: false,
  }

  componentDidMount() {
    const { width } = this.state
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


  choose = () => {
    const { app, dataList, scale } = this.state
    this.setState({
      editType: 'choose'
    })
    const that = this
    app.stage.removeAllListeners()
    const blocks = app.stage.children.filter(c => c.name !== 'bc' && c.name !== 'point')
    blocks.forEach((item, index) => {
      item.cursor = 'move'
      item.removeAllListeners()
      item.interactive = true
      item.on('pointerdown',  (event) => {
        // let startX = current
        let ing = true
        let { x: startX, y: startY } = {...event.data.global}
        const dataIndex = this.state.dataList.findIndex(a => a.id === parseInt(item.name, 10))
        if (dataIndex > -1) {
          that.setState({
            activeId: item.name
          })
          item.on('pointermove',  (event) => {
            if (ing) {
              const { x: endX, y: endY } = {...event.data.global}
              item.x += (endX - startX) / app.stage.scale.x
              item.y += (endY - startY) / app.stage.scale.y
              const dataIndex = this.state.dataList.findIndex(a => a.id === parseInt(item.name, 10))
              const newDataList = [...this.state.dataList]
              newDataList.splice(dataIndex, 1, {
                ...newDataList[dataIndex],
                x: item.x,
                y: item.y
              })
              that.setState({
                dataList: newDataList
              })
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
    const { app, maxNum, dataList, scale } = this.state
    const root = this
    const blocks = app.stage.children.filter(c => c.name !== 'mask')
    this.setState({
      editType: 'rect'
    })
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
        root.setState({
          dataList: [...dataList, {
            id: maxNum,
            name: `组件${maxNum}`,
            x: shape.x,
            y: shape.y,
            width,
            height
          }]
        })
        shape.endFill()
        shape.name = maxNum + ''
        ing = false
        start = {}
        app.stage.addChild(shape)
        root.choose()
        app.stage.cursor = 'default'
        root.setState({
          activeId: maxNum + '',
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

  keyEvent = (e) => {
    const { app, scale, activeId, dataList, isMoveMode } = this.state
    // Delete 并且选中了一个图形
    if (e.keyCode === 46 && activeId !== '') {
      app.stage.removeChild(app.stage.children.find(a => activeId === a.name))
      const newDataList = [...dataList]
      newDataList.splice(dataList.findIndex(({ id }) => id.toString() === activeId), 1)
      this.setState({
        dataList: newDataList,
        activeId: ''
      }, () => {
        this.choose()
      })
    }

    // 空格 并且没有在移动模式
    if(e.keyCode === 32 && !isMoveMode) {
      app.stage.cursor = 'grab'
      this.setState({ // 改为选择模式
        isMoveMode: true,
        editType: 'choose'
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
      this.setState({
        scale: newScale
      })
    }
  }

  resizeTo = size => {
    this.resize(null, size)
  }

  handlePointChange = (newData) => {
    const index = this.state.dataList.findIndex(a => a.id === newData.id)
    const newList = [...this.state.dataList]
    newList.splice(index, 1, newData)
    this.setState({
      dataList: newList
    })
  }

  handleIdChange = (id) => {
    this.setState({
      activeId: id
    })
  }

  handleWidthChange = (width) => {
    this.setState({
      width
    })
  }

  render() {
    const { app, scale, dataList, activeId, editType, width } = this.state
    const activeGraphics = [...this.state.dataList].find(a => a.id + '' === activeId)
    return (
        <div className="split_container">
            <div className="toolbar">
              <div>
                <button onClick={this.choose} className={editType === 'choose' ? 'active': ''}>选择</button>
                <button onClick={this.drawNormal} className={editType === 'rect' ? 'active': ''}>矩形</button>
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
          <div className="main">
            <div className="left">

              <div className="operate" id="app">
                {
                  app && activeGraphics &&
                  <Point app={app} data={{...activeGraphics}} scale={scale} onChange={this.handlePointChange}/>
                }

              </div>
            </div>

            <div className="data" style={{ width: `${width}px` }}>
              <DragLine width={width} onChange={this.handleWidthChange}/>
              <DataTree data={dataList} activeId={activeId} onChangeId={this.handleIdChange}/>
            </div>
          </div>
        </div>
    )
  }
}

export default App;
