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
    dspHub.on('updateBlogPosts', function(blogPost) {
        console.log(blogPost.time);
    });

    connection.start()
        .done(function(){ 
          console.log('Now connected, connection ID=' + connection.id); 
          this.dspHub.invoke('blogPostReceived',{time: new Date()});
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
