/**
 * 后台服务入口
 */
const logger = require('./common/logger');
const config = require('./configs');
const frontconfig = require('../configs');
const Koa = require('koa');
const onerror = require('koa-onerror');
const koaBody = require('koa-body');
const koaStatic = require('koa-static');
const path = require('path');
const routers = require('./routers');
const uuid = require('uuid/v1');
const moment = require('moment');
const os = require('os');
const hostname = os.hostname();
const pid = process.pid;
const { getIp } = require('./common/utils/ip');
const fs = require('fs');

// 普罗米修斯
const env = process.env.NODE_ENV || 'development';

// 创建koa实例
const app = new Koa();

// 捕获未知错误
onerror(app);

// 对ctx对象进行扩展，添加 html & json & jsonp 等方法
const webapi = require('./common/middlewares/koa-webapi');

webapi(app);

app.use(async (ctx, next) => {
    // ctx.set('Access-Control-Allow-Origin', '*');
    // console.log(ctx.origin);
    // console.log(ctx.originalUrl);
    ctx.set('Access-Control-Allow-Origin', ctx.headers['origin'] );
    // ctx.set(
    //     'Access-Control-Allow-Headers',
    //     'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild, x-grpc-web, x-user-agent',
    // );
    ctx.set('Access-Control-Allow-Headers', '*');
    ctx.set('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    ctx.set('Access-Control-Allow-Credentials', 'true');

    if (ctx.method === 'OPTIONS') {
        ctx.status = 200;
        return;
    }
    await next()
});


// 普鲁米修斯初始化
// promInit(app);

// // 对结果进行压缩
// app.use(compress({ threshold: 2048 }));

app.use(
    koaStatic(path.join(__dirname, 'dist'), {
        index: 'index.html',
        // maxage: 2 * 60 * 1000,
    })
);

app.use(async (ctx, next) => {
    if (ctx.url === '/heartbeat') {
        return (ctx.body = { success: true });
    }

    // 初始化
    ctx.sourcePath = ctx.url;
    ctx.start = process.uptime() * 1000;
    ctx.uuid = uuid().replace(/-/g, '');
    ctx.requestTime = 0;
    ctx.errorCount = 0;
    ctx.printLog = true;
    ctx.respmessage = ''
    ctx.respcode = 0
    ctx.ip = getIp(ctx);
    ctx.set('shankTracerId', ctx.uuid);
    ctx.set('hostname', hostname);
    ctx.set('pid', pid);

    try {
        await next();
    } catch (err) {
        logger.error(err);

        switch (ctx.type) {
            case 'json':
                ctx.json(1, err.message);
                break;
            case 'jsonp':
                ctx.jsonp(1, err.message);
                break;
            case 'html':
            case 'xml':
            case 'text':
            default:
                ctx.status = 502;
        }

        if (ctx.span) {
            ctx.span.setTag('error', true);
            ctx.span.log({ event: 'error', 'error.object': err, message: err.message, stack: err.stack });
        }
    }
    ctx.time = process.uptime() * 1000 - ctx.start;
    logger.info({
        kpi: {
            method: ctx.method,
            path: ctx.originalUrl,
            status: ctx.status,
            time: ctx.time,
            uuid: ctx.uuid,
            errorCount: ctx.errorCount,
            serverTime: moment().format('YYYY-MM-DD HH:mm:ss'),
            domain: ctx.header.domain || ctx.host || 'nodomain',
            referer: ctx.headers['referer'],
            ua: ctx.headers['user-agent'],
            accept: ctx.headers['accept'],
            ip: ctx.ip,
            respcode: ctx.code,
            respmessage: ctx.message,
            username: ctx.username,
            dispalyname: ctx.dispalyname,
        },
    });
    // console.info(ctx.headers)
});

// jaeger初始化
// jaegerInit(app);

if (env != 'development') {
    let proxyTable = frontconfig.default.proxy;
    for (const key in proxyTable) {
        if (proxyTable[key].key) {
            proxyTable[key].rewrite = _path => _path.replace(proxyTable[key].key, proxyTable[key].value);
        }
    }

    const proxy = require('koa-proxies');
    Object.keys(proxyTable).forEach(context => {
        let options = proxyTable[context];
        if (typeof options === 'string') {
            options = {
                target: options,
                changeOrigin: true,
                logs: true,
            };
        }
        app.use(proxy(context, options));
    });
}

app.use(
    koaBody({
        multipart: true, // 支持文件上传
        // encoding:'gzip',
        formidable: {
            uploadDir: path.join(__dirname, './uploads/'), // 设置文件上传目录
            keepExtensions: true, // 保持文件的后缀
            maxFieldsSize: 10 * 1024 * 1024, // 文件上传大小
            onFileBegin: (name, file) => {
                // 文件上传前的设置
                // console.log(`name: ${name}`);
                // console.log(file);
            },
        },
    })
);

const Router = require('koa-router');
const router = new Router();
// 加载路由
app.use(routers.routes(), routers.allowedMethods());

const defaultHtmlPath = path.join(__dirname, '/dist', frontconfig.default.basePath, '/index.html');
router.get('/*', (ctx, next) => {
    ctx.type = 'text/html';
    ctx.body = fs.createReadStream(defaultHtmlPath, 'utf-8');
});

app.use(router.routes());

// 导出koa 实例，方便单元测试
const server = app.listen(config.default.port || 3000, () => {
    logger.info(`app is listening ${config.default.port || 3000}`);
});

module.exports = server;

if (env !== 'development') {
    ['SIGINT', 'SIGTERM'].forEach(signal => {
        process.on(signal, () => {
            console.info({ signal });
            setTimeout(() => {
                console.info({ signal: 'process.exit' });
                process.exit();
            }, 20000);
        });
    });
}
