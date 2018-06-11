var { hubConnection, signalR } = require('signalr-no-jquery')

const imServerUrl = 'https://im.yiqifei.com/'

let _connection;
let _hubProxy;
let _eventMap = {};

// signalR.connectionState = {
//     connecting: 0,
//     connected: 1,
//     reconnecting: 2,
//     disconnected: 4
// };

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

function IMServer(){
    var self = this;

    this.connectionState = signalR.connectionState.disconnected

    this.start = function (token) {
        return new Promise((resolve, reject) => {
            if (_connection == null || _connection.state == signalR.connectionState.disconnected) {
                _connection = hubConnection(imServerUrl + '/signalr', { qs: 'token=' + token });
                _connection.stateChanged(function () {
                    IMServer.state = _connection.state;
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

    this.stop = function () {
        if (_connection != null && _connection.state != signalR.connectionState.disconnected) {
            _connection.stop();
        }
    }

    // 服务端方法
    this.methods = {
        addFriend: (message) => _hubProxy.invoke('AddFriend', message),
        addGroupMember: (message) => _hubProxy.invoke('AddGroupMember', message),
        createGroup: (message) => _hubProxy.invoke('CreateGroup', message),
        deleteFriend: (message) => _hubProxy.invoke('DeleteFriend', message),
        dismissGroup: (message) => _hubProxy.invoke('DismissGroup', message),
        exitGroup: (message) => _hubProxy.invoke('ExitGroup', message),
        friendResponse: (message) => _hubProxy.invoke('FriendResponse', message),
        getLoginUser: () => _hubProxy.invoke('GetLoginUser'),
        groupResponse: (message) => _hubProxy.invoke('GroupResponse', message),
        joinGroup: (message) => _hubProxy.invoke('JoinGroup', message),
        modifyGroupInfo: (message) => _hubProxy.invoke('ModifyGroupInfo', message),
        preAddFriend: (message) => _hubProxy.invoke('PreAddFriend', message),
        removeGroupMember: (message) => _hubProxy.invoke('RemoveGroupMember', message),
        sendChat: (message) => _hubProxy.invoke('SendChat', message),
        setReadMessage: (message) => _hubProxy.invoke('SetReadMessage', message),
        csService_Accept: (message) => _hubProxy.invoke('CSService_Accept', message),
        csService_Chat: (message) => _hubProxy.invoke('CSService_Chat', message),
        csService_Forwarding: (message) => _hubProxy.invoke('CSService_Forwarding', message),
        csService_Leave: (message) => _hubProxy.invoke('CSService_Leave', message),
        csService_Reject: (message) => _hubProxy.invoke('CSService_Reject', message),
        csUser_Chat: (message) => _hubProxy.invoke('CSUser_Chat', message),
        csUser_Enter: (message) => _hubProxy.invoke('CSUser_Enter', message),
        csUser_Leave: (message) => _hubProxy.invoke('CSUser_Leave', message),
        csUser_Request: (message) => _hubProxy.invoke('CSUser_Request', message),
    }

    // 客户端事件
    this.events = {
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

IMServer.prototype.events = {
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

module.exports = {
    ConnectionState: signalR.connectionState,
    IMServer: new IMServer()
}
