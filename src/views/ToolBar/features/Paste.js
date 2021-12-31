import React, { PureComponent } from 'react'
import { Button, Input, message, Popover } from 'antd'
import * as PIXI from 'pixi.js'
import { hex2PixiColor, startChoose } from '../../utils/common'
import { changeActiveId, changeDataMap } from '@action'

class Paste extends PureComponent {

    state = {
        isShowPasteInput: false
    }

    paste = (e) => {
        const { isShowPasteInput } = this.state
        e.stopPropagation()
        const input = document.getElementById('pasteInput')
        if (isShowPasteInput) {
            if (input.value) {
                this.transferPaste(input.value)
            }
            this.setState({ isShowPasteInput: false })
        } else {
            if (navigator.clipboard) {
                navigator.clipboard.readText()
                    .then((text) => {
                        if (text) {
                            this.transferPaste(text)
                        } else {
                            message.error('剪切板为空')
                        }
                    })
                    .catch(e => {
                        message.info('未获取到剪切板权限，请手动粘贴到文本框中')
                        document.addEventListener('click', this.cancelPaste)
                        this.setState({
                            isShowPasteInput: true
                        })
                        if (input) {
                            input.focus()
                        }
                    })
            } else {
                message.info('未获取到剪切板权限，请手动粘贴到文本框中')
                document.addEventListener('click', this.cancelPaste)
                this.setState({
                    isShowPasteInput: true
                })
            }
        }
    }

    cancelPaste = (e) => {
        const input = document.getElementById('pasteInput')
        if (input !== e.target) {
            this.setState({ isShowPasteInput: false })
            document.removeEventListener('click', this.cancelPaste)
        }
    }

    transferPaste = (text) => {
        const { app } = window
        let res = {}
        try{
            // eslint-disable-next-line no-new-func
            res = new Function(`return ${text}`)()
        } catch (e) {
            try {
                res = JSON.parse(text)
            } catch (e) {
                message.error('转换失败')
                return
            }
        }
        try {
            changeActiveId('')
            changeDataMap(res)
            for (let i of window.app.stage.children.filter(a => a.name !== 'bc' && a.name !== 'point')) {
                window.app.stage.removeChild(i)
            }
            const texture = PIXI.Texture.from(res.bc.image)
            const image = new PIXI.Sprite(texture);
            image.name = 'bc'
            image.zIndex = -1
            image.setTransform(0, 0, res.bc.scale, res.bc.scale)
            window.app.stage.removeChild(...app.stage.children.filter(c => c.name === 'bc'))
            app.stage.addChild(image)
            this.transferPaste_pixi(res)
            startChoose()
            message.success('粘贴成功！')
            this.setState({
                isShowPasteInput: false
            })
        } catch (e) {
            message.error('转换失败')
        }
    }

    transferPaste_pixi = (obj) => {
        if (obj.children.length > 0) {
            for (let c of obj.children) {
                const textStyle = {
                    fontFamily: 'Arial',
                    fontSize: '14px',
                    fontStyle: 'italic',
                    fontWeight: 'bold',
                    fill: c.color,
                    stroke: '#000000',
                    strokeThickness: 2,
                    dropShadow: true,
                    dropShadowColor: '#000000',
                    dropShadowAngle: Math.PI / 6,
                    dropShadowDistance: 2,
                    wordWrap: true, //是否允许换行
                    wordWrapWidth: 440 //换行执行宽度
                }
                const graphics = new PIXI.Graphics()
                const color = hex2PixiColor(c.color)
                graphics.name = c.id
                graphics.lineStyle(4, color, 1)
                graphics.beginFill(color, 0.2)
                graphics.x = c.x
                graphics.y = c.y
                graphics.text = c.name
                graphics.drawRect(0, 0, c.width, c.height)
                graphics.endFill()
                let basicText = new PIXI.Text(graphics.text, textStyle)
                basicText.name = 'text'
                basicText.x = 0
                basicText.y = -24
                graphics.addChild(basicText)
                window.app.stage.addChild(graphics)
                this.transferPaste_pixi(c)
            }
        }
    }

    render() {
        const { isShowPasteInput } = this.state

        return (
            <Popover
                visible={isShowPasteInput}
                placement="bottomRight"
                arrowPointAtCenter={false}
                destroyTooltipOnHide
                content={<Input id="pasteInput" placeholder="粘贴..." autoFocus style={{ width: '240px' }} onPressEnter={(e) => this.transferPaste(e.target.value)}/>}>
                <Button className={`paste ${isShowPasteInput ? 'active' : ''}`} type="primary" onClick={this.paste}>
                    <img src="https://x0.ifengimg.com/ucms/2021_50/84364D5CBFFF49F0CA5599277E70616B715E99A8_size2_w48_h48.png" alt="paste"/>
                    {isShowPasteInput ? '确认' : '粘贴'}
                </Button>
            </Popover>
        )
    }
}

export default Paste
