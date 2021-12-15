export const defaultState = {
    mode: 'choose', // 模式，choose：选择模式，rect：创建矩形模式
    name: 'newProject', // 项目名称
    cname: '新建项目', // 项目名称-中文
    trackProjectId: '', // 埋点系统中项目的id，首次创建埋点的时候会先创建一个埋点项目
    scale: 1, // 画布缩放
    dataMap: {  // 数据
        id: '0',
        willCreateKey: 1,
        children: []
    },
    activeId: '', // 当前激活的图形的id
    editId: '', // 修改名称的图形的id
    parentId: '', // 强制的父容器的id
    settingWidth: 600 // 设置面板宽度
};
