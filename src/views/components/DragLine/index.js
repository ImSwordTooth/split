import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { StyledDragLine } from './styles'

class DragLine extends PureComponent {

    static propTypes = {
        width: PropTypes.number,
        onChange: PropTypes.func,
        isTop: PropTypes.bool,
        max: PropTypes.number,
        min: PropTypes.number
    }

    static defaultProps = {
        isTop: false,
        max: Number.MAX_VALUE,
        min: -1
    }

    startMove = (e) => {
        const { onChange, max, min }= this.props
        let { clientX: startX } = e
        const handleMove = (e) => {
            e.preventDefault()
            const { width } = this.props
            const { clientX: endX } = e
            const finalWidth = width - endX + startX
            if (finalWidth <= max && finalWidth >= min) {
                onChange(width - endX + startX)
                startX = endX
            }
        }

        const cancelMove = () => {
            document.removeEventListener('mousemove', handleMove, false)
            document.removeEventListener('mouseup', handleMove, false)
        }

        document.addEventListener('mousemove', handleMove, false)
        document.addEventListener('mouseup', cancelMove, false)
    }

    render() {
        const { isTop } = this.props
        return (
            <StyledDragLine isTop={isTop} onMouseDown={this.startMove}/>
        )
    }
}

export default DragLine
