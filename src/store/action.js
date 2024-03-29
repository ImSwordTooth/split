import store from './index'

export const changeEnv = env => store.dispatch({ type:'change_env', env })
export const changeMode = mode => store.dispatch({ type:'change_mode', mode })
export const changeScale = scale => store.dispatch({ type:'change_scale', scale })
export const changeActiveId = activeId => store.dispatch({ type:'change_activeId', activeId })
export const changeEditId = editId => store.dispatch({ type: 'change_editId', editId })
export const changeParentId = parentId => store.dispatch({ type: 'change_parentId', parentId })
export const changeSettingWidth = settingWidth => store.dispatch({ type: 'change_settingWidth', settingWidth })
export const changeTrackProjectId = trackProjectId => store.dispatch({ type: 'change_trackProjectId', trackProjectId })
export const changeIsFreeze = isFreeze => store.dispatch({ type: 'change_isFreeze', isFreeze })
export const changeExtraSetting = extraSetting => store.dispatch({ type: 'change_extraSetting', extraSetting })

export const changeDataMap = dataMap => store.dispatch({ type:'change_dataMap', dataMap })
export const deleteData = id => store.dispatch({ type: 'delete_data', id })
export const dragData = obj => store.dispatch({ type: 'drag_data', obj })

