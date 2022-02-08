exports.getIp = ctx => {
    try {
        if (!ctx.headers) {
            return '';
        }
        const xForwardedFor = ctx.headers['x-forwarded-for'];

        if (!xForwardedFor) {
            return '';
        }
        const ips = xForwardedFor.split(',');

        return ips[0].replace('::ffff:','');
    } catch (error) {
        console.error(error);
    }

    return '';
};
