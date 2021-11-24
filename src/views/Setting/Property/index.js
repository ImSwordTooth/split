import React, { PureComponent } from 'react'
import { Tabs, Breadcrumb } from 'antd'
import { connect } from 'react-redux'
import Maidian from './Maidian'
import DragLine from '../../components/DragLine'
import Icon from '../../components/Icon'
import { changeActiveId } from '../../../store/action'
import { getDataById } from '../../utils/common'
import { StyledProperty } from './styles'

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

    getPath = ()=>{
        const { activeId, dataMap } = this.props
        let path = [];
        if (activeId !== '' && activeId !== '0') {
            let selectedKeyArr = activeId.split('_');
            for (let i=0; i<selectedKeyArr.length; i++){
                let data = getDataById(selectedKeyArr.slice(0,i+1).join('_'), dataMap);
                if (data) {
                    path.push({
                        id: data.id,
                        icon: 'div',
                        name: data.name
                    })
                }
            }
        }
        return (
            <Breadcrumb separator={'>'}>
                <Breadcrumb.Item onClick={() => changeActiveId('0')}>
                    <Icon icon="all" />
                    总容器
                </Breadcrumb.Item>
                {
                    path.map((item,index)=>{
                        return (
                            <Breadcrumb.Item key={index} onClick={() => changeActiveId(item.id)}>
                                <Icon icon={item.icon} />
                                {item.name}
                            </Breadcrumb.Item>
                        )
                    })
                }
            </Breadcrumb>
        )
    }

    render() {
        const { settingWidth, activeId } = this.props
        const finalWidth = this.getWidth()

        return (
            <StyledProperty width={finalWidth}>
                <DragLine width={finalWidth} min={300} max={Math.max(settingWidth * 0.4, settingWidth - 200)} onChange={this.handleWidthChange}/>
                <div className="main" >
                    <div>
                        {
                            activeId && activeId !=='0' &&
                            <Tabs size="small" defaultActiveKey="2">
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
                        }
                    </div>
                    <div className="breadcrumb">{this.getPath()}</div>
                </div>
            </StyledProperty>
        )
    }
}

function mapStateToProps(state) {
    const { activeId, settingWidth, dataMap } = state;
    return { activeId, settingWidth, dataMap }
}

export default connect(mapStateToProps)(Setting)
