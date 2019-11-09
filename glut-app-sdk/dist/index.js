"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
// 初始化App
var APPID = "__GLUT_APP_ID__";
var appInfo = { lifeCycle: {} };
if (!window.$chromeMiniApps) {
    console.warn("[GlutApp] window.$chromeMiniApps 不存在");
    alert("[GlutApp] window.$chromeMiniApps 不存在");
    // @ts-ignore
    window.$chromeMiniApps = (_a = {
            readme: "mock obj"
        },
        _a[APPID] = {},
        _a);
}
// @ts-ignore
Object.assign(appInfo, window.$chromeMiniApps[APPID]);
var common = ((window.$chromeMiniApps && window.$chromeMiniApps.common));
var context = ((window.$chromeMiniApps && window.$chromeMiniApps.context));
// region ==========>>>>>>>>> 页面通信
// 在页面环境跑代码
var msgPrms = {
// id: promise
};
function runAtPage(fun) {
    return new Promise(function (res) {
        var id = "" + new Date().getTime() + Math.random();
        msgPrms[id] = res;
        window.postMessage({
            type: "glut-inject",
            id: id,
            script: "(" + fun.toString() + ")();"
        });
    });
}
function onMessage(_a) {
    var data = _a.data;
    if (typeof data !== "object" || data.type !== "glut-window" || !data.id) {
        return;
    }
    var body = data.data || {};
    var prm = msgPrms[data.id];
    if (prm) {
        prm(body.data);
        delete msgPrms[body.id];
    }
}
// 保存配置
function saveConfig(obj) {
    var _a;
    // @ts-ignore
    if (chrome.storage) {
        // @ts-ignore
        chrome.storage.sync.get((_a = {}, _a[APPID] = {}, _a), function (result) {
            var _a;
            // @ts-ignore
            chrome.storage.sync.set((_a = {},
                _a[APPID] = Object.assign({}, result[APPID], obj),
                _a));
        });
    }
}
// 读取配置
function readConfig(defaultObj) {
    return new Promise(function (res) {
        var _a;
        // @ts-ignore
        chrome.storage.sync.get((_a = {}, _a[APPID] = {}, _a), function (result) {
            var readResult = result[APPID] || {};
            res(Object.keys(defaultObj).reduce(function (rs, it) {
                rs[it] = readResult.hasOwnProperty(it)
                    ? readResult[it]
                    : defaultObj[it];
                return rs;
            }, {}));
        });
    });
}
// 初始化小程序位置
function initPos() {
    var dom = document.querySelector("#Glut-App-" + APPID);
    if (dom) {
        // @ts-ignore
        Object.assign(dom.style, {
            display: "unset"
        });
        readConfig({
            pos_left: Math.round(window.innerWidth / 2 - dom.clientWidth / 2),
            pos_top: Math.round(window.innerHeight / 2 - dom.clientHeight / 2)
        }).then(function (_a) {
            var pos_left = _a.pos_left, pos_top = _a.pos_top;
            console.log({ pos_left: pos_left, pos_top: pos_top });
            // @ts-ignore
            Object.assign(dom.style, {
                left: Math.min(pos_left, window.innerWidth - dom.clientWidth - 10) + "px",
                top: Math.min(pos_top, window.innerHeight - dom.clientHeight - 10) + "px"
            });
        });
    }
}
window.addEventListener("message", onMessage, false);
// endregion <<<<<<<============= 页面通信
var closeEvent = function () {
    // 保存上一个位置
    var dom = document.querySelector("#Glut-App-" + APPID);
    if (dom) {
        // @ts-ignore
        var offsetTop = dom.offsetTop, offsetLeft = dom.offsetLeft;
        saveConfig({
            pos_left: offsetLeft || 0,
            pos_top: offsetTop || 0
        });
    }
    window.removeEventListener("message", onMessage);
};
var lifeCycle = appInfo.lifeCycle;
if (lifeCycle) {
    lifeCycle.close = closeEvent;
    lifeCycle.open = initPos;
}
// 设置监听
function setEventListener(name, callback) {
    if (lifeCycle) {
        if (name === "close") {
            lifeCycle[name] = function () {
                closeEvent();
                callback();
            };
            return;
        }
        else if (name === "open") {
            lifeCycle[name] = function () {
                // 初始化位置
                initPos();
                callback();
            };
            return;
        }
        lifeCycle[name] = callback;
    }
}
// 获取app信息
function getAppInfo() {
    //@ts-ignore
    var _a = appInfo, id = _a.id, name = _a.name, icon = _a.icon;
    return { id: id, name: name, icon: icon };
}
console.log("[glut:__GLUT_APP_ID__] is running!");
// Log 添加前缀
var Log = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    console.log.apply(console, __spreadArrays(["[glut:__GLUT_APP_ID__]"], args));
};
exports.default = __assign(__assign({}, common), { getAppInfo: getAppInfo,
    context: context, getAppId: function () { return APPID; }, getRootElementId: function () { return "Glut-App-" + APPID + "-content"; }, setEventListener: setEventListener, 
    // 控制小程序方法
    close: appInfo.close, maxWin: appInfo.maxWin, minWin: appInfo.minWin, setMenuList: appInfo.setMenuList, Log: Log,
    runAtPage: runAtPage,
    saveConfig: saveConfig,
    readConfig: readConfig });
