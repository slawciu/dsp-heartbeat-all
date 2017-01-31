import React from 'react'
import _ from 'underscore'

export default class BlogItem extends React.Component {
    render (){
        return (<li>{this.props.blog.details.title} <a href={this.props.blog.details.feedUrl}>RSS</a> <a href={this.props.blog.link}>Ostatni post</a> { _.first(this.props.blog.details.posts).publishDate } </li>)
    }
}