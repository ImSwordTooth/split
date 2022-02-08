let request = require('request');

// 重试次数
const retryCount = 2;

// 设置默认超时时间
request = request.defaults({ timeout: 35 * 1000 });

const autoRetry = (func, retryMax) => {
	let retryNum = 0;

	return function funcR(...params) {
		return new Promise((resolve, reject) => {
			func(...params)
				.then(result => {
					resolve(result);
				})
				.catch(err => {
					if (retryNum < retryMax) {
						retryNum++;
						console.info({
							action: params[0],
							json: params[1],
							message: `第${retryNum}次http重试`,
							err: err
						});
						resolve(funcR(...params));
					} else {
						reject(err);
					}
				});
		});
	};
};

const func = (action, json) => {
	return new Promise((reslove, reject) => {
		try {
			request[action](json, (err, response, body) => {
				if (err) {
					return reject(err);
				}

				if (! [200, 400, 401, 404].includes(response.statusCode)) {
					return reject({
						responseCode: response.statusCode,
						responseHeaders: response.headers,
						responseBody: body,
					});
				}
				if (json && json.response) {
					reslove({ response, body });
				} else {
					reslove(body);
				}
			});
		} catch (err) {
			console.error(err);
			reject(err);
		}
	});
};

let actions = ['get', 'post', 'put', 'patch', 'del', 'head', 'options'];
for (let action of actions) {
	exports[action] = json => {
		return autoRetry(func, retryCount)(action, json);
	};
}

exports.default = request;
