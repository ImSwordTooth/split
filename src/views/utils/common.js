export const getDataById = (id, obj, isPixi = false) => {
    const key = isPixi ? 'name': 'id'
    if (obj[key] === id){
        return obj;
    } else {
        for (let i=0; i<obj.children.length;i++){
            if (id.indexOf(obj.children[i][key]) === 0){
                return getDataById(id, obj.children[i], isPixi);
            }
        }
    }
}
