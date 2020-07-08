import React, { Component } from "react";

class Control extends Component {
  render() {
    return (
      <div
        className="Controll"
        style={{ background: "#ECECEC", padding: "30px" }}
      >
        <h1>hey</h1>

        <h1>
          <a href="/login">login</a>
        </h1>
        <h1>
          <a href="/signup">singup</a>
        </h1>
      </div>
    );
  }
}

export default Control;
