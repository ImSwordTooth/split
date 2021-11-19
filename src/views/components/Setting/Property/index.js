import React, {PureComponent} from 'react'
import DragLine from "../../DragLine";
import { StyledProperty } from './styles'
import { Tabs } from 'antd'
import Maidian from "./Maidian";
import { connect } from 'react-redux'

const { TabPane } = Tabs

class Setting extends PureComponent {
    state = {
        widthPercent: 0.6,
    }

    handleWidthChange = (width) => {
        const { settingWidth } = this.props

        const percent = width / settingWidth
        this.setState({
            widthPercent: percent
        })
    }

    getWidth = () => {
        const { widthPercent } = this.state
        const { settingWidth } = this.props

        let width = settingWidth * widthPercent
        return width > 300 ? width : 300
    }

    render() {
        const { settingWidth } = this.props
        const finalWidth = this.getWidth()

        return (
            <StyledProperty width={finalWidth}>
                <DragLine width={finalWidth} min={300} max={Math.max(settingWidth * 0.4, settingWidth - 200)} onChange={this.handleWidthChange}/>
                <div style={{ padding: '0 10px 0' }}>
                    <Tabs size="small">
                        <TabPane
                            tab={<div className="tabDiv">组件</div>}
                            key="1">
                            props
                        </TabPane>
                        <TabPane
                            tab={<div className="tabDiv active">埋点</div>}
                            key="2">
                            <Maidian/>
                        </TabPane>
                    </Tabs>
                </div>

            </StyledProperty>
        )
    }
}

function mapStateToProps(state) {
    const { settingWidth } = state;
    return { settingWidth }
}

export default connect(mapStateToProps)(Setting)
