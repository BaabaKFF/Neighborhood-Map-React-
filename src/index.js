import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import "./index.css";
import App from "./components/App";
import serviceWorker from "./serviceWorker";

ReactDOM.render(
  <Router exact path="/">
    <App />
  </Router>,
  document.getElementById("app")
);
serviceWorker();
