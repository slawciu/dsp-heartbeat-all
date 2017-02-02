import React from 'react'
import _ from 'underscore'
import { ListGroupItem, Grid, Col, Button } from 'react-bootstrap';
export default class BlogItem extends React.Component {
    _getTitle(posts) {
        if (this.props.blog.details.posts.length === 0) {
            return '';
        }
        return _.last(_.sortBy(this.props.blog.details.posts, 'publishDate')).title;
    }

    _getDajSiePoznacItems() {
        return this.props.blog.details.dspPosts;
    }

    render (){
        return (<ListGroupItem bsStyle='success'>
                    <Grid>
                        <Col xs={8} md={10}>
                            <p><b>Blog Title: {this.props.blog.details.title}</b></p>
                            <div>Posts: {this.props.blog.details.posts.length} <b>#dajsiepoznac: { this._getDajSiePoznacItems() }</b></div>
                            <div>Last Post Date: {this.props.blog.details.lastPostDate}</div>
                            <div>Last Post Title: {this._getTitle(this.props.blog.details.posts)}</div>
                        </Col>	
                        <Col xs={1} md={1}>
                            <Button className='listItemButton' bsSize='large' key={ this.props.keyForButton + 20 } bsStyle='warning' href={this.props.blog.details.feedUrl}><i className='icon ion-social-rss'/></Button>
                            <div/>
                            <Button className='listItemButton' bsSize='large' key={ this.props.keyForButton + 10 } bsStyle='success' href={this.props.blog.link}><i className='ion-arrow-right-a'/></Button>
                        </Col>
                    </Grid>
                </ListGroupItem>)
    }
}