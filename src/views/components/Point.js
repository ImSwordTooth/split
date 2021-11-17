import { PureComponent } from 'react'
import * as PIXI from 'pixi.js'
import {connect} from "react-redux";
import {getDataById} from "../utils/common";
import {changeDataMap} from "../../store/action";

class Point extends PureComponent {
    state = {
        pointGraphics: []
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.activeId !== this.props.activeId || prevProps.dataMap !== this.props.dataMap) {
            this.update()
        }
    }

    componentWillUnmount() {
        const { app } = window
        const { pointGraphics } = this.state
        pointGraphics.forEach(p => app.stage.removeChild(p))
    }

    handlePoint = (e, point, i) => {
        const { app } = window
        const { activeId, scale, dataMap } = this.props
        const graphics = app.stage.children.find(c => c.name === activeId)
        const data = getDataById(activeId, dataMap)
        const points = this.getPoints()
        let { x: startX, y: startY } = {...e.data.global}

        point.on('pointermove', (e) => {
            const { x: endX, y: endY } = {...e.data.global}
            const deltaX = endX - startX
            const deltaY = endY - startY

            // 新的点和对角点
            const newPoint = { x: points[i].x + deltaX / scale, y: points[i].y + deltaY / scale }
            const oppsitPoint = points[(i + 2) % 4]

            // 两点确认矩形的宽高
            const newWidth = Math.abs(newPoint.x - oppsitPoint.x)
            const newHeight = Math.abs(newPoint.y - oppsitPoint.y)

            let newX, newY
            // 四个点里面，最小值的坐标为矩形的左上角，即矩形的 x、y
            const minX = Math.min(points[i].x, points[(i+1)%4].x, points[(i+2)%4].x, points[(i+3)%4].x)
            const maxX = Math.max(points[i].x, points[(i+1)%4].x, points[(i+2)%4].x, points[(i+3)%4].x)
            const minY = Math.min(points[i].y, points[(i+1)%4].y, points[(i+2)%4].y, points[(i+3)%4].y)
            const maxY = Math.max(points[i].y, points[(i+1)%4].y, points[(i+2)%4].y, points[(i+3)%4].y)

            newX = Math.min(newPoint.x, points[(i+1)%4].x, points[(i+2)%4].x, points[(i+3)%4].x)
            newY = Math.min(newPoint.y, points[(i+1)%4].y, points[(i+2)%4].y, points[(i+3)%4].y)

            if (points[i].x === minX) {
                if (newPoint.x > maxX) {
                    newX = maxX
                } else {
                    newX = newPoint.x
                }
            }

            if (points[i].y === minY) {
                if (newPoint.y > maxY) {
                    newY = maxY
                } else {
                    newY = newPoint.y
                }
            }

            data.x = newX
            data.y = newY
            data.width = newWidth
            data.height = newHeight

            changeDataMap(dataMap)

            graphics.clear()
            graphics.x = newX
            graphics.y = newY
            graphics.lineStyle(2, 0x1099bb, 1)
            graphics.beginFill(0x1099bb, 0.1)
            graphics.drawRect(
                0,
                0,
                newWidth,
                newHeight
            )
        })

        point.on('pointerup', () => {
            point
                .off('pointermove')
                .off('pointerup')
                .off('pointerupoutside')
        })
        point.on('pointerupoutside', () => {
            point
                .off('pointermove')
                .off('pointerup')
                .off('pointerupoutside')
        })
    }

    update = () => {
        const { app } = window
        const { pointGraphics } = this.state
        const points = this.getPoints()

        // 有坐标
        if (points.length > 0) {
            let arr = []

            for (let i=0; i<points.length; i++) {
                let point = pointGraphics[i]
                if (!point) {
                    point = new PIXI.Graphics()
                    point.interactive = true
                    point.name = `point`
                    app.stage.addChild(point)
                    arr.push(point)
                    point.on('pointerdown', (e) => this.handlePoint(e, point, i))
                }
                point.x = points[i].x
                point.y = points[i].y
                point.clear()
                point.lineStyle(1, 0x3e3c3d, 1)
                point.beginFill( 0xf8f8f8, 1)
                point.drawCircle(0, 0, 5)
                point.endFill()
                point.zIndex = 9999
            }
            if (arr.length > 0) {
                this.setState({
                    pointGraphics: arr
                })
            }
        } else {
            /**
             * 无坐标，说明图形被删除了或者是初始化
             * 初始化不用管
             */
            if (pointGraphics[0]) {
                for (let i=0; i<4; i++) {
                    pointGraphics[i].clear()
                }
            }
        }
    }

    getPoints = () => {
        const { activeId, dataMap } = this.props
        const data = getDataById(activeId, dataMap)
        if (data) {
            const { x, y, width, height } = data
            return [
                { x, y },
                { x: x + width, y },
                { x: x + width, y: y + height },
                { x, y: y + height }
            ]
        } else {
            return []
        }
    }

    render() {
        return null
    }
}


function mapStateToProps(state) {
    const { scale, activeId,  dataMap } = state;
    return { scale, activeId, dataMap: {...dataMap} }
}

export default connect(mapStateToProps)(Point)
