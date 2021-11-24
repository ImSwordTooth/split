import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import DataTree from './DataTree'
import Property from './Property'
import DragLine from '../components/DragLine'
import { changeSettingWidth } from '../../store/action'

class EditPart extends PureComponent {
    render() {
        const { settingWidth } = this.props
        return (
            <div style={{ width: `${settingWidth}px`, display: 'flex', height: '100%' }}>
                <DragLine isTop={true} width={settingWidth} min={300} onChange={changeSettingWidth}/>
                <DataTree/>
                <Property/>
            </div>
        )
    }
}

function mapStateToProps(state) {
    const { settingWidth } = state;
    return { settingWidth }
}

export default connect(mapStateToProps)(EditPart)
