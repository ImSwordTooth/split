/**
 * 上传图片到cdn
 * */
exports.uploadImage = {
    path: '/api/split/uploadImage',
    method: 'post',
    remark: '上传图片',
    logs: true,
    handler: async ctx => {
        ctx.json({
            html: '123',
        })
    }
}
