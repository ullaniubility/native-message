import { nanoid } from 'nanoid';
class NativeMessage {
    static Instance = null;
    static getInstance(instanceName, options) {
        if (!NativeMessage.Instance) {
            NativeMessage.Instance = new NativeMessage(instanceName, options);
        }
        return NativeMessage.Instance;
    }
    instance;
    options = {};
    callbacks = {};
    constructor(instanceName, options) {
        const appwindow = window;
        this.options = options || {};
        // @ts-ignore
        this.instance = appwindow?.webkit?.messageHandlers?.[instanceName] ?? appwindow[instanceName];
        if (!this.instance) {
            console.error('instance is not exist');
        }
        window.addEventListener('message', this._message);
    }
    _message(evt) {
        try {
            console.log(evt);
            const data = JSON.parse(evt.data);
            console.log(data);
            // eslint-disable-next-line no-empty
        }
        catch (error) { }
    }
    _createMessage(msg) {
        return { ...msg, callId: nanoid() };
    }
    /**
     * 监听app主动调用的事件
     * @param api API名称
     * @param callback 监听到方法的回调
     *
     * @example nativeMessage.on('test', (data) => {})
     */
    on(data) {
        const { _callback = loop, api, funid, ...rest } = data;
        if (!this.callbacks[api]) {
            this.callbacks[api] = [];
        }
        this.callbacks[api].push(_callback);
    }
    /**
     * 移除主动监听的方法
     */
    off(api, callback) {
        if (Array.isArray(this.callbacks[api])) {
            this.callbacks[api] = this.callbacks[api].filter(item => item !== callback);
        }
    }
    /**
     * 发送消息给app，如果有返回会通过有回调
     */
    emit(data) {
        const { _callback = loop, api, ...rest } = data;
        if (this.callbacks[api]) {
            this.callbacks[api] = _callback;
        }
        this.instance.postMessage(this._createMessage({ api, ...rest }));
    }
    emitPromise(data) {
        const { _callback = loop, api, ...rest } = data;
        if (this.callbacks[api]) {
            this.callbacks[api] = _callback;
        }
        this.instance.postMessage(this._createMessage({ api, ...rest }));
    }
}
export { NativeMessage };
export default NativeMessage;
function loop() {
    return;
}
