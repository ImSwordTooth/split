import React, {PureComponent} from 'react'
import { connect } from 'react-redux'
import {Button, Modal, Result, Tabs} from 'antd'
import Icon from '../../../components/Icon'
import FinishBySave from './FinishBySave'
import { getChipArrayFromDataMap } from '../../../utils/common'
import { StyledFinish, StyledFinishModal } from './styles'

const { TabPane } = Tabs

const OK_TEXT = [
    '保存',
    '创建',
    '下载'
]

class Finish extends PureComponent {

    state = {
        isShowModal: false,
        isShowBC: false,
        isLeave: false, // 是否离开 button 时 border 的动画
        tabIndex: '0', // Tabs 的 index
        isShowResult: false // 是否展示生成结果的 modal
    }

    eye = React.createRef()

    toggleIsShowModal = () => this.setState({ isShowModal: !this.state.isShowModal })
    toggleIsShowBC = () => this.setState({ isShowBC: !this.state.isShowBC })
    toggleIsShowResult = () => this.setState({ isShowResult: !this.state.isShowResult })

    trueLeave = () => this.setState({ isLeave: true })
    falseLeave = () => this.setState({ isLeave: false })

    changeTabIndex = (index) => this.setState({ tabIndex: index })

    finish = () => {
        const { dataMap } = this.props
        console.log(dataMap)
        window.opener.postMessage({
            type: 'finish',
            data: {
                dataMap,
                chipData: getChipArrayFromDataMap()
            }
        }, '*')
        // this.toggleIsShowModal()
        // this.toggleIsShowResult()
    }

    render() {
        const { env } = this.props
        const { isShowModal, isShowBC, isLeave, tabIndex, isShowResult } = this.state

        return (
            <StyledFinish>
                <Button className="finish" shape="round" type="primary" onClick={this.toggleIsShowModal} onMouseEnter={this.falseLeave} onMouseLeave={this.trueLeave}>
                    <div className="icon">
                        <Icon icon="finish" style={{ fontSize: '20px' }} className={`rotate ${isLeave ? 'leave' : ''}`} />
                        <Icon icon="ok" className="ok" />
                    </div>
                    生成为...
                </Button>
                <Modal
                    title={
                        <div style={{ position: 'relative' }}>
                            <span>生成为...</span>
                            <Button type="link" ref={this.eye} style={{ position: 'absolute', top: 0, right: '40px', padding: 0, height: '22px', display: 'flex' }} onMouseEnter={this.toggleIsShowBC} onMouseLeave={this.toggleIsShowBC}>
                                <Icon icon="eye" style={{ height: '22px', marginRight: '4px' }}/>
                            </Button>
                        </div>
                    }
                    className={isShowBC ? 'opacity' : ''}
                    visible={isShowModal}
                    width={1000}
                    okText={OK_TEXT[tabIndex]}
                    cancelText="取消"
                    onOk={this.finish}
                    onCancel={this.toggleIsShowModal}>
                    <StyledFinishModal>
                        <Tabs tabPosition="left" activeKey={tabIndex} size="small" onChange={this.changeTabIndex}>
                            <TabPane
                                tab={
                                    <div className="tabTitle">
                                        <span>保存到原项目</span>
                                        <div className="subTitle">保存。。。</div>
                                    </div>
                                }
                                key={0}>
                                <FinishBySave/>
                            </TabPane>
                            <TabPane
                                tab={
                                    <div className="tabTitle">
                                        <span>个性化React</span>
                                        <div className="subTitle">创建一个项目</div>
                                    </div>
                                }
                                disabled={env.indexOf('custom') === 0}
                                key={1}>
                                1
                            </TabPane>
                            <TabPane
                                tab={
                                    <div className="tabTitle">
                                        <span>仅下载</span>
                                        <div className="subTitle">下载为zip</div>
                                    </div>
                                }
                                key={2}>
                                2
                            </TabPane>
                        </Tabs>
                    </StyledFinishModal>
                </Modal>
                <Modal
                    visible={isShowResult}
                    width={500}
                    closable={false}
                    footer={null}>
                    <Result
                        status="success"
                        title="成功"
                        subTitle="123"
                        onCancel={this.toggleIsShowResult}
                        extra={[
                            <Button>好的</Button>
                        ]}
                    />
                </Modal>
            </StyledFinish>
        )
    }
}

function mapStateToProps(state) {
    const { env, dataMap } = state;
    return { env, dataMap }
}

export default connect(mapStateToProps)(Finish)
