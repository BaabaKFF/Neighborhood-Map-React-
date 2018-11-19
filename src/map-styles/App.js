import React, { Component } from "react";
import { Route } from "react-router-dom";
import SearchBar from "./SearchBar";

import locations from "./locations";
import { DefaultStyle } from "../map-styles/DefaultStyle";

import {
  placesFields,
  InjectMapScript,
  splitAddress,
  randomGen,
  mapScriptUrl,
  fourSquareURL
} from "./utils";
import axios from "axios";

class App extends Component {
  state = {
    allLocations: locations,
    mapStyles: [DefaultStyle],
    selection: "",
    map: null,
    infoBox: null,
    lastMarker: null,
    photoAndData: {
      photo: "",
      data: []
    }
  };
  componentWillMount = () => {
    window.initMap = this.initMap;
    InjectMapScript(mapScriptUrl);
  };
  initMap = style => {
    let loadStyles;
    if (!style) {
      loadStyles = this.state.mapStyles[0];
    } else {
      loadStyles = style;
    }
    const mapEl = document.getElementById("map");
    mapEl.style.height = "100vh";
    const map = new window.google.maps.Map(mapEl, {
      mapTypeControl: false,
      styles: loadStyles
    });
    const bounds = new window.google.maps.LatLngBounds();
    const infoBox = new window.google.maps.InfoWindow({});
    window.google.maps.event.addListener(infoBox, "closeclick", () => {
      this.closeInfoWindow();
    });
    this.setState({
      map: map,
      infoBox: infoBox
    });
    window.google.maps.event.addDomListener(window, "resize", () => {
      const center = map.getCenter();
      window.google.maps.event.trigger(map, "resize");
      map.setCenter(center);
    });
    window.google.maps.event.addListener(map, "click", () => {
      this.closeInfoWindow();
    });
    const allLocations = [];
    this.state.allLocations.forEach(location => {
      const locationHeader = `${location.name} || ${location.type}`;
      const marker = new window.google.maps.Marker({
        position: new window.google.maps.LatLng(
          location.location.lat,
          location.location.lng
        ),
        animation: window.google.maps.Animation.DROP,
        title: location.name,
        map: map,
        icon: {
          url: location.icon,
          scaledSize: new window.google.maps.Size(48, 48)
        },
        placeId: location.placesId,
        fourSqId: location.fourSqId
      });
      bounds.extend(marker.position);
      marker.addListener("click", () => {
        this.handleOpenInfoBox(marker);
      });
      location.locationHeader = locationHeader;
      location.marker = marker;
      location.display = true;
      location.id = location.placesId;
      allLocations.push(location);
    });
    this.setState({
      allLocations: allLocations
    });
    map.fitBounds(bounds);
    map.setZoom(17);
  };
  handleOpenInfoBox = marker => {
    this.closeInfoWindow(marker);
    this.state.infoBox.open(this.state.map, marker);
    marker.setAnimation(window.google.maps.Animation.BOUNCE);
    setTimeout(() => marker.setAnimation(null), 2000);
    this.setState({
      lastMarker: marker
    });
    this.state.infoBox.setContent(`<h3 tabindex="1">Loading . . .</h3>`);
    this.state.map.setCenter(marker.getPosition());
    this.state.map.panBy(0, -200);
    this.populateInfoWindow(marker);
  };

  populateInfoWindow = marker => {
    return new Promise(() => {
      this.getInfoWindowPhoto(marker);
    });
  };

  getInfoWindowPhoto = marker => {
    return new Promise(() => {
      axios.get(fourSquareURL(marker)).then(response => {
        if (response.status === 200) {
          console.log("all good getting photo");
          this.setState({
            photoAndData: {
              photo: response.data.response.photos.items[0]
            }
          });
          this.getInfoWindowData(response, marker);
        } else {
          alert(
            `Unable to fetch photo(s) from Foursquare. Please try another location!`
          );
          console.log(
            `Encountered error fetching photos from Foursquare: ${
              response.status
            }`
          );
        }
      });
    });
  };

  getInfoWindowData = (response, marker) => {
    const request = {
      placeId: marker.placeId,
      fields: placesFields
    };
    const service = new window.google.maps.places.PlacesService(this.state.map);
    return new Promise(() => {
      service.getDetails(request, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          console.log(
            `Successfully fetched Google Places info. Status: ${status}`
          );
          this.buildWindow(response, results);
        } else {
          this.state.infoBox.setContent(
            `We're sorry, details aren't available at this time 😦`
          );
          console.log(
            `Encountered error fetching data from Google Places: ${
              response.status
            }`
          );
        }
      });
    });
  };

  buildWindow = (photo, data) => {
    const rando = randomGen(2);
    const photoUrl = `${photo.data.response.photos.items[rando].prefix}200x200${
      photo.data.response.photos.items[rando].suffix
    }`;
    const location = {
      locationAddress: data.formatted_address,
      locationPhone: data.formatted_phone_number,
      locationName: data.name,
      locationReviews: data.reviews,
      locationRating: data.rating,
      locationWebsite: data.website,
      locationPhoto: photoUrl
    };
    location.locationAddress = splitAddress(location);
    this.state.infoBox.setContent(
      `<div id="iw-container">
                <img class="info-pic" src="${location.locationPhoto}" alt="${
        location.locationName
      }">
                <h2 class="iw-title">${location.locationName}</h2>
                <h3 class="iw-address">${location.locationAddress}</h3>
                <p class="rating">Average Rating: ${
                  location.locationRating
                } / 5</p>
                <a href="${location.locationPhone}" class="phone">Call ${
        location.locationPhone
      }</a>
                <br>
                <a href="${location.locationWebsite}" class="website">Visit ${
        location.locationName
      }</p>
            </div>`
    );
  };
  closeInfoWindow = marker => {
    if (this.state.lastMarker) {
      this.state.lastMarker.setAnimation(null);
    }
    this.setState({
      lastMarker: marker
    });
    this.state.infoBox.close();
  };
  changeStyle = style => {
    const allMapStyles = this.state.mapStyles;
    const tempStr = style.value;
    for (let i = 0; i < allMapStyles.length; i++) {
      if (tempStr === allMapStyles[i][0]) {
        this.initMap(this.state.mapStyles[i]);
      }
    }
  };
  render() {
    return (
      <div>
        <Route path="/search">
          <SearchBar
            allLocations={this.state.allLocations}
            openInfoWindow={this.handleOpenInfoBox}
            closeInfoWindow={this.closeInfoWindow}
          />
        </Route>
        <div id="map" />
        <label
          htmlFor="map"
          role="application"
          aria-label="Map of 8 hotspots in New York city, New York"
          className="aria-label"
        />
      </div>
    );
  }
}

export default App;
