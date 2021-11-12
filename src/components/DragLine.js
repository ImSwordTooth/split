import React, {PureComponent} from "react";
import "./DragLine.scss"

class DragLine extends PureComponent {

    startMove = (e) => {
        const { onChange }= this.props
        let { clientX: startX } = e
        const handleMove = (e) => {
            const { width } = this.props
            const { clientX: endX } = e
            onChange(width - endX + startX)
            startX = endX
        }

        const cancelMove = () => {
            document.removeEventListener('mousemove', handleMove, false)
            document.removeEventListener('mouseup', handleMove, false)
        }

        document.addEventListener('mousemove', handleMove, false)
        document.addEventListener('mouseup', cancelMove, false)
    }

    render() {
        return (
            <div className="dragline" onMouseDown={this.startMove}/>
        )
    }
}

export default DragLine
