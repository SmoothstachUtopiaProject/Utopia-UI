// Libraries
import _ from "lodash";
import React, { useState } from 'react';
import Store from '../../../../reducers/Store';
import PassengersDispatcher from "../../../../dispatchers/PassengersDispatcher";
import KitUtils from '../../../../kitutils/KitUtils';

// Components
import ChangeOperationReadout from '../ChangeOperationReadout';
import FlexColumn from "../../../../components/FlexColumn";
import FlexRow from "../../../../components/FlexRow";
import DropDown from '../../../../components/DropDown';

const EditView = (props) => {
  const { passengers } = Store.getState();
  const selectedPassenger = passengers.selected;

  const [passengerBookingId, setBookingId] = useState(selectedPassenger.passengerBookingId || 1);
  const [passengerPassportId, setPassportId] = useState(selectedPassenger.passengerPassportId || "");
  const [passengerFirstName, setFirstName] = useState(selectedPassenger.passengerFirstName || "");
  const [passengerLastName, setLastName] = useState(selectedPassenger.passengerLastName || "");
  const [passengerDateOfBirth, setDateOfBirth] = useState(selectedPassenger.passengerDateOfBirth || "");
  const [passengerSex, setSex] = useState(selectedPassenger.passengerSex || "prefer not to answer");
  const [passengerAddress, setAddress] = useState(selectedPassenger.passengerAddress || "");
  const [passengerIsVeteran, setIsVeteran] = useState(selectedPassenger.passengerIsVeteran || false);

  const [isReverted, setIsReverted] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const results = passengers.edit.results;
  const resultsStatus = passengers.edit.resultsStatus;
  const status = passengers.edit.status;

  const passengerBookingIdChanged = results
    ? selectedPassenger.passengerBookingId !== results.passengerBookingId
    : true;

  const passengerPassportIdChanged = results
    ? selectedPassenger.passengerPassportId !== results.passengerPassportId
    : true;

  const passengerFirstNameChanged = results
    ? selectedPassenger.passengerFirstName !== results.passengerFirstName
    : true;

  const passengerLastNameChanged = results
    ? selectedPassenger.passengerLastName !== results.passengerLastName
    : true;

  const passengerDateOfBirthChanged = results
    ? selectedPassenger.passengerDateOfBirth !== results.passengerDateOfBirth
    : true;

  const passengerSexChanged = results
    ? selectedPassenger.passengerSex !== results.passengerSex
    : true;

  const passengerAddressChanged = results
    ? selectedPassenger.passengerAddress !== results.passengerAddress
    : true;

  const passengerIsVeteranChanged = results
    ? selectedPassenger.passengerIsVeteran !== results.passengerIsVeteran
    : true;
  
  const resultsPending = resultsStatus === "PENDING";
  const noChangesMade = _.isEqual(selectedPassenger, results);

  const handleValidate = () => {
    setIsSubmitted(true);
    if(!passengerPassportId) return false;
    if(!passengerFirstName) return false;
    if(!passengerLastName) return false;
    if(!passengerDateOfBirth) return false;
    if(!passengerAddress) return false;
    return true;
  };

  const handleSubmit = () => {
    if(!handleValidate()) return;
    const newPassenger = {
      passengerId: selectedPassenger.passengerId,
      passengerBookingId: passengerBookingId,
      passengerPassportId: passengerPassportId,
      passengerFirstName: passengerFirstName,
      passengerLastName: passengerLastName,
      passengerDateOfBirth: passengerDateOfBirth,
      passengerSex: passengerSex,
      passengerAddress: passengerAddress,
      passengerIsVeteran: passengerIsVeteran
    };
    if(!_.isEqual(selectedPassenger, newPassenger)) {
      PassengersDispatcher.onEdit(null, newPassenger);
    } else {
      PassengersDispatcher.onEditFake(newPassenger);
    }
  };

  return (
    <FlexColumn>

      {(status === "PENDING" || status === "ERROR") && 
      <FlexColumn className="mt-5">
        <ChangeOperationReadout 
          className="m-1" 
          style={{minHeight: "4rem"}} 
          name="Booking ID" 
          result={results ? results.passengerBookingId : ". . ."}
          status={passengerBookingIdChanged ? resultsStatus : "DISABLED"} 
        />

        <ChangeOperationReadout 
          className="m-1" 
          style={{minHeight: "4rem"}} 
          name="Passport ID" 
          result={results ? results.passengerPassportId : ". . ."}
          status={passengerPassportIdChanged ? resultsStatus : "DISABLED"} 
        />

        <ChangeOperationReadout 
          className="m-1" 
          style={{minHeight: "4rem"}} 
          name="First Name" 
          result={results ? results.passengerFirstName : ". . ."}
          status={passengerFirstNameChanged ? resultsStatus : "DISABLED"} 
        />

        <ChangeOperationReadout 
          className="m-1" 
          style={{minHeight: "4rem"}} 
          name="Last Name" 
          result={results ? results.passengerLastName : ". . ."}
          status={passengerLastNameChanged ? resultsStatus : "DISABLED"} 
        />

        <ChangeOperationReadout 
          className="m-1" 
          style={{minHeight: "4rem"}} 
          name="Date Of Birth" 
          result={results ? results.passengerDateOfBirth : ". . ."}
          status={passengerDateOfBirthChanged ? resultsStatus : "DISABLED"} 
        />
        
        <ChangeOperationReadout 
          className="m-1" 
          style={{minHeight: "4rem"}} 
          name="Sex" 
          result={results ? results.passengerSex : ". . ."}
          status={passengerSexChanged ? resultsStatus : "DISABLED"} 
        />

        <ChangeOperationReadout 
          className="m-1" 
          style={{minHeight: "4rem"}} 
          name="Address" 
          result={results ? results.passengerAddress : ". . ."}
          status={passengerAddressChanged ? resultsStatus : "DISABLED"} 
        />

        <ChangeOperationReadout 
          className="m-1" 
          style={{minHeight: "4rem"}} 
          name="U.S. Military Active Duty / Veteran" 
          result={results ? (results.passengerIsVeteran ? "YES" : "NO") : ". . ."}
          status={passengerIsVeteranChanged ? resultsStatus : "DISABLED"} 
        />

        <FlexRow>
          <button className="btn btn-light m-3"
            onClick={() => {
              PassengersDispatcher.onCancel();
              PassengersDispatcher.onRequest();
            }}
          >
            Close
          </button>
          
          {(status !== "ERROR" && noChangesMade && !isReverted) &&
            <button className={"btn btn-danger m-3 disabled"}
              onClick={() => KitUtils.soundAlert()}
            >
              {"Revert Changes (no changes made)"}
            </button>}

          {(status !== "ERROR" && !noChangesMade && !isReverted) &&
            <button className={"btn btn-danger m-3" + (!resultsPending || " disabled")}
              onClick={resultsPending 
                ? () => KitUtils.soundSuccess() 
                : () => {
                  PassengersDispatcher.onEdit(null, selectedPassenger); 
                  setIsReverted(true);
                }
              }
            >
              {resultsPending ? "Revert Changes (please wait)" : "Revert Changes"}
            </button>
          }
        </FlexRow>
      </FlexColumn>}

      {(status !== "ERROR" && status !== "PENDING") &&
      <FlexColumn>

        {/* Passenger IDs */}
        <FlexColumn className="w-100">
          <FlexRow className="w-100 mt-3">

            {/* ID */}
            <div className="mr-auto">
              <label className="form-label">Passenger ID</label>
              <input 
                className="form-control" 
                readOnly 
                type="text" 
                value={selectedPassenger.passengerId}
              />
            </div>

            {/* Booking ID */}
            <div className="ml-3">
              <label className="form-label">Booking ID</label>
              <input 
                className={"form-control " +  (isSubmitted ? !passengerBookingId ? "is-invalid" : "is-valid" : "")}
                min="1" 
                type="number" 
                value={passengerBookingId}
                onChange={(e) => setBookingId(e.target.value)}
              />
            </div>
          </FlexRow>

          {/* Passport ID */}
          <div className="mt-3 w-100">
            <label className="form-label">Passport ID</label>
            <input
              className={"form-control " +  (isSubmitted ? !passengerPassportId ? "is-invalid" : "is-valid" : "")}
              placeholder={"31195855"}
              type="text"
              value={passengerPassportId}
              onChange={(e) => setPassportId(e.target.value)}
            />
          </div>
          <hr className="w-100"></hr>
        </FlexColumn>
    
      
        {/* Passenger Name */}
        <FlexRow className="mt-3">

          {/* First Name */}
          <div className="mr-auto">
            <label className="form-label form-label">First Name</label>
            <input 
              className={"form-control " +  (isSubmitted ? !passengerFirstName ? "is-invalid" : "is-valid" : "")}
              placeholder={"John"}
              type="text" 
              value={passengerFirstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>

          {/* Last Name */}
          <div className="ml-3">
            <label className="form-label">Last Name</label>
            <input 
              className={"form-control " +  (isSubmitted ? !passengerLastName ? "is-invalid" : "is-valid" : "")}
              placeholder={"Smith"}
              type="text" 
              value={passengerLastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <hr className="w-100"></hr>
        </FlexRow>
      

        {/* Passenger Information */}
        <FlexColumn className="mt-3 w-100">

          {/* Row 1 */}
          <FlexRow className="w-100">
            {/* Date Of Birth */}
            <FlexColumn className="mr-auto">
              <label className="form-label mr-auto">Date Of Birth</label>
              <input 
                className={"form-control " +  (isSubmitted ? !passengerDateOfBirth ? "is-invalid" : "is-valid" : "")}
                type="date"
                value={passengerDateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
              />
            </FlexColumn>

            {/* Sex */}
            <FlexColumn className="ml-3 w-50">
              <label className="form-label mr-auto">Sex</label>
              <DropDown
                align="right"
                buttonClassName="btn-info"
                className="w-100"
                options={["female", "male", "prefer not to answer"]}
                selection={passengerSex}
                onSelect={(value) => setSex(value)}
              />
            </FlexColumn>
          </FlexRow>
          
          {/* Row 2 */}
          <FlexRow className="mt-3 w-100">
            {/* Address */}
            <div className="w-100">
              <label className="form-label">Address</label>
              <input 
                className={"form-control " +  (isSubmitted ? !passengerAddress ? "is-invalid" : "is-valid" : "")}
                placeholder={"1600 Pennsylvania Avenue NW, Washington, DC 20500"} 
                type="text" 
                value={passengerAddress}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </FlexRow>

          {/* Row 3 */}
          <FlexRow className="mt-3 w-100">
            {/* Veteran Status */}
            <FlexColumn>
              <input
                className="form-check-input"
                style={{height:"1.5rem", width:"1.5rem"}}
                type="checkbox" 
                checked={passengerIsVeteran}
                onChange={(e) => setIsVeteran(!passengerIsVeteran)}
              />
            </FlexColumn>
            <div className="ml-2">U.S. Military Active Duty / Veteran</div>
          </FlexRow>

          <hr className="w-100"></hr>
        </FlexColumn>

    
        {/* Buttons */}
        <FlexRow>
          <button className="btn btn-light m-3"
            onClick={() => PassengersDispatcher.onCancel()}
          >
            Cancel
          </button>
          <button className="btn btn-danger m-3"
            onClick={() => handleSubmit()}
          >
            Save Changes
          </button>
        </FlexRow>
      </FlexColumn>}
    </FlexColumn>
  );
}
export default EditView;