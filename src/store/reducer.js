import { defaultState } from './state'
import {getDataById} from "../views/utils/common";

function reducer (state = defaultState, action) {
    switch (action.type) {
        case 'change_mode': return { ...state, mode: action.mode }
        case 'change_scale': return { ...state, scale: action.scale }
        case 'change_dataMap': return { ...state, dataMap: action.dataMap }
        case 'change_editId': return { ...state, editId: action.editId }

        case 'change_activeId': return { ...state, activeId: action.activeId }
        case 'delete_data': {
            const ids = action.id.split('_')
            const parentId = ids.length > 1 ? ids.slice(0, ids.length - 1).join('_'): '0'
            const newDataMap = {...state.dataMap}
            const parent = getDataById(parentId, newDataMap)
            for (let j=0;j<parent.children.length;j++){
                if (parent.children[j].id === action.id){
                    parent.children.splice(j,1);
                    break;
                }
            }
            return { ...state, dataMap: newDataMap, activeId: '', mode: 'choose' }
        }
        default: return state
    }
}

export default reducer;
