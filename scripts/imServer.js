import xservice from 'yqf-xservice'
import { hubConnection, signalR } from 'signalr-no-jquery'

let _config;
let _servingClient;
let _connection;
let _hubProxy;
let _eventMap = {};

// signalR.connectionState = {
//     connecting: 0,
//     connected: 1,
//     reconnecting: 2,
//     disconnected: 4
// };

async function getToken(userCode) {
    var req = {
        Platform: 'MobileDevice',
        Source: 'react im test',
        UserCode: userCode
    }
    var rsp = await _servingClient.invoke('IM.GetToken', req)
    return rsp.Token
}

function registEvent(owner, eventName, callback) {
    eventName = eventName.toLowerCase();

    if (!_eventMap[owner]) {
        _eventMap[owner] = {};
    }

    _eventMap[owner][eventName] = callback;
}

function unregistEvents(owner) {
    delete _eventMap[owner];
}

function raiseEvent(eventName, ...args) {
    eventName = eventName.toLowerCase();

    for (var owner in _eventMap) {
        typeof (_eventMap[owner][eventName]) == 'function' && _eventMap[owner][eventName](...args);
    }
}

class IMServer {
     /**
     * @typedef ConfigType
     * @type Object
     * @property {String} imServerUrl
     * @property {String} xserviceServerUrl
     * @property {String} xserviceAppKey
     * @property {String} xserviceAppSecret
     */

    /**
     * 全局配置
     *
     * @param {ConfigType} config
     */
    static setConfig = function(config){
        _config = config;
        _servingClient = xservice.servingClient(config.xserviceServerUrl, config.xserviceAppKey, config.xserviceAppSecret)
    }

    static connectionState =  signalR.connectionState.disconnected

    static start = async function () {
        var userCode = _config.onGetCurrentUser();

        return new Promise(async (resolve, reject) => {
            if (_connection == null || _connection.state == signalR.connectionState.disconnected) {
                var token = await getToken(userCode)

                _connection = hubConnection(_config.imServerUrl + '/signalr', { qs: 'token=' + token });
                _connection.stateChanged(function () {
                    IMServer.state =  _connection.state;
                    raiseEvent('SYS:OnConnectionStateChanged');
                });

                _hubProxy = _connection.createHubProxy('chat');

                _hubProxy.on('OnChat', (message) => raiseEvent('OnChat', message));
                _hubProxy.on('OnKickOff', (message) => raiseEvent('OnKickOff', message));
                _hubProxy.on('OnGroupNotify', (message) => raiseEvent('OnGroupNotify', message));
                _hubProxy.on('OnSNSNotify', (message) => raiseEvent('OnSNSNotify', message));
                _hubProxy.on('OnCSService_Chat', (message) => raiseEvent('OnCSService_Chat', message));
                _hubProxy.on('OnCSService_ChatRequest', (message) => raiseEvent('OnCSService_ChatRequest', message));
                _hubProxy.on('OnCSService_ChatRequestCancelled', (message) => raiseEvent('OnCSService_ChatRequestCancelled', message));
                _hubProxy.on('OnCSService_UserLeave', (message) => raiseEvent('OnCSService_UserLeave', message));
                _hubProxy.on('OnCSService_ForwardingResult', (message) => raiseEvent('OnCSService_ForwardingResult', message));
                _hubProxy.on('OnCSUser_Chat', (message) => raiseEvent('OnCSUser_Chat', message));
                _hubProxy.on('OnCSUser_ServiceJoin', (message) => raiseEvent('OnCSUser_ServiceJoin', message));
                _hubProxy.on('OnCSUser_ServiceLeave', (message) => raiseEvent('OnCSUser_ServiceLeave', message));
                _hubProxy.on('OnCSUser_RequestTimeout', (message) => raiseEvent('OnCSUser_RequestTimeout', message));
                _hubProxy.on('OnCSUser_Disconnected', (message) => raiseEvent('OnCSUser_Disconnected', message));

                _connection.start().done(resolve).fail(reject);
            }
            else {
                resolve();
            }
        });
    }

     /**
     * 准备
     *
     * @param {Function} callback context=>
     */
    static prepare = function(callback){

    }

    static stop = function () {
        if (_connection != null && _connection.state != signalR.connectionState.disconnected) {
            _connection.stop();
        }
    }

    // 服务端方法
    static methods = {
        addFriend: async (message) => await _hubProxy.invoke('AddFriend', message),
        addGroupMember: async (message) => await _hubProxy.invoke('AddGroupMember', message),
        createGroup: async (message) => await _hubProxy.invoke('CreateGroup', message),
        deleteFriend: async (message) => await _hubProxy.invoke('DeleteFriend', message),
        dismissGroup: async (message) => await _hubProxy.invoke('DismissGroup', message),
        exitGroup: async (message) => await _hubProxy.invoke('ExitGroup', message),
        friendResponse: async (message) => await _hubProxy.invoke('FriendResponse', message),
        getLoginUser: async () => await _hubProxy.invoke('GetLoginUser'),
        groupResponse: async (message) => await _hubProxy.invoke('GroupResponse', message),
        joinGroup: async (message) => await _hubProxy.invoke('JoinGroup', message),
        modifyGroupInfo: async (message) => await _hubProxy.invoke('ModifyGroupInfo', message),
        preAddFriend: async (message) => await _hubProxy.invoke('PreAddFriend', message),
        removeGroupMember: async (message) => await _hubProxy.invoke('RemoveGroupMember', message),
        sendChat: async (message) => await _hubProxy.invoke('SendChat', message),
        setReadMessage: async (message) => await _hubProxy.invoke('SetReadMessage', message),
        csService_Accept: async (message) => await _hubProxy.invoke('CSService_Accept', message),
        csService_Chat: async (message) => await _hubProxy.invoke('CSService_Chat', message),
        csService_Forwarding: async (message) => await _hubProxy.invoke('CSService_Forwarding', message),
        csService_Leave: async (message) => await _hubProxy.invoke('CSService_Leave', message),
        csService_Reject: async (message) => await _hubProxy.invoke('CSService_Reject', message),
        csUser_Chat: async (message) => await _hubProxy.invoke('CSUser_Chat', message),
        csUser_Enter: async (message) => await _hubProxy.invoke('CSUser_Enter', message),
        csUser_Leave: async (message) => await _hubProxy.invoke('CSUser_Leave', message),
        csUser_Request: async (message) => await _hubProxy.invoke('CSUser_Request', message),
    }

    // 客户端事件
    static events = {
        off: (owner) => unregistEvents(owner),

        onConnectionStateChanged: (owner, callback) => registEvent(owner, 'SYS:OnConnectionStateChanged', callback),
        
        onChat: (owner, callback) => registEvent(owner, 'OnChat', callback),
        onKickOff: (owner, callback) => registEvent(owner, 'OnKickOff', callback),
        onGroupNotify: (owner, callback) => registEvent(owner, 'OnGroupNotify', callback),
        onSNSNotify: (owner, callback) => registEvent(owner, 'OnSNSNotify', callback),
        onCSService_Chat: (owner, callback) => registEvent(owner, 'OnCSService_Chat', callback),
        onCSService_ChatRequest: (owner, callback) => registEvent(owner, 'OnCSService_ChatRequest', callback),
        onCSService_ChatRequestCancelled: (owner, callback) => registEvent(owner, 'OnCSService_ChatRequestCancelled', callback),
        onCSService_UserLeave: (owner, callback) => registEvent(owner, 'OnCSService_UserLeave', callback),
        onCSService_ForwardingResult: (owner, callback) => registEvent(owner, 'OnCSService_ForwardingResult', callback),
        onCSUser_Chat: (owner, callback) => registEvent(owner, 'OnCSUser_Chat', callback),
        onCSUser_ServiceJoin: (owner, callback) => registEvent(owner, 'OnCSUser_ServiceJoin', callback),
        onCSUser_ServiceLeave: (owner, callback) => registEvent(owner, 'OnCSUser_ServiceLeave', callback),
        onCSUser_RequestTimeout: (owner, callback) => registEvent(owner, 'OnCSUser_RequestTimeout', callback),
        onCSUser_Disconnected: (owner, callback) => registEvent(owner, 'OnCSUser_Disconnected', callback),
    }
}

exports.ConnectionState = signalR.connectionState
exports.IMServer = IMServer