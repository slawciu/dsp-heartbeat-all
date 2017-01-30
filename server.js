const path = require('path')
const express = require('express')
const SignalRJS = require('signalrjs')

const $ = require('jquery')

module.exports = {
  app: function () {
    const signalR = SignalRJS();
    const app = express()
    const indexPath = path.join(__dirname, 'index.html')
    const publicPath = express.static(path.join(__dirname, 'public'))

    signalR.hub('dspHub', {
      blogPostReceived: function(blogPost) {
        this.clients.all.invoke('updateBlogPosts').withArgs([blogPost]);
        console.log('blogPostReceived: ' + blogPost);
      }
    });

    signalR.on('CONNECTED',function(){
        console.log('connected');
        setInterval(function () {
            console.log('blogPostReceived');
            var dspHub = $.hubConnection().createHubProxy('dspHub');
            dspHub.invoke('blogPostReceived').withArgs([{time: new Date()}]);
        }.bind(this),1000)
    });

    app.use(signalR.createListener())
    app.use('/signalr/hubs', express.static(path.join(__dirname, 'signalr')))
    app.use('/public', publicPath)
    app.get('/', function (_, res) { res.sendFile(indexPath) })

    return app
  }
}
