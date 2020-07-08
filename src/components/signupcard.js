import React, { Component } from "react";

import Logo from ".././images/cow.jpg";

import { Button } from "antd";
//import { Divider } from "antd";
import { Card } from "antd";
import { Input, Tooltip, Icon } from "antd";

class SignupCard extends Component {
  state = {
    name: "",
    username: "",
    email: "",
    password: "",
    conpassword: ""
  };
  render() {
    return (
      <div className="signupCard" style={{ width: "100%", height: "100%" }}>
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
            placeholder="Enter your fullname"
            size="large"
            onInput={event => {
              var newState = { ...this.state };
              newState.name = event.target.value;
              this.setState(newState);
              //this.props.getCredentials(newState);
            }}
          />
          <br />
          <br />
          <Input
            placeholder="Enter your email address"
            onInput={event => {
              var newState = { ...this.state };
              newState.email = event.target.value;
              this.setState(newState);
              //this.props.getCredentials(newState);
            }}
            size="large"
          />
          <br />
          <br />
          <Input
            placeholder="Enter a username"
            size="large"
            onInput={event => {
              var newState = { ...this.state };
              newState.username = event.target.value;
              this.setState(newState);
              //this.props.getCredentials(newState);
            }}
            suffix={
              <Tooltip title="username should be unique">
                <Icon type="info-circle" style={{ color: "rgba(0,0,0,.45)" }} />
              </Tooltip>
            }
          />
          <br />
          <br />

          <Input
            type="password"
            size="large"
            onInput={event => {
              var newState = { ...this.state };
              newState.password = event.target.value;
              this.setState(newState);
              //this.props.getCredentials(newState);
            }}
            placeholder="input password"
          />
          <br />
          <br />
          <Input
            type="password"
            size="large"
            onInput={event => {
              var newState = { ...this.state };
              newState.conpassword = event.target.value;
              this.setState(newState);
              //this.props.getCredentials(newState);
            }}
            placeholder="confirm password"
          />

          <br />
          <br />
          <br />
          <Button
            type="primary"
            size="large"
            onClick={event => {
              this.props.handleSignup(this.state);
            }}
            block
          >
            Signup
          </Button>
          <p style={{ marginTop: "5px" }}>
            Already have an account?<a href="/login">login</a>
          </p>
          <br />
          <br />
        </Card>
      </div>
    );
  }
}

export default SignupCard;
