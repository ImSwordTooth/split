import { defaultState } from './state'

function reducer (state = defaultState, action) {
    switch (action.type) {
        case 'change_mode': return { ...state, mode: action.mode }
        case 'change_scale': return { ...state, scale: action.scale }
        case 'change_dataList': return { ...state, dataList: action.dataList }
        case 'change_activeId': return { ...state, activeId: action.activeId }
        default: return state
    }
}

export default reducer;
