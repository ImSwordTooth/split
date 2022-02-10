import React, { PureComponent } from 'react'
import { Button, Input, message, Popover } from 'antd'
import { transferPaste } from '../../utils/common'

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
                transferPaste(input.value)
            }
            this.setState({ isShowPasteInput: false })
        } else {
            if (navigator.clipboard) {
                navigator.clipboard.readText()
                    .then((text) => {
                        if (text) {
                            transferPaste(text)
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

    handlePressEnter = (e) => {
        transferPaste(e.target.value)
        this.setState({ isShowPasteInput: false })
    }

    render() {
        const { isShowPasteInput } = this.state

        return (
            <Popover
                visible={isShowPasteInput}
                placement="bottomRight"
                arrowPointAtCenter={false}
                destroyTooltipOnHide
                content={<Input id="pasteInput" placeholder="粘贴..." autoFocus style={{ width: '240px' }} onPressEnter={this.handlePressEnter}/>}>
                <Button className={`paste ${isShowPasteInput ? 'active' : ''}`} type="primary" onClick={this.paste}>
                    <img src="https://x0.ifengimg.com/ucms/2021_50/84364D5CBFFF49F0CA5599277E70616B715E99A8_size2_w48_h48.png" alt="paste"/>
                    {isShowPasteInput ? '确认' : '粘贴'}
                </Button>
            </Popover>
        )
    }
}

export default Paste
