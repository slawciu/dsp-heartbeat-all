import React from 'react'
import 'expose-loader?jQuery!jquery';
import signalR from '../../node_modules/signalr/jquery.signalR.js';
import $ from 'jquery'

export default class App extends React.Component {
  constructor(props) {
    super(props);
    var dspHub;
    
  }

  componentDidMount() {
    var connection = $.hubConnection();
    connection.logging = true;
    var dspHub = connection.createHubProxy('dspHub');
    this.dspHub = dspHub;
    dspHub.on('updateBlogPosts', function(blogPosts) {
        console.log(blogPosts);
    });

    dspHub.on('broadcasted', function(args){
      console.log('broadcast args: ' + args);
    })

    connection.start()
        .done(function(){ 
          console.log('Now connected, connection ID=' + connection.id); 
          setInterval(function(){
            this.dspHub.invoke('broadcast','from client');
          }.bind(this), 10000)
        }.bind(this))
        .fail(function(){ console.log('Could not connect'); });
      }

  render () {
    return (
      <div>
        #dspHeartbeat
      </div>
    )
  }
}
