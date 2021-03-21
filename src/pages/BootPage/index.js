// Libraries
import React, { Component } from "react";
import FlexColumn from "../../components/FlexColumn";
import FlexRow from "../../components/FlexRow";
import AirportsDispatcher from "../../dispatchers/AirportsDispatcher";

// Images
import gifEarthSpinning from "../../images/EarthWithHotAirBalloon.gif";

class StartupPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loadingText: "Tap anywhere to continue . . ."
    };
  }

  render() {
    const { loadingText } = this.state;

    return (
      <FlexColumn
        className="kit-gradient-red kit-no-user"
        style={{
          position: "absolute",
          height: "100vh",
          width: "100vw",
        }}
        wrap="no-wrap"
        onClick={() => this.handleLoadingProgressCheck()}
      >
        {/* Utopia Header */}
        <h1 
          className="kit-cursive kit-color-cream kit-text-shadow mt-auto"
          style={{fontSize: "12rem"}}
        >
          {"Utopia"}
        </h1>

        {/* Spinning Earth & Hot Air Balloon */}
        <img
          src={gifEarthSpinning}
          alt=""
          className="rounded-circle mt-3"
          style={{
            width: "50%",
            maxWidth: "500px",
          }}
        />

        {/* Loading Bar */}
        <div
          className="kit-border-shadow rounded border-shadow mt-5"
          style={{
            height: "2.5%",
            maxHeight: "100px",
            width: "66%",
            maxWidth: "700px",
            overflow: "hidden",
          }}
        >
          <div
            className="kit-gradient-lightgrey kit-gradient-animated-fast-infinite"
            style={{ height: "100%", width: "100%" }}
          />
        </div>

        {/* Loading Text */}
        <div className="h3 kit-color-cream kit-text-shadow-light mt-3 mb-auto">
          {loadingText}
        </div>

        {/* Copyright */}
        <FlexRow>
          <a 
            href="https://github.com/JoshuaTyler-SmoothStack/Utopia-UI" 
            className="h5 kit-link mb-2"
          >
            {"©2021 Utopia Airlines"}
          </a>
        </FlexRow>
      </FlexColumn>
    );
  }

  componentDidMount() {
    AirportsDispatcher.onRequest();
  }

  handleLoadingProgressCheck() {
    // const { loadingProgress } = this.state;
    // if(loadingProgress === 100) {
    // 
    // }
    window.location.href = "/home";
  }
}
export default StartupPage;