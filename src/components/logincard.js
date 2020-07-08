import React, { Component } from "react";

import Logo from ".././images/cow.jpg";

import { Button } from "antd";
import { Divider } from "antd";
import { Card } from "antd";
import { Input, Tooltip, Icon } from "antd";

class LoginCard extends Component {
  state = {
    username: "",
    password: ""
  };
  render() {
    return (
      <div className="loginCard" style={{ width: "100%", height: "100%" }}>
        <Card style={{ width: "100%", height: "100%" }}>
          <img
            src={Logo}
            alt=""
            style={{
              width: "60x",
              height: "60px",
              marginLeft: "38%",
              marginBottom: "30px"
            }}
          />
          <Input
            placeholder="Email or username"
            size="large"
            onInput={event => {
              var newState = { ...this.state };
              newState.username = event.target.value;
              this.setState(newState);
              this.props.getCredentials(newState.username, this.state.password);
            }}
            prefix={<Icon type="user" style={{ color: "rgba(0,0,0,.25)" }} />}
            suffix={
              <Tooltip title="Extra information">
                <Icon type="info-circle" style={{ color: "rgba(0,0,0,.45)" }} />
              </Tooltip>
            }
          />
          <br />
          <br />
          <Input.Password
            onInput={event => {
              var newState = { ...this.state };
              newState.password = event.target.value;
              this.setState(newState);
              this.props.getCredentials(this.state.username, newState.password);
            }}
            size="large"
            placeholder="input password"
            prefix={<Icon type="lock" style={{ color: "rgba(0,0,0,.25)" }} />}
          />
          <div href="" style={{ textAlign: "right" }}>
            <a href="https://www.google.com">forgot Password?</a>
          </div>
          <br />
          <br />
          <br />
          <Button
            type="primary"
            size="large"
            onClick={event => {
              this.props.handleLogin();
            }}
            block
          >
            Login
          </Button>
          <p href="" style={{ padding: 0, margin: 0, textAlign: "right" }}>
            New Here? <a href="/signup">Signup</a>
          </p>
          <br />
          <Divider>or</Divider>
          <br />
          <Button type="default" size="large" block>
            <Icon type="google" size="large" />
            Login with Google
          </Button>
          <br />
          <br />
          <Button type="default" size="large" block>
            <Icon type="facebook" size="large" />
            Login with Facebook
          </Button>
        </Card>
      </div>
    );
  }
}

export default LoginCard;
