import React, { PureComponent } from 'react'
import { Form, Input } from 'antd'
import { StyledMainSetting } from './styles'

class MainSetting extends PureComponent {
    render() {
        return (
            <StyledMainSetting>
                <div>项目设置</div>
                <Form size="small">
                    <Form.Item label="项目名称">
                        <Input style={{ width: '140px' }}/>
                    </Form.Item>
                    <Form.Item label="项目中文名称">
                        <Input style={{ width: '140px' }}/>
                    </Form.Item>
                    <Form.Item label="频道">
                        <Input style={{ width: '140px' }}/>
                    </Form.Item>
                    <Form.Item label="埋点项目">
                        <span>未创建</span>
                    </Form.Item>
                </Form>
            </StyledMainSetting>
        )
    }
}

export default MainSetting
