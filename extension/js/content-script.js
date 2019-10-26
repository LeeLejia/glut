// 向页面注入JS代码
async function runCustomJs(jsCode) {
	return new Promise(resolve => {
		var temp = document.createElement('script');
		temp.setAttribute('type', 'text/javascript');
		temp.innerHTML = jsCode;
		temp.onload = function () {
			this.parentNode.removeChild(this);
			resolve();
		};
		document.body.appendChild(temp);
	})
}

// 加载脚本
function loadScript(key) {
	console.log('load script:', key)
	RMI('loadScript', key).then(res => {
		if (res.status !== 0) {
			console.log(`load script failed: status=${res.status}`)
			return
		}
		console.log('load script success:', key)
		localStorage.setItem('SCRIPT#' + key, JSON.stringify(res.result))
		showToast({
			title: `更新[刷新生效]: ${key}`,
			message: `[${res.result.name || ''}]: ${res.result.desc}`
		})
	})
}

// 弹窗提示
function showToast(options) {
	RMI('notice', '', {
		type: 'basic',
		iconUrl: 'assets/img/app-icon.png',
		...options
	})
}

// content-script 远程方法
const rmiMap = {
	showToast
}
// 调用远程方法
function RMI(name, ...args) {
	// console.log(`call rmi: [${name}]\nargs: `, args);
	const method = rmiMap[name];
	if (method) {
		return Promise.resolve(rmiMap[name](...args))
	}
	return new Promise(resolve => {
		// 发送消息给后台
		chrome.runtime.sendMessage({
			type: 'invoke', name, args
		}, resolve)
	})
}

// 接收网页消息
window.addEventListener("message", ({ data }) => {
	if (!data || typeof data !== 'object' || data.type !== 'aircraft-carrier') {
		return;
	}
	const body = data.data || {}
	const params = body.data || {}
	RMI(params.name, ...params.args).then(res => {
		window.postMessage({
			type: 'warcraft',
			data: {
				id: body.id,
				data: res
			}
		})
	})
}, false)