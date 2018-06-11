import React, { Component } from 'react';
import xservice from 'yqf-xservice'
import { IMServer, ConnectionState } from './yqf-im/index'
import IMChat from './IMChat'

let _servingClient = xservice.servingClient('https://api2.yqfws.com/', '100008', '541a7f9b49f1b2a1')

async function getToken(userCode) {
    var req = {
        Platform: 'MobileDevice',
        Source: 'react im test',
        UserCode: userCode
    }
    var rsp = await _servingClient.invoke('IM.GetToken', req)
    return rsp.Token
}

export default class App extends Component {
    async componentDidMount() {
        console.log(IMServer.connectionState);

        // IMServer.setConfig({
        //     imServerUrl: 'https://im.yiqifei.com/',
        //     xserviceServerUrl: 'https://api2.yqfws.com/',
        //     xserviceAppKey: '100008',
        //     xserviceAppSecret: '541a7f9b49f1b2a1',
        //     onGetCurrentUser: ()=>'JAN00H4C'
        // })

        var token = await getToken('JAN00H4C')
        await IMServer.start(token)

        IMServer.events.onConnectionStateChanged(this, function(){
            console.log('stateChanged:' + IMServer.connectionState)
        })

        IMServer.events.onChat(this, function(message){
            
        });

        
        var user = await IMServer.methods.getLoginUser()
        console.log(user)
    }

    componentWillUnmount() {
        IMServer.events.off(this);
    }

    render() {
        return (
            // Add your component markup and other subcomponent references here.
            <IMChat></IMChat>
        );
    }
}
