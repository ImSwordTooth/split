import React, {PureComponent} from 'react'
import { connect } from 'react-redux'
import { Button, Modal, Tabs } from 'antd'
import Icon from '../../../components/Icon'
import { StyledFinish, StyledFinishModal } from './styles'

const { TabPane } = Tabs

class Finish extends PureComponent {

    state = {
        isShowModal: false,
        isShowBC: false,
        isLeave: false // 是否离开 button 时 border 的动画
    }

    eye = React.createRef()

    toggleIsShowModal = () => this.setState({ isShowModal: !this.state.isShowModal })
    toggleIsShowBC = () => this.setState({ isShowBC: !this.state.isShowBC })

    trueLeave = () => this.setState({ isLeave: true })
    falseLeave = () => this.setState({ isLeave: false })

    render() {
        const { env } = this.props
        const { isShowModal, isShowBC, isLeave } = this.state

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
                                瞄一眼
                            </Button>
                        </div>
                    }
                    style={{ opacity: isShowBC ? 0.1 : 1, transition: 'opacity .3s' }}
                    visible={isShowModal}
                    width={1000}
                    onCancel={this.toggleIsShowModal}>
                    <StyledFinishModal>
                        <Tabs tabPosition="left" defaultActiveKey="0" size="small" style={{ willChange: 'transform' }}>
                            <TabPane
                                tab={
                                    <div className="tabTitle">
                                        <span>保存到原项目</span>
                                        <div className="subTitle">保存。。。</div>
                                    </div>
                                }
                                style={{ willChange: 'transform' }}
                                key={0}>
                                0
                            </TabPane>
                            <TabPane
                                tab={
                                    <div className="tabTitle">
                                        <span>个性化React</span>
                                        <div className="subTitle">创建一个项目</div>
                                    </div>
                                }
                                disabled={env === 'custom'}
                                style={{ willChange: 'transform' }}
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
                                style={{ willChange: 'transform' }}
                                key={2}>
                                2
                            </TabPane>
                        </Tabs>
                    </StyledFinishModal>

                </Modal>
            </StyledFinish>
        )
    }
}

function mapStateToProps(state) {
    const { env } = state;
    return { env }
}

export default connect(mapStateToProps)(Finish)
