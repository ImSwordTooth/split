import React, { PureComponent } from 'react'
import { Select } from 'antd'
import { connect } from 'react-redux'
import { resize } from '../../utils/common'

const { Option } = Select
const SCALE_LIST = [ 0.1, 0.25, 0.5, 1, 1.5, 2, 4 ] // 缩放值列表，放在 Select 里快速选择

class Resize extends PureComponent {

    selectRef = React.createRef()

    resizeTo = e => {
        resize(null, e.value)
    }

    selectBlur = () => {
        this.selectRef.current.blur()
    }

    clickToScale = (e) => {
        const { scaletype } = e.currentTarget.dataset
        const { scale } = this.props
        if (scaletype === '-') {
            const index = SCALE_LIST.findIndex(s => s >= scale)

            if (index > 0) {
                resize(null, SCALE_LIST[index - 1])
            }
        } else {
            const index = SCALE_LIST.findIndex(s => s > scale)
            if (index < SCALE_LIST.length) {
                resize(null, SCALE_LIST[index])
            }
        }
    }

    render() {
        const { scale } = this.props
        return (
            <div className="resize">
                <button data-scaletype="-" className="btn" style={{ margin: '0 2px' }} onClick={this.clickToScale}>-</button>
                <Select
                    ref={this.selectRef}
                    value={{ value: scale, label: parseInt(scale * 100) + '%' }}
                    labelInValue
                    showArrow={false}
                    onChange={this.resizeTo}
                    onSelect={this.selectBlur}
                    dropdownStyle={{ textAlign: 'center' }}
                    style={{ width: 70, textAlign: 'center' }}
                >
                    {
                        SCALE_LIST.map((scale, index) => {
                            return <Option value={scale} key={index}>{scale * 100 + '%'}</Option>
                        })
                    }
                </Select>
                <button data-scaletype="+" className="btn" style={{ margin: '0 2px' }}  onClick={this.clickToScale}>+</button>
            </div>
        )
    }
}

function mapStateToProps(state) {
    const { scale } = state;
    return { scale }
}

export default connect(mapStateToProps)(Resize)
