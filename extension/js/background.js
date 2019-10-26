// https://chajian.baidu.com/developer/extensions/api_index.html
// 向页面注入JS
async function runCustomJsFile(jsPath) {
	return new Promise(resolve => {
		jsPath = jsPath;
		var temp = document.createElement('script');
		temp.setAttribute('type', 'text/javascript');
		temp.src = chrome.extension.getURL(jsPath);
		temp.onload = function () {
			// 放在页面不好看，执行完后移除掉
			this.parentNode.removeChild(this);
			resolve();
		};
		document.body.appendChild(temp);
	})
}

// 云存储服务
const storageReady = runCustomJsFile('js/av-min.js')
storageReady.then(() => {
	// 初始化
	AV.init({
		appId: "__appId", // 这里替换自己的appId，在 leancloud上申请
		appKey: "__appKey" // 替换appkey
	})
})

// 被远程调用的方法和服务
const remoteMethods = {
	// 通知框
	notice(id, options) {
		// https://crxdoc-zh.appspot.com/extensions/notifications
		chrome.notifications.create(id, options)
	},
	saveConfig(obj) {
		chrome.storage.sync.set(obj || {});
	},
	readConfig(defaultObj) {
		return new Promise(res => {
			chrome.storage.sync.get(defaultObj, function (result) {
				res(result);
			})
		});
	},
	// 设置角标
	setBadgeText(text = '', color = [0, 0, 0, 0]) {
		chrome.browserAction.setBadgeText({ text })
		chrome.browserAction.setBadgeBackgroundColor({ color })
	},
	// 在某个标签打开某个链接
	openUrl(url, tabId = false) {
		if (!tabId) {
			// 新标签打开某个链接
			chrome.tabs.create({ url });
			return
		}
		chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
			chrome.tabs.update(tabs.length ? tabs[0].id : null, { url });
		})
	},
	// 查看全部 tabs
	getTabs() {
		return new Promise(resolve => {
			chrome.tabs.query({ active: true, currentWindow: true }, resolve)
		})
	},
	// 加载脚本
	loadScript(id) {
		return storageReady.then(() => {
			return AV.Cloud.run('loadScript', {
				id
			})
		})
	},
	// 加载App
	loadApp(id) {
		return storageReady.then(() => {
			return AV.Cloud.run('loadApp', {
				id
			})
		})
	},
	// 上传/修改App
	// action: create modify
	// app: id? name icon script 
	uploadApp(action, app, password) {
		return storageReady.then(() => {
			return new Promise(res => {
				chrome.storage.sync.get({ groupId: '' }, ({ groupId }) => {
					res(AV.Cloud.run('uploadApp', {
						action,
						app,
						auth: {
							groupId,
							password
						}
					}))
				})
			});
		})
	},
	// 更新配置
	updateConfig(id = '') {
		if (id) {
			chrome.storage.sync.set({ groupId: id })
		}
		// 检查更新插件列表
		return storageReady.then(() => {
			return new Promise((resolve, reject) => {
				chrome.storage.sync.get({ groupId: '' }, function ({ groupId }) {
					if (!groupId) {
						// 提醒配置GroupId
						remoteMethods.notice('', {
							type: 'basic',
							iconUrl: 'assets/img/app-icon.png',
							title: 'Glut',
							message: '尚未检查到你的GroupId，请了解并配置GroupId，以获取Glut服务',
							buttons: [{
								title: '以后再说',
							}, {
								title: '前往',
							}]
						})
						reject('尚未检查到你的GroupId，请了解并配置GroupId，以获取Glut服务')
						chrome.storage.sync.set({ groupIdValid: false })
						return
					}
					AV.Cloud.run('getGroupConfig', {
						id: groupId
					}).then(function (res) {
						if (res.status !== 0) {
							// 加载配置出错
							remoteMethods.notice('', {
								type: 'basic',
								iconUrl: 'assets/img/app-icon.png',
								title: 'Glut',
								message: '写到配置错误！Detail:' + JSON.stringify(res)
							})
							reject('请输入有效GroupId')
							chrome.storage.sync.set({ groupIdValid: false })
							return
						}
						// console.log('写到配置：', res.data && res.data.scriptList || [])
						// 处理结果
						chrome.storage.sync.set({
							ScriptList: res.data && res.data.scriptList || [], // 脚本列表
							AppList: res.data && res.data.appList || [], // app列表
							GroupName: res.data && res.data.groupName || '', // 组织名
						}, function () {
							console.log("更新插件配置成功!")
						})
						resolve(res.data && res.data.scriptList || [])
						chrome.storage.sync.set({ groupIdValid: true })
					}, function (err) {
						// 处理报错
						remoteMethods.notice('', {
							type: 'basic',
							iconUrl: 'assets/img/app-icon.png',
							title: 'Glut',
							message: '写到配置错误！Detail:' + JSON.stringify(err)
						})
						reject('写到配置错误！Detail:' + JSON.stringify(err))
						chrome.storage.sync.set({ groupIdValid: false })
					})
				})
			})
		})
	},
	// 网络请求
	fetch(...args) {
		console.log(`fetch:${args[0]}\nargs:`, args.slice(1))
		return fetch(...args).then((response) => {
			const reader = response.body.getReader()
			const stream = new ReadableStream({
				start(controller) {
					function push() {
						reader.read().then(({ done, value }) => {
							if (done) {
								controller.close()
								return;
							}
							controller.enqueue(value)
							push()
						})
					}
					push()
				}
			})
			console.log(`fetch:${args[0]}\nresponse:true`)
			return new Response(stream).text()
		})
	}
}

// 检查更新配置
chrome.storage.sync.get({ AutoUpdate: true }, ({ AutoUpdate }) => {
	if (AutoUpdate) {
		remoteMethods.updateConfig()
	}
});

// 监听消息，RMI，在content-script可以相同方式使用
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
	// 调用方法
	// data: { type: 'invoke', name: 'notice', args: [] }, result: {status: 0, result: Object}
	if (message.type === 'invoke') {
		const method = remoteMethods[message.name]
		if (!method) {
			console.log(`unfounded method: ${message.name}`)
			sendResponse({
				status: -1,
				msg: '远程方法不存在'
			})
			return
		}
		const result = method.apply(remoteMethods, message.args)
		if (result instanceof Promise) {
			result.then(res => {
				sendResponse({
					status: 0,
					result: res
				})
			}).catch(err => {
				sendResponse({
					status: -1,
					result: err
				})
			})
			return true
		}
		sendResponse({
			status: 0,
			result
		})
	}
})