import { Row, Col } from "antd";
import React, { Component } from "react";

import SignupCard from "./signupcard";

const axios = require("axios");

export default class Signup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      username: "",
      email: "",
      password: "",
      conPassword: ""
    };
    this.handleSignup = this.handleSignup.bind(this);
  }

  handleSignup(theState) {
    const updateState = new Promise((resolve, reject) => {
      this.setState(theState);
      resolve(theState);
    });

    updateState.then(theState => {
      if (
        this.state.password === this.state.conPassword ||
        this.state.password.length > 3 ||
        this.state.username.length > 3
      ) {
        var apiBaseUrl = "http://localhost:9000/users/signup";

        var payload = this.state;
        axios
          .post(apiBaseUrl, payload)
          .then(function(response) {
            console.log(response);
            if (response.status === 200) {
              alert("Signup successfull");
              this.history.push("/login");
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
      } else {
        alert("you fucked up nigga");
      }
    });
  }
  render() {
    return (
      <div
        className="signup"
        style={{ background: "#ECECEC", padding: "30px" }}
      >
        <Row>
          <Col span={6}></Col>
          <Col span={6}></Col>
          <Col span={6} style={{ height: "100%" }}>
            <SignupCard handleSignup={this.handleSignup} />
          </Col>
          <Col span={6}></Col>
        </Row>
      </div>
    );
  }
}
