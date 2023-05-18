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
        window.addEventListener('message', this._message.bind(this));
    }
    _message(evt) {
        try {
            const data = typeof evt.data === 'object' ? evt.data : JSON.parse(evt.data);
            const fullApi = data.api + data.callId;
            if (this.callbacks[fullApi]) {
                this.callbacks[fullApi](data);
                delete this.callbacks[fullApi];
            }
            else if (this.callbacks[data.api]) {
                const fns = this.callbacks[data.api] || [];
                if (typeof fns === 'function') {
                    fns(data);
                }
                else {
                    console.log(fns);
                    fns.forEach(item => item(data));
                }
            }
            // eslint-disable-next-line no-empty
        }
        catch (error) {
            console.log('message parse Error: ', error);
        }
    }
    _createMessage(msg) {
        return { content: {}, ...msg, callId: nanoid() };
    }
    /**
     * 监听app主动调用的事件
     * @param api API名称
     * @param callback 监听到方法的回调
     *
     * @example nativeMessage.on('test', (data) => {})
     */
    on(data, callback) {
        if (!callback) {
            return console.error('请传入回调函数，并且不要使用匿名函数');
        }
        const { api } = data;
        if (!this.callbacks[api]) {
            this.callbacks[api] = [];
        }
        this.callbacks[api].push(callback);
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
    emit(data, callback = loop) {
        const sendMessage = this._createMessage(data);
        const { api, callId } = sendMessage;
        const fullApi = api + callId;
        this.callbacks[fullApi] = callback;
        this.instance.postMessage(JSON.stringify(sendMessage));
    }
    /**
     * Promise 化的emit
     * @param data IMessageBase
     * @returns Promise<IMessageResult>
     *
     * @example await nativeMessage.emitPromise({api: 'test'})
     */
    emitPromise(data) {
        return new Promise((resolve, reject) => {
            this.emit(data, (res) => {
                if (res.status !== 'error') {
                    resolve(res);
                }
                else {
                    reject(res);
                }
            });
        });
    }
}
export { NativeMessage };
export default NativeMessage;
function loop() {
    return;
}
