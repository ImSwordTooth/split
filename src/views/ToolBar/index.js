import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { Button, message, Tooltip } from 'antd'
import UploadImage from './features/UploadImage'
import Paste from './features/Paste'
import Parent from './features/Parent'
import Resize from './features/Resize'
import Help from './features/Help'
import Create from './features/Create'
import ColorChoose from './features/ColorChoose'
import Finish from "./features/Finish/index"
import Icon from '../components/Icon'
import LabelInput from '../components/LabelInput'
import { changeDataMap } from '@action'
import { copyText, startChoose } from '../utils/common'
import { StyledToolbar } from './styles'

class ToolBar extends PureComponent {

    state = {
        colorType: 'hue', // 随机颜色范围 '' || 'hue'
        colorLightness: '' // 颜色亮度 '' || 'light' || 'dark'
    }

    print = () => {
        const { dataMap } = this.props
        copyText(JSON.stringify(dataMap))
        console.log('dataMap：', dataMap)
        message.success('已复制到控制台和剪切板')
    }

    finishReName = (type, value) => {
        const { dataMap } = this.props
        const newDataMap = {...dataMap}
        if (type === 'en') {
            newDataMap.name = value
        }
        if (type === 'cn') {
            newDataMap.cname = value
        }
        changeDataMap(newDataMap)
    }

    handleColorChange = (prop, value) => {
        this.setState({
            [prop]: value
        })
    }

    render() {
        const { env, mode, dataMap } = this.props
        const { colorType, colorLightness } = this.state
        const { name, cname } = dataMap
        return (
            <StyledToolbar>
                {/*左侧*/}
                <div className="flex">
                    {/*选择模式*/}
                    <Tooltip title="选择 (Esc)">
                        <button onClick={startChoose} className={`btn ${mode === 'choose' ? 'active': ''}`}>
                            <Icon icon="choose"/>
                        </button>
                    </Tooltip>
                    {/*创建矩形*/}
                    <Create colorType={colorType} colorLightness={colorLightness} />
                    {/*颜色选择*/}
                    <ColorChoose colorType={colorType} colorLightness={colorLightness} onChange={this.handleColorChange} />
                </div>
                {/*中间，为保持视觉居中，需要absolute*/}
                <div className="centerPart">
                    <div className="fileNameWp">
                        <LabelInput style={{fontSize: '16px', fontWeight: 'bold' }} inputStyle={{ width: '160px', fontWeight: 'bold' }} onChange={(value) => this.finishReName('en', value)}>
                            {name}
                        </LabelInput>
                        <span>-</span>
                        <LabelInput readOnly={env.indexOf('custom') === 0} style={{fontSize: '12px' }} inputStyle={{ width: '160px', fontSize: '12px' }} onChange={(value) => this.finishReName('cn', value)}>
                            {cname}
                        </LabelInput>
                    </div>
                </div>
                {/*右侧*/}
                <div className="flex">
                    <UploadImage />
                    <Parent />
                    <Help />
                    <Resize />
                    <Button type="primary" onClick={this.print} style={{ marginLeft: '20px' }}>数据</Button>
                    <Paste />
                    <Finish />
                </div>
            </StyledToolbar>
        )
    }
}

function mapStateToProps(state) {
    const { env, mode, dataMap } = state;
    return { env, mode, dataMap }
}

export default connect(mapStateToProps)(ToolBar)
