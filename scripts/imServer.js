import xservice from 'yqf-xservice'
import { hubConnection, signalR } from 'signalr-no-jquery'

const servingClient = xservice.servingClient('https://api2.yqfws.com/', '100008', '541a7f9b49f1b2a1')
const imServerUrl = 'https://im.yiqifei.com/signalr'

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
    var rsp = await servingClient.invoke('IM.GetToken', req)
    return rsp.Token
}

let connection;
let hubProxy;
let eventMap = {};

function registEvent(owner, eventName, callback) {
    eventName = eventName.toLowerCase();

    if (!eventMap[owner]) {
        eventMap[owner] = {};
    }

    eventMap[owner][eventName] = callback;
}

function unregistEvents(owner) {
    delete eventMap[owner];
}

function raiseEvent(eventName, ...args) {
    eventName = eventName.toLowerCase();

    for(var owner in eventMap){
        typeof (eventMap[owner][eventName]) == 'function' && eventMap[owner][eventName](...args);
    }
}

export class IMServer {
    static start = async function (userCode) {
        var token = await getToken(userCode)

        return new Promise((resolve, reject) => {
            if (connection == null) {
                connection = hubConnection(imServerUrl, { qs: 'token=' + token });
                connection.stateChanged(function () {
                    console.log('stateChanged:' + connection.state)
                });

                hubProxy = connection.createHubProxy('chat');

                hubProxy.on('OnChat', (message) => raiseEvent('OnChat', message));
                hubProxy.on('OnKickOff', (message) => raiseEvent('OnKickOff', message));
                hubProxy.on('OnGroupNotify', (message) => raiseEvent('OnGroupNotify', message));
                hubProxy.on('OnSNSNotify', (message) => raiseEvent('OnSNSNotify', message));
                hubProxy.on('OnCSService_Chat', (message) => raiseEvent('OnCSService_Chat', message));
                hubProxy.on('OnCSService_ChatRequest', (message) => raiseEvent('OnCSService_ChatRequest', message));
                hubProxy.on('OnCSService_ChatRequestCancelled', (message) => raiseEvent('OnCSService_ChatRequestCancelled', message));
                hubProxy.on('OnCSService_UserLeave', (message) => raiseEvent('OnCSService_UserLeave', message));
                hubProxy.on('OnCSService_ForwardingResult', (message) => raiseEvent('OnCSService_ForwardingResult', message));
                hubProxy.on('OnCSUser_Chat', (message) => raiseEvent('OnCSUser_Chat', message));
                hubProxy.on('OnCSUser_ServiceJoin', (message) => raiseEvent('OnCSUser_ServiceJoin', message));
                hubProxy.on('OnCSUser_ServiceLeave', (message) => raiseEvent('OnCSUser_ServiceLeave', message));
                hubProxy.on('OnCSUser_RequestTimeout', (message) => raiseEvent('OnCSUser_RequestTimeout', message));
                hubProxy.on('OnCSUser_Disconnected', (message) => raiseEvent('OnCSUser_Disconnected', message));
                hubProxy.on('OnKickOff', (message) => raiseEvent('OnKickOff', message));


                connection.start().done(resolve).fail(reject);
            }
            else {
                resolve();
            }
        });
    }

    static stop = function () {
        connection.stop();
    }

    // 服务端方法
    static methods = {
        addFriend: async (message) => await hubProxy.invoke('AddFriend', message),
        addGroupMember: async (message) => await hubProxy.invoke('AddGroupMember', message),
        createGroup: async (message) => await hubProxy.invoke('CreateGroup', message),
        deleteFriend: async (message) => await hubProxy.invoke('DeleteFriend', message),
        dismissGroup: async (message) => await hubProxy.invoke('DismissGroup', message),
        exitGroup: async (message) => await hubProxy.invoke('ExitGroup', message),
        friendResponse: async (message) => await hubProxy.invoke('FriendResponse', message),
        getLoginUser: async () => await hubProxy.invoke('GetLoginUser'),
        groupResponse: async (message) => await hubProxy.invoke('GroupResponse', message),
        joinGroup: async (message) => await hubProxy.invoke('JoinGroup', message),
        modifyGroupInfo: async (message) => await hubProxy.invoke('ModifyGroupInfo', message),
        preAddFriend: async (message) => await hubProxy.invoke('PreAddFriend', message),
        removeGroupMember: async (message) => await hubProxy.invoke('RemoveGroupMember', message),
        sendChat: async (message) => await hubProxy.invoke('SendChat', message),
        setReadMessage: async (message) => await hubProxy.invoke('SetReadMessage', message),
        csService_Accept: async (message) => await hubProxy.invoke('CSService_Accept', message),
        csService_Chat: async (message) => await hubProxy.invoke('CSService_Chat', message),
        csService_Forwarding: async (message) => await hubProxy.invoke('CSService_Forwarding', message),
        csService_Leave: async (message) => await hubProxy.invoke('CSService_Leave', message),
        csService_Reject: async (message) => await hubProxy.invoke('CSService_Reject', message),
        csUser_Chat: async (message) => await hubProxy.invoke('CSUser_Chat', message),
        csUser_Enter: async (message) => await hubProxy.invoke('CSUser_Enter', message),
        csUser_Leave: async (message) => await hubProxy.invoke('CSUser_Leave', message),
        csUser_Request: async (message) => await hubProxy.invoke('CSUser_Request', message),
    }

    // 客户端事件
    static events = {
        off: (owner) => unregistEvents(owner),
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
        onKickOff: (owner, callback) => registEvent(owner, 'OnKickOff', callback),
    }
}