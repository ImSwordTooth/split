import { defaultState } from './state'
import { getDataById } from '../views/utils/common'

function reducer (state = defaultState, action) {
    switch (action.type) {
        case 'change_mode': return { ...state, mode: action.mode }
        case 'change_scale': return { ...state, scale: action.scale }
        case 'change_dataMap': return { ...state, dataMap: action.dataMap }
        case 'change_editId': return { ...state, editId: action.editId }
        case 'change_parentId': return { ...state, parentId: action.parentId }
        case 'change_settingWidth': return { ...state, settingWidth: action.settingWidth }
        case 'change_name': return { ...state, name: action.name }
        case 'change_cname': return { ...state, cname: action.cname }
        case 'change_trackProjectId': return { ...state, trackProjectId: action.trackProjectId }
        case 'change_channel': return { ...state, channel: action.channel }

        case 'change_activeId': {
            const { app } = window
            const { activeId } = action
            if (activeId !== '' && activeId !== '0') {
                app.stage.children.filter(c => c.name !== 'bc' && c.name !== 'point').forEach(a => a.zIndex = 0)
                app.stage.children.find(c => c.name === action.activeId).zIndex = 999
            }
            return { ...state, activeId: action.activeId }
        }
        case 'delete_data': {
            const ids = action.id.split('_')
            const parentId = ids.length > 1 ? ids.slice(0, -1).join('_'): '0'
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
        case 'drag_data': {
            // 分别是【是否拖拽到目标内部】、【被拖拽的对象的key的列表】、【拖拽目标key】、【拖拽位置,不是top就是bottom】
            const { dropOver,originKey,targetKey,dropPosition } = action.obj
            const newDataMap = { ...state.dataMap };
            const originObj = getDataById(originKey[0], newDataMap);      //获取拖拽对象
            const originParentId = originObj.id.split('_').length > 1 ? originObj.id.split('_').slice(0, -1).join('_'): '0'
            const originParent = getDataById(originParentId, newDataMap) // 拖拽对象的父对象

            // 因为执行的类似于剪切操作，所以要把原对象删掉
            for (let j=0;j<originParent.children.length;j++){
                if (originParent.children[j].id === originKey[0]){
                    originParent.children.splice(j,1);
                    break;
                }
            }

            if (dropOver){
                //直接拖拽到目标上
                let target = getDataById(targetKey, newDataMap); //获取目标对象
                let will = target.id === '0' ? target.willCreateKey + '' : `${target.id}_${target.willCreateKey}`;

                const handleDrag = function(obj,key){
                    window.app.stage.children.find(a => a.name === obj.id).name = key
                    obj.id = key;
                    if (obj.children ){
                        for (let i=0;i<obj.children.length;i++){
                            const will = `${obj.id}_${obj.willCreateKey}`
                            obj.willCreateKey++
                            handleDrag(obj.children[i],will)
                        }
                    }
                };

                handleDrag(originObj ,will);
                target.children.push(originObj); // 然后直接push到末尾就行
                target.willCreateKey++; // 因为用过一次了，所以要获取新的willCreateKey
                return { ...state, activeId: originObj.id, dataMap: newDataMap };
            } else {
                //拖拽到线上，要添加到线的父对象里
                const targetParentId = targetKey.split('_').length > 1 ? targetKey.split('_').slice(0, -1).join('_'): '0'
                let targetParent = getDataById(targetParentId,newDataMap); // 获取拖拽目标的父元素，因为这算是父元素的新增

                let will = targetParent.id === '0' ? targetParent.willCreateKey + '' : `${targetParent.id}_${targetParent.willCreateKey}`;
                const handleDrag = function(obj,key){
                    window.app.stage.children.find(a => a.name === obj.id).name = key
                    obj.id = key;

                    if (obj.children){
                        for (let i=0;i<obj.children.length;i++){
                            const will = obj.id === '0' ? obj.willCreateKey + '' : `${obj.id}_${obj.willCreateKey}`;
                            obj.willCreateKey++
                            handleDrag(obj.children[i],will)
                        }
                    }
                };
                handleDrag(originObj,will);
                for (let i=0; i<targetParent.children.length; i++){
                    if (targetParent.children[i].id === targetKey){
                        if (dropPosition === 'top'){
                            targetParent.children.splice(i,0,originObj);
                            break;
                        } else {
                            targetParent.children.splice(i+1,0,originObj);
                            break;
                        }
                    }
                }
                targetParent.willCreateKey++;
                return {...state, activeId: originObj.id, dataMap: newDataMap};
            }
        }
        default: return state
    }
}

export default reducer;
