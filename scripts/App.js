import React, { Component } from 'react';
import { IMServer } from './imServer'

export default class App extends Component {
    async componentDidMount() {
        await IMServer.start('JAN00H4C')
        var user = await IMServer.methods.getLoginUser()
        console.log(user)

        IMServer.events.onChat(this, function(message){
            console.log(message);
        });
    }

    componentWillUnmount() {
        IMServer.events.off(this);
    }

    render() {
        return (
            // Add your component markup and other subcomponent references here.
            <h1>Hello, Worl2d!</h1>
        );
    }
}
