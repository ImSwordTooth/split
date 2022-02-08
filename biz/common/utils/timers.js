exports.time = () => {
    return process.hrtime();
};

exports.timeEnd = time => {
    const diff = process.hrtime(time);

    return ((diff[0] * 1e9 + diff[1]) / 1e6).toFixed(3);
};
