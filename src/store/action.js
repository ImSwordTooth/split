import store from './index'

export const changeMode = mode => store.dispatch({ type:'change_mode', mode })
export const changeScale = scale => store.dispatch({ type:'change_scale', scale })
export const changeActiveId = activeId => store.dispatch({ type:'change_activeId', activeId })
export const changeDataMap = dataMap => store.dispatch({ type:'change_dataMap', dataMap })

export const deleteData = id => store.dispatch({ type: 'delete_data', id })

