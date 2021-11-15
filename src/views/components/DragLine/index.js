import React, { PureComponent } from "react";
import { StyledDragLine } from './styles'

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
            <StyledDragLine onMouseDown={this.startMove}/>
        )
    }
}

export default DragLine
