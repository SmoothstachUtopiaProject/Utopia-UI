// Libraries
import React, { Component } from "react";

// Components
import AirplanesDebug from "./displays/AirplanesDebug";
import AirportsDebug from "./displays/AirportsDebug";
import BookingsDebug from "./displays/BookingsDebug";
import LocalSidebar from "./LocalSidebar";
import NavBar from "../../componentgroups/NavBar";
import OrchestrationDispathcer from "../../dispatchers/OrchestrationDispatcher";

class APIDebugPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeDisplay: "BOOKINGS",
    };
  }

  render() {
    const { activeDisplay } = this.state;
    return (
      <div className="container-fluid overflow-hidden" style={{height:"100vh", width:"100vw"}}>
        
        {/* Navbar */}
        <div className="row">
          <NavBar className="col" hideSearchBar={true}/>
        </div>

        {/* Content */}
        <div className="row">
          {/* Siderbar */}
          <LocalSidebar 
            activeDisplay={activeDisplay} 
            onSelectDisplay={(e) => this.setState({activeDisplay: e})}
          />
          
          {/* Debug Displays */}
          {activeDisplay === "AIRPLANES" && <AirplanesDebug/>}
          {activeDisplay === "AIRPORTS" && <AirportsDebug/>}
          {activeDisplay === "BOOKINGS" && <BookingsDebug/>}
        </div>
      </div>
    );
  }

  componentDidMount() {
    OrchestrationDispathcer.onServices();
  }
}
export default APIDebugPage;
