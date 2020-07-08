import React, { Component } from "react";
import {
  Badge,
  Menu,
  Button,
  Comment,
  Form,
  List,
  Modal,
  Icon,
  Layout,
  Input,
  Card,
  Col,
  Row,
  Avatar,
  Skeleton,
  Upload,
  AutoComplete,
} from "antd";

import "./css/home.css";

const { Option } = AutoComplete;

const { Header, Content } = Layout;

const { Search } = Input;

const { TextArea } = Input;

const { SubMenu } = Menu;

const { Meta } = Card;

const axios = require("axios");

function searchResult(value, token) {
  return axios({
    method: "get",
    url: "http://localhost:9000/users/searchQuery/" + value,
    headers: { "x-auth": token },
  }).then((response) => {
    console.log(response.data);
    return response.data;
  });
}

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: this.props.location.state.token,
      bio: "",
      newBio: "",
      profilePic: "",
      profileModalVisible: false,
      posts: [],
      likedPosts: [],
      newCommentDataPosts: [],
      visibleComments: [],
      username: "",
      follow_req_recieved: [],
      searchDataSource: [],
      newPostText: "",
      previewVisible: false,
      previewImage: "",
      profileFileList: [],
      fileList: [],
    };
    this.logout = this.logout.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.handleNewPostText = this.handleNewPostText.bind(this);
    this.renderOption = this.renderOption.bind(this);
    this.sendFollowRequest = this.sendFollowRequest.bind(this);
    this.acceptFollowRequest = this.acceptFollowRequest.bind(this);
    this.declineFollowRequest = this.declineFollowRequest.bind(this);
    this.deleteFollowRequest = this.deleteFollowRequest.bind(this);
    this.addPost = this.addPost.bind(this);
    this.likePost = this.likePost.bind(this);
    this.handleCommentInputChange = this.handleCommentInputChange.bind(this);
    this.handleCommentSubmit = this.handleCommentSubmit.bind(this);
    this.loadMoreComments = this.loadMoreComments.bind(this);
    this.profileEdit = this.profileEdit.bind(this);
  }

  componentDidMount() {
    axios({
      method: "get",
      url: "http://localhost:9000/users/landingPageData",
      headers: { "x-auth": this.props.location.state.token },
    })
      .then((response) => {
        var lPost = [];
        var visibleComments = [];
        response.data.postsa.forEach((el, i) => {
          visibleComments[i] = 3;
          el.likes.forEach((element) => {
            if (element.username === response.data.username) {
              lPost[i] = 1;
            }
          });
        });
        this.setState({
          posts: response.data.postsa,
          username: response.data.username,
          follow_req_recieved: response.data.follow_req_recieved,
          bio: response.data.bio,
          newBio: response.data.bio,
          profilePic: response.data.profilePic,
          likedPosts: lPost,
          visibleComments,
        });
        console.log(this.state);
      })
      .catch((e) => {
        console.log(e);
      });
  }

  showProfileModal = () => {
    this.setState({
      profileModalVisible: true,
    });
  };

  hideProfileModal = () => {
    this.setState({
      profileModalVisible: false,
    });
  };

  profileEdit() {
    var payload = new FormData();

    payload.append("img", this.state.profileFileList[0].originFileObj);
    payload.append("bio", this.state.newBio);

    axios({
      method: "post",
      url: "http://localhost:9000/users/profileEdit",
      headers: { "x-auth": this.state.token },
      data: payload,
    }).then((response) => {
      alert(response.data);
      this.setState({ bio: this.state.newBio });
    });
  }

  renderOption(item) {
    return (
      <Option key={item.username} text={item.username}>
        <div className="global-search-item">
          <span className="global-search-item-desc">
            {item.username}{" "}
            <Button
              type={item.status === "follow" ? "primary" : ""}
              size="small"
              onClick={
                item.status === "follow"
                  ? () => {
                      this.sendFollowRequest(item.username);
                    }
                  : item.status === "req sent"
                  ? () => {
                      this.deleteFollowRequest(item.username);
                    }
                  : ""
              }
            >
              {item.status}
            </Button>
          </span>
        </div>
      </Option>
    );
  }

  logout() {
    axios({
      method: "post",
      url: "http://localhost:9000/users/logout",
      headers: { "x-auth": this.state.token },
    })
      .then((response) => {
        this.props.history.push("/login");
      })
      .catch((e) => {
        console.log(e);
      });
  }

  deleteFollowRequest(name) {
    axios({
      method: "delete",
      url: "http://localhost:9000/users/deleteFollowRequest/" + name,
      headers: { "x-auth": this.state.token },
    })
      .then((response) => {
        var nstate = { ...this.state };
        nstate.searchDataSource.forEach((el) => {
          if (el.username === name) {
            el.status = "follow";
          }
        });
        this.setState(nstate);
      })
      .catch((e) => {
        console.log(e);
      });
  }

  sendFollowRequest(name) {
    axios({
      method: "post",
      url: "http://localhost:9000/users/sendFollowRequest/" + name,
      headers: { "x-auth": this.state.token },
    })
      .then((response) => {
        var nstate = { ...this.state };
        nstate.searchDataSource.forEach((el) => {
          if (el.username === name) {
            el.status = "req sent";
          }
        });
        this.setState(nstate);
      })
      .catch((e) => {
        console.log(e);
      });
  }

  acceptFollowRequest(name) {
    axios({
      method: "post",
      url: "http://localhost:9000/users/acceptFollowRequest/" + name,
      headers: { "x-auth": this.state.token },
    }).then((response) => {
      console.log(response.data);
      if (response.status === 200) {
        let followRequests = [...this.state.follow_req_recieved];
        var nState = { ...this.state };
        nState.follow_req_recieved = followRequests.filter((element) => {
          return element.username !== name;
        });
        this.setState(nState);
      } else {
        alert("something went wrong");
      }
    });
  }

  declineFollowRequest(name) {
    axios({
      method: "post",
      url: "http://localhost:9000/users/declineFollowRequest/" + name,
      headers: { "x-auth": this.state.token },
    }).then((response) => {
      console.log(response.data);
      if (response.status === 200) {
        let followRequests = [...this.state.follow_req_recieved];
        var nState = { ...this.state };
        nState.follow_req_recieved = followRequests.filter((element) => {
          return element.username !== name;
        });
        this.setState(nState);
      } else {
        alert("something went wrong");
      }
    });
  }

  handleSearch(value) {
    var nState = { ...this.state };
    searchResult(value, this.props.location.state.token).then((result) => {
      nState.searchDataSource = value ? result : [];
      this.setState(nState);
    });
  }

  handleNewPostText(e) {
    this.setState({ newPostText: e.target.value });
  }

  addPost() {
    var content = this.state.newPostText;
    var payload = new FormData();
    payload.append("content", content);
    payload.append("img", this.state.fileList[0].originFileObj);

    axios({
      method: "post",
      url: "http://localhost:9000/users/addPost",
      headers: { "x-auth": this.state.token },
      data: payload,
    }).then((response) => {
      alert(response.data);
      this.setState({ newPostText: "" });
    });
  }
  handleCancel = () => this.setState({ previewVisible: false });

  handlePreview = (file) => {
    this.setState({
      previewImage: file.thumbUrl,
      previewVisible: true,
    });
  };
  handleUpload = ({ fileList }) => {
    console.log("fileList", fileList);

    this.setState({ fileList });
  };
  handleProfileUpload = ({ fileList }) => {
    console.log("fileList", fileList);

    this.setState({ profileFileList: fileList });
  };

  likePost(k) {
    //console.log(k);

    axios({
      method: "post",
      url: "http://localhost:9000/users/likePost",
      headers: { "x-auth": this.state.token },
      data: {
        postid: this.state.posts[k]._id,
        username: this.state.posts[k].username,
      },
    }).then(() => {
      var lPosts = [...this.state.likedPosts];
      var likeFlag = 0;
      var post = this.state.posts[k];
      post.likes.forEach((element) => {
        if (element.username === this.state.username) {
          likeFlag = 1;
        }
      });
      if (likeFlag === 0) {
        post.likes.push({ username: this.state.username, time: new Date() });
        lPosts[k] = 1;
      } else {
        var arr = post.likes;
        for (var i = 0; i < arr.length; i++) {
          if (arr[i].username === this.state.username) {
            arr.splice(i, 1);
          }
        }
        lPosts[k] = 0;
      }

      this.setState({
        posts: this.state.posts,
        likedPosts: lPosts,
      });
    });
  }

  handleCommentInputChange(i, value) {
    var newCommentArr = [...this.state.newCommentDataPosts];
    newCommentArr[i] = value;
    this.setState({ newCommentDataPosts: newCommentArr });
  }
  handleCommentSubmit(k) {
    axios({
      method: "post",
      url: "http://localhost:9000/users/commentOnPost",
      headers: { "x-auth": this.state.token },
      data: {
        postid: this.state.posts[k]._id,
        content: this.state.newCommentDataPosts[k],
      },
    }).then(() => {
      var nposts = [...this.state.posts];
      nposts[k].comments.push({
        username: this.state.username,
        time: new Date(),
        content: this.state.newCommentDataPosts[k],
      });

      this.setState({ posts: nposts });
    });
  }
  loadMoreComments(i) {
    var arr = { ...this.state.visibleComments };
    this.state.posts[i].comments.length - arr[i] >= 3
      ? (arr[i] += 3)
      : (arr[i] = this.state.posts[i].comments.length);
    this.setState({ visibleComments: arr });
  }
  render() {
    const { searchDataSource } = this.state;

    return (
      <Layout>
        <Header className="cover">
          <div className="logo" />
          <div className="Search" style={{ width: 500 }}>
            <AutoComplete
              // className="global-search"
              // size="medium"
              style={{ width: "100%" }}
              dataSource={searchDataSource.map(this.renderOption)}
              onSelect={(val) => {
                console.log("selected");
              }}
              onSearch={this.handleSearch}
              placeholder="input here"
              optionLabelProp="text"
            >
              <Search
                // placeholder="input search text"
                style={{ width: "100%" }}
                onSearch={(value) => console.log(value)}
                enterButton
              />
              {/* <Input
                suffix={
                  <Button
                    className="search-btn"
                    style={{ marginRight: -12 }}
                    size="large"
                    type="primary"
                  >
                    <Icon type="search" />
                  </Button>
                }
              /> */}
            </AutoComplete>
          </div>
          <Menu mode="horizontal" style={{ lineHeight: "64px" }}>
            <Menu.Item
              key="logout"
              style={{ float: "right" }}
              onClick={this.logout}
            >
              <Icon type="logout" style={{ fontSize: 20 }} />
            </Menu.Item>

            <SubMenu
              title={
                <Badge count={4}>
                  <Icon type="notification" style={{ fontSize: 20 }} />
                </Badge>
              }
              style={{ float: "right" }}
            >
              <Menu.Item key="setting:1">Option 1</Menu.Item>
              <Menu.Item key="setting:2">Option 2</Menu.Item>

              <Menu.Item key="setting:3">Option 3</Menu.Item>
              <Menu.Item key="setting:4">Option 4</Menu.Item>
            </SubMenu>
            <SubMenu
              title={
                <Badge count={this.state.follow_req_recieved.length}>
                  <Icon type="user-add" style={{ fontSize: 20 }} />
                </Badge>
              }
              style={{ float: "right" }}
            >
              {this.state.follow_req_recieved.length ? (
                this.state.follow_req_recieved.map((element, i) => {
                  return (
                    <Menu.Item key={i} selectable="false">
                      {element.username}{" "}
                      <Button
                        type="primary"
                        size="small"
                        // style={{ float: "right" }}
                        onClick={() => {
                          this.acceptFollowRequest(element.username);
                        }}
                      >
                        accept
                      </Button>
                      <Button
                        type="danger"
                        size="small"
                        // style={{ float: "right" }}
                        onClick={() => {
                          console.log("anfedjafnf");
                          this.declineFollowRequest(element.username);
                        }}
                      >
                        decline
                      </Button>
                    </Menu.Item>
                  );
                })
              ) : (
                <Menu.Item key="-1">NO Follow Requests</Menu.Item>
              )}
            </SubMenu>
          </Menu>
        </Header>
        <Content style={{ padding: "0 50px" }}>
          <div style={{ padding: "30px" }}>
            <Row gutter={16}>
              <Col span={8}></Col>
              <Col span={8}>
                <Card
                  title="ADD POST"
                  bordered={false}
                  actions={[
                    <Icon
                      type="check"
                      onClick={this.addPost}
                      style={{ fontSize: 20 }}
                    />,

                    <Icon type="close" style={{ fontSize: 20 }} />,
                  ]}
                  style={{ marginBottom: 20 }}
                  bodyStyle={{ padding: 0 }}
                >
                  <TextArea
                    rows={4}
                    value={this.state.newPostText}
                    onChange={this.handleNewPostText}
                  />
                  <Upload
                    listType="picture-card"
                    fileList={this.state.fileList}
                    //onPreview={this.handlePreview}
                    onChange={this.handleUpload}
                    beforeUpload={() => false} // return false so that antd doesn't upload the picture right away
                  >
                    <div>
                      <div className="ant-upload-text">Upload</div>
                    </div>
                  </Upload>
                </Card>

                {this.state.posts.length ? (
                  this.state.posts.map((post, i) => {
                    return (
                      <div key={post._id}>
                        <Card
                          title={post.username}
                          bordered={false}
                          actions={[
                            <span>
                              <Icon
                                type="like"
                                onClick={() => {
                                  this.likePost(i);
                                }}
                                style={{ fontSize: 20 }}
                                theme={
                                  this.state.likedPosts[i] === 1
                                    ? "twoTone"
                                    : ""
                                }
                              />
                              {post.likes.length}
                            </span>,
                            <span>
                              <Icon type="message" style={{ fontSize: 20 }} />
                              {" " + post.comments.length}
                            </span>,
                            <Icon
                              type="ellipsis"
                              style={{ fontSize: 20 }}
                              key="ellipsis"
                            />,
                          ]}
                          style={{ marginBottom: 0 }}
                        >
                          {post.content}
                          <br />
                          <br />
                          <img
                            src={"http://localhost:9000" + post.img}
                            alt="Smiley face"
                            width="100%"
                          />
                        </Card>

                        {post.comments.length > 0 && (
                          <List
                            className="comment-list"
                            header={
                              <Button
                                onClick={() => {
                                  this.loadMoreComments(i);
                                }}
                              >
                                load more comments
                              </Button>
                            }
                            itemLayout="horizontal"
                            dataSource={
                              post.comments.length >= 3
                                ? post.comments.slice(
                                    post.comments.length -
                                      this.state.visibleComments[i]
                                  )
                                : post.comments
                            }
                            renderItem={(item) => (
                              <li>
                                <Comment
                                  actions={[
                                    <span key={"DADADA"}>Reply to</span>,
                                  ]}
                                  author={item.username}
                                  avatar="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"
                                  content={item.content}
                                  datetime={item.time.toString()}
                                />
                              </li>
                            )}
                          />
                        )}
                        <Comment
                          avatar={
                            <Avatar
                              src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"
                              alt="Han Solo"
                            />
                          }
                          content={
                            <div>
                              <Form.Item>
                                <Input
                                  onChange={(e) => {
                                    this.handleCommentInputChange(
                                      i,
                                      e.target.value
                                    );
                                  }}
                                />
                              </Form.Item>
                              <Form.Item>
                                <Button
                                  htmlType="submit"
                                  onClick={() => {
                                    this.handleCommentSubmit(i);
                                  }}
                                  type="primary"
                                >
                                  Add Comment
                                </Button>
                              </Form.Item>
                            </div>
                          }
                        />
                      </div>
                    );
                  })
                ) : (
                  <Card
                    bordered={false}
                    actions={[
                      <Icon type="like" style={{ fontSize: 20 }} />,
                      <Icon type="message" style={{ fontSize: 20 }} />,
                      <Icon
                        type="ellipsis"
                        style={{ fontSize: 20 }}
                        key="ellipsis"
                      />,
                    ]}
                    style={{ marginBottom: 20 }}
                  >
                    NO POSTS
                  </Card>
                )}
                <Card
                  title="Card title"
                  bordered={false}
                  actions={[
                    <Icon type="like" style={{ fontSize: 20 }} />,
                    <Icon type="message" style={{ fontSize: 20 }} />,
                    <Icon
                      type="ellipsis"
                      style={{ fontSize: 20 }}
                      key="ellipsis"
                    />,
                  ]}
                  style={{ marginBottom: 20 }}
                >
                  Card content
                </Card>
                <Card
                  title="Card title"
                  bordered={false}
                  actions={[
                    <Icon type="like" style={{ fontSize: 20 }} />,
                    <Icon type="message" style={{ fontSize: 20 }} />,
                    <Icon
                      type="ellipsis"
                      style={{ fontSize: 20 }}
                      key="ellipsis"
                    />,
                  ]}
                  style={{ marginBottom: 20 }}
                >
                  Card content
                </Card>
                <Card
                  title="Card title"
                  bordered={false}
                  actions={[
                    <Icon type="like" style={{ fontSize: 20 }} />,
                    <Icon type="message" style={{ fontSize: 20 }} />,
                    <Icon
                      type="ellipsis"
                      style={{ fontSize: 20 }}
                      key="ellipsis"
                    />,
                  ]}
                  style={{ marginBottom: 20 }}
                >
                  Card content
                </Card>
                <Card
                  title="Card title"
                  bordered={false}
                  actions={[
                    <Icon type="like" style={{ fontSize: 20 }} />,
                    <Icon type="message" style={{ fontSize: 20 }} />,
                    <Icon
                      type="ellipsis"
                      style={{ fontSize: 20 }}
                      key="ellipsis"
                    />,
                  ]}
                  style={{ marginBottom: 20 }}
                >
                  Card content
                </Card>
                <Card
                  title="Card title"
                  bordered={false}
                  actions={[
                    <Icon type="like" style={{ fontSize: 20 }} />,
                    <Icon type="message" style={{ fontSize: 20 }} />,
                    <Icon
                      type="ellipsis"
                      style={{ fontSize: 20 }}
                      key="ellipsis"
                    />,
                  ]}
                  style={{ marginBottom: 20 }}
                >
                  Card content
                </Card>
              </Col>
              <Col span={8}>
                <Card
                  style={{ width: "75%", marginTop: 0, marginLeft: 30 }}
                  actions={[
                    <Icon type="setting" key="setting" />,
                    <Icon type="edit" key="edit" />,
                    <div>
                      <Icon
                        type="ellipsis"
                        key="ellipsis"
                        onClick={this.showProfileModal}
                      />
                      <Modal
                        visible={this.state.profileModalVisible}
                        title="Title"
                        onOk={this.profileEdit}
                        onCancel={this.hideProfileModal}
                        footer={[
                          <Button key="back" onClick={this.hideProfileModal}>
                            Return
                          </Button>,
                          <Button
                            key="submit"
                            type="primary"
                            onClick={this.profileEdit}
                          >
                            Submit
                          </Button>,
                        ]}
                      >
                        <Input
                          placeholder="BIO"
                          prefix={<Icon type="user" key="user" />}
                          value={this.state.newBio}
                          onChange={(e) => {
                            this.setState({ newBio: e.target.value });
                          }}
                        />
                        <br />
                        <br />
                        <p>Select a Profile Picture:</p>
                        <br />
                        <br />
                        <Upload
                          listType="picture-card"
                          fileList={this.state.profileFileList}
                          onChange={this.handleProfileUpload}
                          beforeUpload={() => false}
                        >
                          {this.state.profileFileList.length > 0 ? null : (
                            <div>
                              <Icon type="plus" />
                              <div className="ant-upload-text">Upload</div>
                            </div>
                          )}
                        </Upload>
                      </Modal>
                    </div>,
                  ]}
                >
                  <Skeleton loading={false} avatar active>
                    <Meta
                      avatar={
                        <Avatar
                          alt="dada"
                          src={
                            "http://localhost:9000/profilePic/ld_bambs.png" ||
                            "https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"
                          }
                        />
                      }
                      title={this.state.username}
                      description={this.state.bio || "NO BIO"}
                    />
                  </Skeleton>
                </Card>
              </Col>
            </Row>
          </div>
        </Content>
      </Layout>
    );
  }
}
