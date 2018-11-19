import React from "react";

const LocationItem = ({ openInfoWindow, location }) => {
  return (
    <li
      role="button"
      className="location-item"
      to={`/search/${location.name}`}
      tabIndex="0"
      aria-label={location.locationHeader}
      onKeyPress={() => {
        openInfoWindow(location.marker);
      }}
      onClick={() => {
        openInfoWindow(location.marker);
      }}
    >{location.locationHeader}</li>
  );
};

export default LocationItem;

// TODO: work out the finer details of `react-router-dom`'s 
// Router, Route, and Links --> as well as History, to 
// make specific markers and infoWindows bookmarkable
