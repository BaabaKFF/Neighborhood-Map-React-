import React, { Component } from "react";
import LocationItem from "./LocationItem";
import { Button } from "./Button";
import MainSearch from "./MainSearch";

class SearchBar extends Component {
  state = {
    searchLocations: "", // string length versus initial `null` value, which didn't work as in previous projects
    query: "",
    ariaSearchPressed: false,
    suggestionsShown: true
  };
  filterLocations = event => {
    const { closeInfoWindow, allLocations } = this.props;
    closeInfoWindow();
    const { value } = event.target;
    const searchLocations = [];
    allLocations.forEach(location => {
      if (
        location.locationHeader.toLowerCase().indexOf(value.toLowerCase()) >= 0
      ) {
        location.marker.setVisible(true);
        searchLocations.push(location);
      } else {
        location.marker.setVisible(false);
      }
    });
    this.setState({
      searchLocations: searchLocations,
      query: value
    });
  };
  componentWillMount = () => {
    const { allLocations } = this.props;
    this.setState({
      searchLocations: allLocations
    });
  };
  handleToggle = () => {
    this.setState({
      suggestions: !this.state.suggestions,
      suggestionsShown: !this.state.suggestionsShown,
      ariaPressed: !this.state.ariaPressed
    });
  };
  render() {
    const { openInfoWindow } = this.props;
    return (
      <div className="search">
        <MainSearch
          query={this.state.query}
          filterLocations={this.filterLocations}
        />
        <ul>
          {this.state.suggestionsShown &&
            this.state.searchLocations.map((location, i) => {
              return (
                <React.Fragment key={i}>
                  <LocationItem
                    key={i}
                    openInfoWindow={openInfoWindow}
                    location={location}
                  />
                </React.Fragment>
              );
            })}
        </ul>
        <Button
          handleToggle={this.handleToggle}
          shown={this.state.suggestionsShown}
          ariaState={this.state.ariaPressed}
          ariaLabel={"Toggle search bar"}
          btnClass={"button"}
          arrowSize={"2x"}
        />
      </div>
    );
  }
}

export default SearchBar;
