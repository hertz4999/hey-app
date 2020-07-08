import { Row, Col } from "antd";
import React, { Component } from "react";
import LoginCard from "./logincard";

const axios = require("axios");

export default class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
      email: ""
    };
    this.handleCredentials = this.handleCredentials.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
  }

  validateEmail(email) {
    var re = /[a-z0-9]*@[a-z][a-z]*.com/;
    return re.test(String(email).toLowerCase());
  }

  handleCredentials(userName, pass) {
    var newState = { ...this.state };
    if (this.validateEmail(userName)) {
      newState.email = userName;
      newState.username = null;
    } else {
      newState.username = userName;
      newState.email = null;
    }

    newState.password = pass;
    this.setState(newState);
  }

  handleLogin() {
    var apiBaseUrl = "http://localhost:9000/users/login";
    var payload = this.state;
    axios
      .post(apiBaseUrl, payload)
      .then(response => {
        if (response.status === 200) {
          alert("Login successfull");
          this.props.history.push("/home", {
            token: response.headers["x-auth"]
          });
        } else if (response.status === 204) {
          console.log("Username or password do not match");
          alert("username or password do not match");
        } else {
          console.log("Username does not exists");
          alert("Username does not exist");
        }
      })
      .catch(function(error) {
        console.log(error);
      });
  }

  render() {
    return (
      <div className="login" style={{ background: "#ECECEC", padding: "30px" }}>
        <Row>
          <Col span={6}></Col>
          <Col span={6}></Col>
          <Col span={6} style={{ height: "100%" }}>
            <LoginCard
              registerPage={this.props.registerPage}
              handleLogin={this.handleLogin}
              getCredentials={this.handleCredentials}
            />
          </Col>
          <Col span={6}></Col>
        </Row>
      </div>
    );
  }
}
