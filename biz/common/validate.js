const Joi = require('@hapi/joi');

/**
 * joi参数验证
 * @param {Object} schemas
 * @param {String} type 类型
 * @return {Funciton}
 */
exports.validate = (schemas, type) => {
  return async (ctx, next) => {
    ctx.all = Object.assign({}, ctx.query, ctx.params, ctx.request.body)
    if (schemas) {
      const ret = schemas.validate(ctx.all, {
        allowUnknown: true,
      });
      // Joi.validate(Object.assign({}, ctx.query, ctx.params, ctx.request.body), schemas, {
      //     allowUnknown: true,
      // });

      if (ret.error) {
        ctx.errorCount++;
        switch (type) {
          case 'html':
          case 'xml':
          case 'text':
            ctx.body = `<!DOCTYPE html>
                                        <html>
                                            <head></head>
                                            <body>
                                                <p>params validate occurs Error:</p>
                                                <p>${JSON.stringify(ret.error.details)}</p>
                                            </body>
                                        </html>`;
            break;
          case 'jsonp':
            ctx.jsonp(1, 'params validate occurs Error', ret.error.details);
            break;
          default:
            ctx.json(1, 'params validate occurs Error', ret.error.details);
        }

        return;
      }
    }

    return next();
  };
};
