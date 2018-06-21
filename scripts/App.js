import React, { Component } from 'react';
import xservice from 'yqf-xservice'
import { IMServer, ConnectionState } from './yqf-im/index'
import IMChat from './IMChat'
import upyun from './upyun'

// const _servingClient = xservice.servingClient('https://api2.yqfws.com/', '100008', '541a7f9b49f1b2a1')
const _servingClient = xservice.servingClient('http://localhost:20000/', '100008', '541a7f9b49f1b2a1')
let path

function getHeaderSign(bucket, method) {
    return new Promise((resolve,reject)=>{
        resolve({"Authorization":"UPYUN yiqifei:mCOC4tgfhsR1HWPWSYJw6RLaD6g=","X-Date":"Thu, 21 Jun 2018 17:31:31 GMT"})
    })
    // var args = {
    //     bucket: bucket.bucketName,
    //     method: method,
    //     path: path
    // }

    // return _servingClient.invoke('Base.UpyunSign', args).then(result => {
    //     return {
    //         'Authorization': result.Authorization,
    //         'X-Date': result.XDate
    //     }
    // })

    // var result = await _servingClient.invoke('Base.UpyunSign', args)
    // return {
    //     'Authorization': result.Authorization,
    //     'X-Date': result.XDate
    // }
}

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

    }

    componentWillUnmount() {

    }

    upload() {
        var file = this.refs.file

        var bucket = new upyun.Bucket('sitegroup')
        var client = new upyun.Client(bucket, getHeaderSign)

        path = '/sample-upload-' + file.name

        client.putFile(path, file).then(function (result) {
            console.log('put file to upyun ' + (result ? 'success' : 'failed'))
        })
    }

    render() {
        return (
            // Add your component markup and other subcomponent references here.
            <div>
                <input type='file' />
                <br />
                <input ref='file' type='button' value='上传' onClick={() => this.upload()} />
            </div>
        );
    }
}
