// Libraries
import BookingsDispatcher from "../../../../dispatchers/BookingsDispatcher";
import React, { Component } from "react";
import Store from "../../../../reducers/Store";

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
import Pagination from "../../../../components/Pagination";

class BookingsDebug extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isReferenceIDsActive: false,
      isResultsDropdownActive: false,
      editingValues: {
        status: 0,
        flightId: 0,
        passengerId: 0,
        userId: 0,
        guestEmail: "",
        guestPhone: "",
      },
    };
  }
  render() {
    const { bookings } = Store.getState();
    const { isReferenceIDsActive, searchText } = this.state;

    // Microservice Status
    const bookingsMSHealth = bookings.health;
    const bookingsMSStatus = bookings.status;

    // Modal Toggles
    const isCreatePromptActive = bookings.create.isActive;
    const isDeletePromptActive = bookings.delete.isActive;
    const isEditPromptActive = bookings.edit.isActive;

    // Search Results vars
    const searchError = bookings.search.error;
    const searchResults = bookings.search.results;

    return (
      <div
        className={"row" + (this.props.className || "")}
        style={this.props.style}
      >
        {/* Header */}
        <div className="col-12 bg-light kit-border-shadow">
          <div className="row p-2">

            {/* Search Bar */}
            <div className="col-12">
              {/* Search */}
              <FlexRow className="mt-1" justify="end" wrap="no-wrap">
                <input
                  aria-label="Search"
                  className={
                    "form-control " + (searchError && " is-invalid kit-shake")
                  }
                  label={searchError}
                  placeholder="ID, status, confirmation, flight, passenger, user, guest"
                  type="search"
                  style={{ maxWidth: "15rem" }}
                  onChange={(e) =>
                    this.setState({ searchText: e.target.value })
                  }
                />
                <button
                  className="btn btn-success ml-2 text-white kit-text-shadow-dark"
                  type="submit"
                  onClick={() =>
                    BookingsDispatcher.onSearchAndFilter("/search", searchText)
                  }
                >
                  search
                </button>
              </FlexRow>
            </div>
          </div>
        </div>

        {/* Search Sorting & Filtering */}
        <div
          className={
            "col-12 bg-light " +
            ((bookingsMSStatus === "INACTIVE" ||
              bookingsMSStatus === "ERROR" ||
              isCreatePromptActive ||
              isDeletePromptActive ||
              isEditPromptActive) &&
              "kit-opacity-50 kit-no-user kit-pointer-none")
          }
        >

          {/* Resuts Count & Page Selection */}
          <div className="row justify-content-center pb-1">

            {/* Toggle Reference Data */}
            <FlexRow
              className="col-auto p-0 bg-dark rounded mt-2"
              wrap={"no-wrap"}
            >
              <button
                className={
                  "btn text-white " + (isReferenceIDsActive && "btn-success")
                }
                onClick={() => this.handleIncludeReferenceIDs(true)}
              >
                Show IDs
              </button>
              <button
                className={
                  "btn text-white " + (!isReferenceIDsActive && "btn-success")
                }
                onClick={() => this.handleIncludeReferenceIDs(false)}
              >
                Hide
              </button>
            </FlexRow>

            {/* DropDown */}
            <FlexColumn className="col-auto text-center mt-2">
              <DropDown
                buttonClassName="btn-secondary dropdown-toggle"
                selection={bookings.search.resultsPerPage}
                options={["3", "10", "25", "50"]}
                optionsName="items"
                onSelect={(e) => BookingsDispatcher.onSelectItemsPerPage(e)}
              />
            </FlexColumn>

            {/* Readout */}
            <FlexColumn className="col-auto text-center mt-2">
              <ItemsIndexReadout
                currentPage={bookings.search.resultsPage}
                itemsPerPage={bookings.search.resultsPerPage}
                itemsTotal={bookings.search.results.length}
              />
            </FlexColumn>

            {/* Pagination */}
            <FlexColumn className="col-auto text-center mt-2">
              <Pagination
                currentPage={bookings.search.resultsPage}
                totalPages={Math.ceil(
                  bookings.search.results.length /
                    Math.max(bookings.search.resultsPerPage, 1)
                )}
                onSelectPage={(e) => BookingsDispatcher.onSelectItemsPage(e)}
              />
            </FlexColumn>
          </div>
        </div>

        {/* Body */}
        <div className="col-12" style={{ overflowY: "auto" }}>
          {/* Error State */}
          {bookingsMSStatus === "ERROR" && (
            <FlexColumn className="h-100">
              <ErrorMessage className="h1" soundAlert={true}>
                {bookingsMSHealth === "HEALTHY" ? bookings.error : "No BookingMS connection."}
              </ErrorMessage>
              <button
                className="btn btn-light m-3"
                onClick={() => BookingsDispatcher.onCancel()}
              >
                Back
              </button>
            </FlexColumn>
          )}

          {/* Inactive State */}
          {bookingsMSStatus === "INACTIVE" && (
            <FlexColumn className="h-100">
              <ChangeOperationReadout
                className="m-1"
                style={{ minHeight: "4rem" }}
                name="Establishing Connection . . ."
                status={"PENDING"}
              />
            </FlexColumn>
          )}

          {/* Pending State */}
          {(bookingsMSStatus === "PENDING" ||
            bookingsMSStatus === "INACTIVE") && (
            <FlexColumn className="h-100">
              <div className="spinner-border" />
            </FlexColumn>
          )}

          {/* Success State */}
          {bookingsMSStatus === "SUCCESS" &&
            !isCreatePromptActive &&
            !isDeletePromptActive &&
            !isEditPromptActive &&
            this.handleRenderBookingsList(searchResults)}

          {bookingsMSStatus === "SUCCESS" && isCreatePromptActive && (
            <CreateView />
          )}

          {bookingsMSStatus === "SUCCESS" && isDeletePromptActive && (
            <DeleteView />
          )}

          {bookingsMSStatus === "SUCCESS" && isEditPromptActive && <EditView />}
        </div>
      </div>
    );
  }

  componentDidMount() {
    BookingsDispatcher.onCancel();
    BookingsDispatcher.onHealth();
    BookingsDispatcher.onRequest();
  }

  handleIncludeReferenceIDs = (isActive) => {
    this.setState({ isReferenceIDsActive: isActive });
  };

  handleRenderBookingsList = (bookingsList) => {
    const { bookings } = Store.getState();
    const { isReferenceIDsActive } = this.state;
    const resultsDisplayed = Number(bookings.search.resultsPerPage);
    const resultsStart =
      bookings.search.resultsPerPage * (bookings.search.resultsPage - 1);

    const bookingsTable = [];
    if (!bookingsList.length) bookingsList = [bookingsList];
    for (let i = resultsStart; i < resultsStart + resultsDisplayed && i < bookingsList.length; i++) {

      const bookingId = bookingsList[i].bookingId;
      if (bookingId) {
        const index = Number(i) + 1;
        bookingsTable.push(
          <tr key={index}>
            <th scrop="row">{index}</th>
            <td>{bookingId}</td>
            <td>{bookingsList[i].bookingStatus}</td>
            <td>{bookingsList[i].bookingConfirmationCode}</td>
            {isReferenceIDsActive && (
              <td>{bookingsList[i].bookingFlightId || "Error"}</td>
            )}
            {isReferenceIDsActive && (
              <td>{bookingsList[i].bookingPassengerId || "NR"}</td>
            )}
            {isReferenceIDsActive && (
              <td>{bookingsList[i].bookingUserId || "Guest"}</td>
            )}

            {/* Edit */}
            <td>
              <button
                className="btn btn-info"
                onClick={() => BookingsDispatcher.onPromptEdit("/" + bookingId)}
              >
                Edit
              </button>
            </td>

            {/* Delete */}
            <td>
              <button
                className="btn btn-primary"
                onClick={() => BookingsDispatcher.onPromptDelete("/" + bookingId)}
              >
                Delete
              </button>
            </td>
          </tr>
        );
      }
    }

    return (
      <FlexColumn justify={"start"} style={{ height: "99%", width: "99%" }}>
        <table className="table kit-border-shadow m-3">
          <thead className="thead-dark">
            <tr>
              <th scope="col">#</th>
              <th scope="col">ID</th>
              <th scope="col">Status</th>
              <th scope="col">Confirmation Code</th>
              {isReferenceIDsActive && <th scope="col">Flight ID</th>}
              {isReferenceIDsActive && <th scope="col">Passenger ID</th>}
              {isReferenceIDsActive && <th scope="col">User ID</th>}
              <th scope="col" colSpan="2">
                <FlexRow>
                  <button
                    className="btn btn-success text-white kit-text-shadow-dark"
                    style={{ whiteSpace: "nowrap" }}
                    onClick={() => BookingsDispatcher.onPromptCreate()}
                  >
                    + Create New
                  </button>
                </FlexRow>
              </th>
            </tr>
          </thead>
          <tbody>
            {bookingsTable}
            <tr>
              <td colSpan="7"></td>
              {/* Space at end of table for aesthetic */}
            </tr>
          </tbody>
        </table>
      </FlexColumn>
    );
  };
}
export default BookingsDebug;
