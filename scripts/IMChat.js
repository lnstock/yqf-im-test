import React, { Component } from 'react';
import { IMServer, ConnectionState } from './yqf-im/index'

export default class IMChat extends Component {
    componentDidMount() {
        console.log(IMServer.connectionState);
    }

    render(){
        return <div>IMChatIMChatIMChat</div>
    }
}