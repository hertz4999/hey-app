import React, { Component } from "react";
import Control from "./components/control";
import Signup from "./components/signup";
import Login from "./components/login";
import { Route, BrowserRouter as Router } from "react-router-dom";
import Home from "./components/homePage";

class App extends Component {
  render() {
    return (
      <div className="App" style={{ background: "#ECECEC" }}>
        <Router>
          <div>
            <Route exact path="/" component={Control} />
            <Route path="/login" component={Login} />
            <Route path="/signup" component={Signup} />
            <Route path="/home" component={Home} />
          </div>
        </Router>
      </div>
    );
  }
}

export default App;
