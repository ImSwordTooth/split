import React, { PureComponent } from 'react'
import { Tabs, Breadcrumb } from 'antd'
import { connect } from 'react-redux'
import Track from './Track'
import Chip from './Chip'
import Component from './Component'
import DragLine from '../../components/DragLine'
import Icon from '../../components/Icon'
import { changeActiveId } from '@action'
import { getDataById } from '../../utils/common'
import MainSetting from './MainSetting'
import { preComponentList } from './Component/PRE'
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
                    let iconName = ''
                    if (data.config && data.config.component) {
                        const { pc, mobile } = data.config.component.preComponent
                        if (pc.length + mobile.length > 1) {
                            iconName = 'div'
                        } else {
                            if (mobile.length > 0) {
                                iconName = preComponentList.mobile.find(a => a.name === mobile[0]).icon
                            }
                            if (pc.length > 0) {
                                iconName = preComponentList.pc.find(a => a.name === pc[0]).icon
                            }
                        }
                    }
                    path.push({
                        id: data.id,
                        icon: iconName || 'div',
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
        const { settingWidth, activeId, dataMap } = this.props
        const finalWidth = this.getWidth()
        const data = getDataById(activeId, dataMap)

        return (
            <StyledProperty style={{ width: finalWidth + 'px' }}>
                <DragLine width={finalWidth} min={300} max={Math.max(settingWidth * 0.4, settingWidth - 200)} onChange={this.handleWidthChange}/>
                <div className="propertyWp">
                    <div className="property">
                        {
                            (activeId && activeId !== '0')
                                ?
                                    <Tabs size="small" defaultActiveKey="1" style={{ height: '100%' }}>
                                        <TabPane
                                            tab={<div className="tabDiv">组件</div>}
                                            key="1">
                                            <Component/>
                                        </TabPane>
                                        <TabPane
                                            tab={<div className={`tabDiv ${data && data.config && data.config.track && data.config.track.trackId ? 'active' : ''}`}>埋点</div>}
                                            key="2">
                                            <Track />
                                        </TabPane>
                                        <TabPane
                                            tab={<div className="tabDiv">碎片</div>}
                                            key="3">
                                            <Chip/>
                                        </TabPane>
                                    </Tabs>
                                : <MainSetting/>
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
