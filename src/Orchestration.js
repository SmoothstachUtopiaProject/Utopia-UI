import Store from "./reducers/Store";
import constants from "./resources/constants.json"

class Orchestration {

  static contentType = "json";

  static createRequestWithBody(requestType, requestPath, payload, onError, onSuccess) {

    const { authentication } = Store.getState();

    const formattedRequestPath = requestPath.startsWith("/") ? requestPath : "/" + requestPath;
    fetch("http://localhost:8080" + formattedRequestPath, {
      headers: {
        "Accept": "application/" + Orchestration.contentType,
        "Content-Type": "application/" + Orchestration.contentType,
        "Authorization": authentication.userToken || authentication.userLogin
      },
      body: requestType !== constants.httpRequest.get
        ? JSON.stringify(payload)
        : null,
      method: requestType
    })
      .then((response) => {
        if (Orchestration.contentType === "json") {
          return response.clone().json().catch(() => response.text());
        }
        return response.text();
      })
      .then((data) => {
        onSuccess(data);
      })
      .catch((err) => {
        console.error("[ERROR]: " + err);
        onError(err);
      });
  }

  // "Overload" without HTTP body payload
  static createRequest(requestType, requestPath, onError, onSuccess) {
    Orchestration.createRequestWithBody(requestType, requestPath, {}, onError, onSuccess);
  }

  static validate(onError, onSuccess) {
    Orchestration.createRequest(constants.httpRequest.get, "actuator/health",
      onError2 => {
        console.error("[ERROR] could not validate Orchestrator Service!");
        onError(onError2);
      }, onSuccess2 => {
        console.log("[INCOMING FROM SPRING] status: " + onSuccess2["status"]);
        onSuccess(onSuccess2);
      });
  }
}
export default Orchestration;