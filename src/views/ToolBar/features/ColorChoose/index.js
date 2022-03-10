import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { Popover } from 'antd'
import { StyledColorChoose } from './styles'

class ColorChoose extends PureComponent {

    static propTypes = {
        colorType: PropTypes.string, // 随机颜色范围
        colorLightness: PropTypes.string, // 颜色亮度
        onChange: PropTypes.func // 修改颜色的回调函数
    }

    state = {
        randomColorType: ''
    }

    getColorTypeText = (type) => {
        switch (type) {
            case 'hue': {
                return (
                    <div style={{ margin: '0 2px' }}>
                        <span style={{color: '#a31131'}}>系</span>
                        <span style={{color: '#d81316'}}>列</span>
                        <span style={{color: '#ef758b'}}>颜</span>
                        <span style={{color: '#f9bdcb'}}>色</span>
                    </div>
                )
            }
            default: return <div style={{ margin: '0 2px', backgroundImage: `url('https://x0.ifengimg.com/ucms/2022_07/16E4BA1EA98E030BBCB4ACC21679A66C83E60C7C_size583_w800_h450.gif')`, WebkitBackgroundClip: 'text', color: 'transparent' }}>完全随机</div>
        }
    }

    getColorLightnessText = (type) => {
        switch (type) {
            case 'light': return <div style={{ color: 'silver', textShadow: '1px 1px 5px #cbcbcb', margin: '0 2px' }}>亮色</div>
            case 'dark': return <div style={{ fontWeight: 'bold', margin: '0 2px' }}>暗色</div>
            default: return null
        }
    }

    handleChange = (e) => {
        const { onChange } = this.props
        const { type, value } = e.currentTarget.dataset
        onChange(type, value)
    }

    render() {
        const { colorType, colorLightness } = this.props

        return (
            <Popover
                trigger="click"
                placement={"bottomRight"}
                content={
                    <StyledColorChoose>
                        <div>
                            <div className="groupTitle">随机颜色范围：</div>
                            <div className="chooses">
                                <div data-type="colorType" data-value="hue" className={`chooseItem ${colorType === 'hue' ? 'active' : ''}`} onClick={this.handleChange}>{this.getColorTypeText('hue')}</div>
                                <div data-type="colorType" data-value="" className={`chooseItem ${colorType === '' ? 'active' : ''}`} onClick={this.handleChange}>{this.getColorTypeText('')}</div>
                            </div>
                        </div>
                        <div>
                            <div className="groupTitle">色度：</div>

                            <div className="chooses">
                                <div data-type="colorLightness" data-value="" className={`chooseItem ${colorLightness === '' ? 'active' : ''}`} onClick={this.handleChange}><div>随机</div></div>
                                <div data-type="colorLightness" data-value="light" className={`chooseItem ${colorLightness === 'light' ? 'active' : ''}`} onClick={this.handleChange}>{this.getColorLightnessText('light')}</div>
                                <div data-type="colorLightness" data-value="dark" className={`chooseItem ${colorLightness === 'dark' ? 'active' : ''}`} onClick={this.handleChange}>{this.getColorLightnessText('dark')}</div>
                            </div>
                        </div>
                    </StyledColorChoose>
                }
            >
                <div className="colorType">
                    {this.getColorTypeText(colorType)}
                    {this.getColorLightnessText(colorLightness)}
                </div>
            </Popover>
        )
    }
}

export default ColorChoose
