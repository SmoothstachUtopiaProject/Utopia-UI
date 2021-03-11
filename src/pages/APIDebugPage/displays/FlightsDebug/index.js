// Libraries
import FlightsDispatcher from "../../../../dispatchers/FlightsDispatcher";
import OrchestrationDispatcher from "../../../../dispatchers/OrchestrationDispatcher";
import React, { Component } from 'react';
import Store from "../../../../reducers/Store";
import moment from 'moment';

// Components
import ChangeOperationReadout from "../ChangeOperationReadout";
import CreateView from "./CreateView";
import DeleteView from "./DeleteView";
import DropDown from "../../../../components/DropDown";
import EditView from "./EditView";
import ErrorMessage from "../../../../components/ErrorMessage";
import FlexColumn from "../../../../components/FlexColumn";
import FlexRow from "../../../../components/FlexRow";
import ItemsIndexReadout from "../../../../components/ItemsIndexReadout";
import OrchestrationHeader from "../OrchestrationHeader";
import Pagination from "../../../../components/Pagination";

class FlightsDebug extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchTerms: "",
      currentSort: "up",
      sortedItem: "flightId",
    };
  }

  render() { 
    const { orchestration, flights } = Store.getState();
    const { searchTerms } = this.state;
    const isCreatePromptActive = flights.create.isActive;
    const isDeletePromptActive = flights.delete.isActive;
    const isEditPromptActive = flights.edit.isActive;
    const isMSActive = orchestration.services.includes("flight-service");
    const flightsMSStatus = flights.status;
    const searchError = flights.search.error;
    const searchFilters = flights.search.filters;
    const searchResults = flights.search.results;

    return ( 
      <div className={"row" + (this.props.className || "")} style={this.props.style}>
        
        {/* Header */}
        <div className="col-12 bg-light kit-border-shadow">
          <div className="row mt-1">
            {/* MS Orchestration Indicators */}
            <OrchestrationHeader className="col-12 col-md-6"
              name="Flight MS"
              status={flightsMSStatus === "INACTIVE" ? "PENDING" : flightsMSStatus}
              style={{maxWidth:"30rem"}}
              onTriggerError={() => FlightsDispatcher.onError()}
              onTriggerFakeAPICall={() => FlightsDispatcher.onFakeAPICall(searchResults)}
            />

            {/* Search Bar */}
            <div className="col-12 col-md-5">
              {/* Search */}
              <FlexRow className="mt-1" justify="end" wrap="no-wrap">
                <input 
                  aria-label="Search" 
                  className={"form-control " + (searchError && " is-invalid kit-shake")}
                  label={searchError}
                  placeholder="flightid=&quot;1&quot;"
                  type="search" 
                  style={{maxWidth:"15rem"}}
                  onChange={(e) => this.setState({searchTerms: e.target.value})}
                />
                <button 
                  className="btn btn-success ml-2 text-white kit-text-shadow-thin" 
                  type="submit"
                  onClick={() => FlightsDispatcher.onSearchAndFilter("/search", searchTerms)}
                >
                  search
                </button>
              </FlexRow>
            </div>
          </div>
        </div>

        {/* Search Sorting & Filtering */}
        <div className={"col-12 bg-light " +
          ((flightsMSStatus === "INACTIVE" || flightsMSStatus === "ERROR" ||
           isCreatePromptActive || isDeletePromptActive || isEditPromptActive) && 
          "kit-opacity-50 kit-no-user kit-pointer-none")}
        >
          
          {/* Filters */}
          <div className="row p-2 justify-content-center p-2">

              {/* # of Filters Active */}
              <div className="col-auto list-group ml-2">
                <div className="list-group-item" style={{fontSize: "0.85rem", padding:"0.5rem"}}>
                  {searchFilters.activeCount + " filters active"}
                </div>
              </div>
          </div>

          {/* Resuts Count & Page Selection */}
          <div className="row justify-content-center p-2">
            <FlexColumn className="col-4 col-md-3 text-center">
              <DropDown
                buttonClassName="btn-secondary dropdown-toggle"
                selection={flights.search.resultsPerPage}
                options={["3", "10", "25", "50"]}
                optionsName="items"
                onSelect={(e) => FlightsDispatcher.onSelectResultsPerPage(e)}
              />
            </FlexColumn>

            <FlexColumn className="col-6 col-md-3 text-center">
              <ItemsIndexReadout
                currentPage={flights.search.resultsPage}
                itemsPerPage={flights.search.resultsPerPage}
                itemsTotal={flights.search.results.length}
              />
            </FlexColumn>

            <FlexColumn className="col-8 mt-2 col-md-3 text-center">
              <Pagination
                currentPage={flights.search.resultsPage}
                totalPages={Math.ceil(flights.search.results.length / Math.max(flights.search.resultsPerPage, 1))}
                onSelectPage={(e) => FlightsDispatcher.onSelectResultsPage(e)}
              />
            </FlexColumn>
          </div>
        </div>


        {/* Body */}
        <div className="col-12" style={{overflow: "auto"}}>

        {/* Error State */}
        {flightsMSStatus === "ERROR" &&
          <FlexColumn className="h-100">
            <ErrorMessage className="h1" soundAlert={true}>
              {isMSActive ? flights.error : "No Flight MS connection."}
            </ErrorMessage>
            <button className="btn btn-light m-3"
              onClick={() => FlightsDispatcher.onCancel()}
            >
              Back
            </button>
          </FlexColumn>}

          {/* Inactive State */}
          {flightsMSStatus === "INACTIVE" &&
          <FlexColumn style={{minHeight:"10rem"}}>
          <ChangeOperationReadout className="m-1" style={{minHeight: "4rem"}} 
            name="Establishing Connection . . ." status={"PENDING"}/>
          </FlexColumn>}

          {/* Pending State */}
          {(flightsMSStatus === "PENDING" || flightsMSStatus === "INACTIVE") &&
          <FlexColumn style={{minHeight:"10rem"}}>
            <div className="spinner-border"/>
          </FlexColumn>}

          {/* Success State */}
          {(flightsMSStatus === "SUCCESS" && !isCreatePromptActive && !isDeletePromptActive && !isEditPromptActive) && 
          this.handleRenderFlightsList(searchResults)}

          {(flightsMSStatus === "SUCCESS" && isCreatePromptActive) && 
          <CreateView/>}

          {(flightsMSStatus === "SUCCESS" && isDeletePromptActive) && 
          <DeleteView/>}

          {(flightsMSStatus === "SUCCESS" && isEditPromptActive) && 
          <EditView/>}
        </div>
      </div>
    );
  }

  componentDidMount() {
    FlightsDispatcher.onCancel();
    OrchestrationDispatcher.onFindActiveServices();
    FlightsDispatcher.onRequest();
  }

  onSortChange = (e) => {
		const { currentSort } = this.state;
		let nextSort;

		if (currentSort === 'down') nextSort = 'up';
		else if (currentSort === 'up') nextSort = 'down';

		this.setState({
			currentSort: nextSort,
      sortedItem: e.target.value
		});
	};

  handleRenderFlightsList = (flightsList) => {
    const { flights } = Store.getState();
    const resultsDisplayed = Number(flights.search.resultsPerPage);
    const resultsStart = flights.search.resultsPerPage * (flights.search.resultsPage - 1);

    let flightsTable = [];
    if(this.state.sortedItem === "flightId")
    flightsList.sort((a, b) => {
      return this.state.currentSort === 'up' ? a.flightId-b.flightId : b.flightId-a.flightId;
    });
    else if(this.state.sortedItem === "flightDuration")
    flightsList.sort((a, b) => {
      return this.state.currentSort === 'up' ? a.flightDuration-b.flightDuration : b.flightDuration-a.flightDuration;
    });
    else if(this.state.sortedItem === "flightDepartureTime")
    flightsList.sort((a, b) => {
      return this.state.currentSort === 'up' ? new Date(a.flightDepartureTime)-new Date(b.flightDepartureTime) : new Date(b.flightDepartureTime)-new Date(a.flightDepartureTime);
    });
    else if(this.state.sortedItem === "flightRouteId")
    flightsList.sort((a, b) => {
      return this.state.currentSort === 'up' ? a.flightRouteId-b.flightRouteId : b.flightRouteId-a.flightRouteId;
    });
    else if(this.state.sortedItem === "flightAirplaneId")
    flightsList.sort((a, b) => {
      return this.state.currentSort === 'up' ? a.flightAirplaneId-b.flightAirplaneId : b.flightAirplaneId-a.flightAirplaneId;
    });
    else if(this.state.sortedItem === "flightSeatingId")
    flightsList.sort((a, b) => {
      return this.state.currentSort === 'up' ? a.flightSeatingId-b.flightSeatingId : b.flightSeatingId-a.flightSeatingId;
    });
    else if(this.state.sortedItem === "flightStatus")
    flightsList.sort((a, b) => {
      return this.state.currentSort === 'up' ? a.flightStatus.localeCompare(b.flightStatus) : b.flightStatus.localeCompare(a.flightStatus);
    });

    if (!flightsList.length) flightsList = [flightsList];
    for (var i = resultsStart; (i < resultsStart + resultsDisplayed && i < flightsList.length); i++) {
      const flightId = flightsList[i].flightId;
      if (!flightId) continue;

      let departure = moment(flightsList[i].flightDepartureTime).format('MMMM DD YYYY, h:mm:ss a');
      let duration = Math.floor(flightsList[i].flightDuration / 3600) + "h " + Math.floor(flightsList[i].flightDuration % 3600 / 60) +"m"

      const index = Number(i) + 1;
      flightsTable.push(
        <tr key={index}>
          <th scrop="row">{index}</th>
          <td>{flightId}</td>
          <td>{flightsList[i].flightRouteId}</td>
          <td>{flightsList[i].flightAirplaneId}</td>
          <td>{departure}</td>
          <td>{duration}</td>
          <td>{flightsList[i].flightSeatingId}</td>
          <td>{flightsList[i].flightStatus}</td>

          {/* Edit */}
          <td><button className="btn btn-info"
            onClick={() => FlightsDispatcher.onPromptEdit("/"+flightId)}>
            Edit
          </button></td>

          {/* Delete */}
          <td><button className="btn btn-primary"
            onClick={() => FlightsDispatcher.onPromptDelete("/"+flightId)}>
            Delete
          </button></td>
        </tr>
      );
    }

    return (
      <FlexColumn justify={"start"} style={{ height: "99%", width: "99%" }}>
        <table className="table kit-border-shadow m-3">
          <thead className="thead-dark">
            <tr>
              <th scope="col">#</th>
              <th scope="col">Flight ID<button className="btn text-white" value="flightId" onClick={this.onSortChange}>⇅</button></th>
              <th scope="col">Route ID<button className="btn text-white" value="flightRouteId" onClick={this.onSortChange}>⇅</button></th>
              <th scope="col">Airplane ID<button className="btn text-white" value="flightAirplaneId" onClick={this.onSortChange}>⇅</button></th>
              <th scope="col">Date & Time (UTC)<button className="btn text-white" value="flightDepartureTime" onClick={this.onSortChange}>⇅</button></th>
              <th scope="col">Duration<button className="btn text-white" value="flightDuration" onClick={this.onSortChange}>⇅</button></th>
              <th scope="col">Seating ID<button className="btn text-white" value="flightSeatingId" onClick={this.onSortChange}>⇅</button></th>
              <th scope="col">Status<button className="btn text-white" value="flightStatus" onClick={this.onSortChange}>⇅</button></th>
              <th scope="col" colSpan="2">
                <FlexRow>
                  <button className="btn btn-success text-white kit-text-shadow-thin" style={{ whiteSpace: "nowrap" }}
                    onClick={() => FlightsDispatcher.onPromptCreate()}>
                    + Create New
                  </button>
                </FlexRow>
              </th>
            </tr>
          </thead>
          <tbody>
            {flightsTable}
            <tr><td colSpan="5"></td>{/* Space at end of table for aesthetic */}</tr>
          </tbody>
        </table>
      </FlexColumn>
    );
  }
}
export default FlightsDebug;