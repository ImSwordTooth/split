import store from './index'

export const changeMode = mode => store.dispatch({ type:'change_mode', mode })
export const changeScale = scale => store.dispatch({ type:'change_scale', scale })
export const changeDataList = dataList => store.dispatch({ type:'change_dataList', dataList })
export const changeActiveId = activeId => store.dispatch({ type:'change_activeId', activeId })

