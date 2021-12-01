import React, { PureComponent } from 'react'
import Proptypes from 'prop-types'
import { Divider, Form, Input, InputNumber } from 'antd'

const TYPE_MAP = {
    recommend: '推荐位碎片'
}

class ChipParams extends PureComponent {

    static propTypes = {
        type: Proptypes.string
    }

    GetFormItemsByType = () => {
        const { type } = this.props
        switch (type) {
            case 'recommend': {
                return (
                    <div style={{ paddingLeft: '20px' }}>
                        <Form.Item label="碎片id" name="id">
                            <Input style={{ width: '120px' }}/>
                        </Form.Item>
                        <Form.Item label="offset" name="offset">
                            <InputNumber/>
                        </Form.Item>
                        <Form.Item label="pageSize" name="pagesize">
                            <InputNumber/>
                        </Form.Item>
                    </div>
                )
            }
            default: return
        }
    }

    render() {
        const { type } = this.props

        return (
            <div>
                <Divider orientation="left" style={{ fontSize: '12px' }} plain>碎片参数{type ? ` - ${TYPE_MAP[type]}` : ''}</Divider>
                {this.GetFormItemsByType()}
            </div>
        )
    }
}

export default ChipParams
