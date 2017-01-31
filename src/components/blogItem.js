import React from 'react'
import _ from 'underscore'
import { ListGroupItem, Grid, Col, Button } from 'react-bootstrap';
export default class BlogItem extends React.Component {
    _getLastPostDate() {
        return _.last(_.sortBy(this.props.blog.details.posts, 'publishDate')).publishDate;
    }

    _getTitle(posts) {
        return _.last(_.sortBy(this.props.blog.details.posts, 'publishDate')).title;
    }

    _getDajSiePoznacItems() {
        var count = 0;

        this.props.blog.details.posts.forEach(function(post){
            var dajSiePoznac = false;
            post.categories.forEach(function(category){
                if (category.search('ozna')) {
                    dajSiePoznac = true;
                }
            });
            count++;
        });

        return count;
    }

    render (){
        return (<ListGroupItem bsStyle='success'>
                    <Grid>
                        <Col xs={8} md={8}>
                            <p><b>Blog Title: {this.props.blog.details.title}</b></p>
                            <div>Posts: {this.props.blog.details.posts.length} <b>#dajsiepoznac: { this._getDajSiePoznacItems() }</b></div>
                            <div>Last Post Date: { this._getLastPostDate() }</div>
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