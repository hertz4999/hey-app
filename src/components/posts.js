import React, { Component } from "react";
import { Skeleton, Switch, Card, Icon, Avatar } from "antd";

const { Meta } = Card;

class Post extends React.Component {
  state = {
    loading: true
  };

  onChange = checked => {
    this.setState({ loading: !checked });
  };

  render() {
    const { loading } = this.state;

    return (
      <div>
        <Card
          style={{ width: 300, marginTop: 16 }}
          actions={[
            <Icon type="heart" key="like" />,
            <Icon type="message" key="comment" />,
            <Icon type="rocket" key="send" />
          ]}
        >
          <Skeleton loading={loading} avatar active>
            <Meta
              avatar={
                <Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />
              }
              title={this.props.user.username}
              description={this.props.post.timeStamp}
            />
            {this.props.post.content}
          </Skeleton>
        </Card>
      </div>
    );
  }
}

export default Post;
