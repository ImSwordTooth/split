import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import * as PIXI from 'pixi.js'

class UploadImage extends PureComponent {

    static propTypes = {
        app: PropTypes.object
    }

    upload = () => {
        document.getElementById("uploadImage").click()
    }

    finishUpload = (e) => {
        const { app } = this.props
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
                <button onClick={this.upload}>上传图片</button>
                <input type="file" accept="image/*" id="uploadImage" hidden onChange={this.finishUpload}/>
            </>
        )
    }
}

export default UploadImage
