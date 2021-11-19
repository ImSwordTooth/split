import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import DragLine from "../DragLine";
import DataTree from "./DataTree/index";
import Property from "./Property";
import {changeSettingWidth} from "../../../store/action";

class EditPart extends PureComponent {
    state = {
        width: 500,
    }

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
