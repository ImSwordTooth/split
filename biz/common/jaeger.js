const logger = require('./logger');
const config = require('../../configs');
const initTracer = require('jaeger-client').initTracer;

const options = {
    tags: {
        // 'my-awesome-service.version': '1.1.2',
    },
};

const tracer = initTracer(
    {
        serviceName: `${config.default.namespace}-${config.default.appname}`,
    },
    options,
);

const jaegerInit = app => {
    // jaeger 开关
    if (config.default.statisticsJaeger) {
        app.use(async (ctx, next) => {
            // 监控锚点
            const span = tracer.startSpan('http_request');

            // Debug Traces sampling.priority 为 1 ，则开启debug模式，强制采样
            // The OpenTracing API defines a sampling.priority standard tag that can be used to affect the sampling of a span and its children:
            if (config.default.JaegerDebug) {
                span.setTag('sampling.priority', 1);
            }

            span.setTag('sampler.type', config.default.JaegerSamplerType);
            span.setTag('sampler.param', config.default.JaegerSamplerParam);
            span.setTag('shankTracerId', ctx.uuid);

            ctx.span = span;

            ctx.spanrouter = tracer.startSpan('router', { childOf: ctx.span });

            try {
                await next();
            } catch (error) {
                throw error;
            } finally {
                ctx.span.finish();
            }
        });
    }
};

module.exports = {
    tracer,
    jaegerInit,
};
