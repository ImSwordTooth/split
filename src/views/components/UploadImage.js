import React, { PureComponent } from 'react'
import * as PIXI from 'pixi.js'
import { Tooltip } from 'antd'
import Icon from './Icon'

class UploadImage extends PureComponent {

    upload = () => {
        document.getElementById("uploadImage").click()
    }

    finishUpload = (e) => {
        const { app } = window
        const [ file ] = e.currentTarget.files
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload=function(ev){
            const texture = PIXI.Texture.from(ev.target.result)
            const image = new PIXI.Sprite(texture);
            image.name = 'bc'
            image.zIndex = -1
            // 只能出现一个背景图，所以要删掉上一个
            app.stage.removeChild(...app.stage.children.filter(c => c.name === 'bc'))
            app.stage.addChild(image)
        }
    }
    
    render() {
        return (
            <>
                <Tooltip title="上传新的背景图">
                    <button className="btn" onClick={this.upload}><Icon icon="addImage"/></button>
                </Tooltip>
                <input type="file" accept="image/*" id="uploadImage" hidden onChange={this.finishUpload}/>
            </>
        )
    }
}

export default UploadImage
