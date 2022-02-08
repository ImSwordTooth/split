/**
 * koa框架 ctx对象方法扩展
 * ctx对象新增 ctx.html(), ctx.json, ctx.jsonp()方法，使用说明请查看doc.md
 */
module.exports = (app, options = {}) => {
    // extend json function
    app.context.json = function(code, message, data) {
        const contentType = 'application/json';
        let response = null;

        if (arguments.length === 1) {
            response = { code: 0, message: '成功', data: arguments[0] };
        } else {
            response = { code, message, data };
        }

        // setCacheTime(this);

        this.type = contentType;
        this.body = response;

        this.respcode = response.code
        this.respmessage = response.message
    };

    // extend jsonp function
    app.context.jsonp = function(code, message, data) {
        const callback = this.params.callback || this.query.callback || 'callback';
        const contentType = 'text/javascript';
        let response = null;

        if (this.method !== 'GET') {
            return;
        }

        // setCacheTime(this);

        if (arguments.length === 1) {
            response = { code: 0, message: '成功', data: arguments[0] };
        } else {
            response = { code, message, data };
        }

        response = `${callback}(${JSON.stringify(response)})`;

        this.type = contentType;
        this.body = response;
    };

    // extend error function
    app.context.error = function(status) {
        this.status = status || 404;
    };

    app.context.errorLog = function(err) {
        if (typeof err === 'object') {
            err.bid = this.uuid;
        } else if (typeof err === 'string') {
            err += `，bid： ${this.uuid}`;
        }
        console.error(err);
    };

};
