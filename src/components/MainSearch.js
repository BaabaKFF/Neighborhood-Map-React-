import React from "react";

// Input updates value with `onChange`, which also invokes the
// filtering method in the App component. . 
const MainSearch = ({ query, filterLocations }) => {
  return (
    <div>
      <h1 className="search-header">Neighborhood Map</h1>
      <input
        name="searchBar"
        id="searchInput"
        aria-labelledby="search-label"
        aria-required="false"
        className="search-field"
        type="text"
        placeholder="Filter hotspots"
        value={query}
        onChange={e => {
          filterLocations(e);
        }}
      />
      <label htmlFor="searchInput" id="search-label" className="aria-label">
        Search Portland Hotspots. Press tab to cycle locations.
      </label>
    </div>
  );
};

export default MainSearch;
