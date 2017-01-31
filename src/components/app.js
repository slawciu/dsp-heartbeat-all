import React from 'react'
import 'expose-loader?jQuery!jquery';
import signalR from '../../node_modules/signalr/jquery.signalR.js';
import $ from 'jquery'
import _ from 'underscore'
import BlogItem from './blogItem.js'
import { ListGroup, ProgressBar, Label } from 'react-bootstrap';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    var dspHub;
    this.state = {
      blogs: []
    }
  }

  componentDidMount() {
    var connection = $.hubConnection();
    var dspHub = connection.createHubProxy('dspHub');
    this.dspHub = dspHub;
    dspHub.on('updateBlogPosts', function(blogs) {
      var blogList = [];
      Object.keys(blogs).forEach(function(key) {
        blogList.push({link: key, details: blogs[key]})
      })
        this.setState({
          blogs: blogList
        })
    }.bind(this));

    dspHub.on('broadcasted', function(args){
      console.log('broadcast args: ' + args);
    })

    connection.start()
        .done(function(){ 
          this.dspHub.invoke('blogPostReceived');
          setInterval(function(){
            this.dspHub.invoke('broadcast');
          }.bind(this), 10000)
        }.bind(this))
        .fail(function(){ console.log('Could not connect'); });
      }

  render () {
    var blogs = this.state.blogs.map(function(blog){
      return <BlogItem key={blog.link} blog={blog} />
      
    })
    return (
      <div>
        #dspHeartbeat
        <ListGroup>
          {blogs}
        </ListGroup>
      </div>
    )
  }
}
