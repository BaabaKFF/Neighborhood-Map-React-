import React, { Component } from "react";
import { Route } from "react-router-dom";
import SearchBar from "./SearchBar"; // List view per project rubric
import locations from "./locations";// Hard coded locations on the map
import { DefaultStyle } from "../map-styles/DefaultStyle"; // Default styling of the map

// Non-component utilities used through the app
import {
  placesFields,
  InjectMapScript,
  splitAddress,
  randomGen,
  mapScriptUrl,
  fourSquareURL
} from "./utils";

import axios from "axios"; // Used when fetching photos from Foursquare

// Stateful component, handles most map-related behavior and builds infoBoxes
class App extends Component {
  state = {
    allLocations: locations,
    mapStyles: [DefaultStyle] /* imported mapStyles */,
    selection: "",
    map: null,
    infoBox: null,
    lastMarker: null,
    photoAndData: {
      photo: "",
      data: []
    }
  };
  // Initiate the map
  componentWillMount = () => {
    InjectMapScript(mapScriptUrl);
    window.initMap = this.initMap;
    console.log(window, this);
  };
  
  initMap = style => {
    let loadStyles;
    // Sets the default style to DefaultStyle when the map is instantiated
    // Begins map instantiation
    const mapEl = document.getElementById("map");
    mapEl.style.height = "100vh";
    const map = new window.google.maps.Map(mapEl, {
      mapTypeControl: false,
      styles: loadStyles
    });
    // Begins bounds and infoBox creation
    const bounds = new window.google.maps.LatLngBounds();
    const infoBox = new window.google.maps.InfoWindow({});
    // Event listeners for the map, infoBox, window resize, and -- further down -- markers
    window.google.maps.event.addListener(infoBox, "closeclick", () => {
      this.closeInfoWindow();
    });

    // State properties used in other methods, which required ready reference to the objects following `initMap`
    this.setState({
      map: map,
      infoBox: infoBox
    });
    // Re-centers the map when resizing the window
    window.google.maps.event.addDomListener(window, "resize", () => {
      const center = map.getCenter();
      window.google.maps.event.trigger(map, "resize");
      map.setCenter(center);
    });
    // Closes any open infoBoxes when a click occurs over the map
    window.google.maps.event.addListener(map, "click", () => {
      this.closeInfoWindow();
    });
    // Begins creation of markers, as well as appending information used in other methods and HTTP requests
    const allLocations = [];
    // Sets locations during map instantiation, creates markers and associate them to the map object
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
        // Custom marker icons derived locally and hard-coded in `locations.js`
        icon: {
          url: location.icon,
          // Clickable icon size,
          scaledSize: new window.google.maps.Size(48, 48)
        },
        // IDs used later in Google Places and Foursquare `getDetails` and `axios` HTTP requests
        placeId: location.placesId,
        fourSqId: location.fourSqId
      });
      // Finalizes marker properties and attach listeners, as well as
      // update component's state with more comprehensive location details
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
    //
    map.fitBounds(bounds);
    // map.setZoom(17); <-- doesn't work when fitting bounds to each marker instance's position
  };
  // Start of fetch request --> close any open infoBoxes and begin opening and creating a new one
  handleOpenInfoBox = marker => {
    const { map } = this.state;
    this.closeInfoWindow(marker);
    this.state.infoBox.open(map, marker);
    marker.setAnimation(window.google.maps.Animation.BOUNCE);
    // Marker animation via setTimeout lasts 2 seconds
    setTimeout(() => marker.setAnimation(null), 2000);
    this.setState({
      lastMarker: marker
    });
    // While content loads, let the user know
    this.state.infoBox.setContent(`<h3 tabindex="1">Loading . . .</h3>`);
    // reposition/recenter map dependent on relative marker position
    map.setCenter(marker.getPosition());
    // `panBy` seems acceptable for multi-device support
    map.panBy(0, -150);
    this.getInfoWindowPhoto(marker);
  };

  getInfoWindowPhoto = marker => {
    // method queries Foursquare with utility `fourSquareUrl` function
    // and sets applicable state with the first image item received
    axios.get(fourSquareURL(marker)).then(response => {
      if (response.status === 200) {
        console.log("Photo fetched from Foursquare!");
        this.setState({
          photoAndData: {
            photo: response.data.response.photos.items[0]
          }
        });
        // afterward, invocation of Google Places location data query
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
  };
  // carried down the line, the response from the previous step, as well as the appropriate marker,
  // are sent through the Google Places request
  getInfoWindowData = (response, marker) => {
    const request = {
      placeId: marker.placeId,
      fields: placesFields
    };
    const service = new window.google.maps.places.PlacesService(this.state.map);
    new Promise(() => {
      service.getDetails(request, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          console.log(
            `Successfully fetched Google Places info. Status: ${status}`
          );
          // begin invocation of the infoBox construction using photo and location data
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
  // infoBox construction method --> two images on average, per Foursquare request, are received
  // Pick one, then take Google Places data and construct relevant information used in the
  // infoBox -- address, phone number, etc.
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
    // `splitAddress` is a utility function to trim the location's address
    // Some of the added classes are unused due to infoWindow styling restrictions.
    location.locationAddress = splitAddress(location);
    this.state.infoBox.setContent(
      `<div id="iw-container">
        <img class="info-pic" src="${location.locationPhoto}" alt="${
        location.locationName
      }">
        <h2 class="iw-title">${location.locationName}</h2>
        <h3 class="iw-address">${location.locationAddress}</h3>
        <p class="rating">Average Rating: ${location.locationRating} / 5</p>
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
  //
  closeInfoWindow = marker => {
    // ensures if multiple markers are clicked consecutively,
    // the previous one stops its BOUNCE and the active one starts.
    if (this.state.lastMarker) {
      this.state.lastMarker.setAnimation(null);
    }
    // `lastMarker` used primarily to stop BOUNCE if another
    // marker is pressed while the former is still bouncing.
    this.setState({
      lastMarker: marker
    });
    // Close the infoBox
    this.state.infoBox.close();
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
          aria-label="Map of 6 hotspots near Irvington, New Jersey"
          className="aria-label"
        />
      </div>
    );
  }
}

export default App;
