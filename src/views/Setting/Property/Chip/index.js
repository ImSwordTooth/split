import React, { PureComponent } from 'react'
import { Form, Radio, Select } from 'antd'
import ChipParams from './ChipParams'

const { Option } = Select

class Chip extends PureComponent {
    render() {
        return (
            <div>
                <Form size="small">
                    <Form.Item
                        label="请求方式"
                        name="type"
                    >
                        <Radio.Group>
                            <Radio value="v3">v3</Radio>
                            <Radio value="v4">v4</Radio>
                        </Radio.Group>
                    </Form.Item>

                    <Form.Item label="碎片类型" name="parameterType">
                        <Select style={{ width: '120px' }}>
                            <Option value="static">静态碎片</Option>
                            <Option value="recommend">推荐位碎片</Option>
                            <Option value="struct">结构化碎片</Option>
                        </Select>
                    </Form.Item>

                    <ChipParams type="recommend"/>
                </Form>
            </div>
        )
    }
}

export default Chip
