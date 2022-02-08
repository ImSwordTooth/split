const Timers = require('./utils/timers');
const config = require('../../configs');
const { tracer } = require('../common/jaeger');
const env = process.env.NODE_ENV;

exports.match = (routerObj) => {
    return async (ctx, next) => {
        if (config.default.statistics) {
            ctx.routerTime = Timers.timeEnd(ctx.routerTimeStart);
        }
        if (config.default.statisticsJaeger && ctx.span) {
            ctx.span.log({ event: 'route_matching', route_matching_time: ctx.routerTime });
            ctx.spanrouter.finish();
            ctx.spanrpc = tracer.startSpan('ctrl', { childOf: ctx.span });
        }
        ctx.urlinfo = routerObj;
        if (env === 'production' && ctx.headers['domain'] && !routerObj.online) {
            return false;
        }

        // return await handler(ctx, next);
        await next();
    };
};
