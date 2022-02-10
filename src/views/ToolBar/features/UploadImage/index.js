import React, { PureComponent } from 'react'
import * as PIXI from 'pixi.js'
import { message, Tooltip } from 'antd'
import axios from 'axios'
import { connect } from 'react-redux'
import Icon from '../../../components/Icon'
import { changeDataMap } from '@action'
import { StyledUploadImage } from './styles'

class UploadImage extends PureComponent {

    upload = () => {
        document.getElementById("uploadImage").click()
    }

    finishUpload = (e) => {
        const { app } = window
        const [ file ] = e.currentTarget.files
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload= (ev) => {
            const texture = PIXI.Texture.from(ev.target.result)
            const image = new PIXI.Sprite(texture);
            image.name = 'bc'
            image.zIndex = -1
            // 只能出现一个背景图，所以要删掉上一个
            app.stage.removeChild(...app.stage.children.filter(c => c.name === 'bc'))
            app.stage.addChild(image)
            axios.post(`https://test0.ucms.ifeng.com/api/resource/upload`, {
                body: {
                    data: ev.target.result,
                    needWaterMark: false,
                    position: '',
                    waterMarkUrl: ''
                }
            }).then(res => {
                if (res.data.code === 0) {
                    const { dataMap } = this.props
                    const newDataMap = {...dataMap}
                    newDataMap.bc.image = res.data.data.url
                    changeDataMap(newDataMap)
                    message.success('上传成功')
                } else {
                    message.error('上传失败')
                }
            })
        }
    }

    render() {
        const { dataMap: { bc: { image } } } = this.props
        return (
            <StyledUploadImage>
                <Tooltip title="上传新的背景图">
                    <button className={`btn ${!image ? 'empty' : ''}`} onClick={this.upload}><Icon icon="addImage"/></button>
                </Tooltip>
                <input type="file" accept="image/*" id="uploadImage" hidden onChange={this.finishUpload}/>
            </StyledUploadImage>
        )
    }
}

function mapStateToProps(state) {
    const { dataMap } = state;
    return { dataMap }
}

export default connect(mapStateToProps)(UploadImage)
