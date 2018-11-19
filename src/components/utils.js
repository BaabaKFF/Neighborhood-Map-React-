export const InjectMapScript = src => {
    var ref = window.document.getElementsByTagName("script")[0];
    var script = window.document.createElement("script");
    script.src = src;
    script.async = true;
    script.defer = true;
    script.onerror = function() {
      document.write("Google Maps can't be loaded");
    };
    ref.parentNode.insertBefore(script, ref);
  };
  
  export const randomGen = a => {
    return Math.floor(Math.random() * a);
  };
  
  export const placesFields = [
    "formatted_address",
    "name",
    "photo",
    "type",
    "url",
    "formatted_phone_number",
    "opening_hours",
    "website",
    "price_level",
    "rating",
    "review"
  ];
  
  export const splitAddress = location => {
    const searchStr = location.locationAddress.search("OR ");
    const returnStr = location.locationAddress.slice(0, searchStr + 2);
    return returnStr;
  };
  
  export const mapScriptUrl = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBtfnZ6N6bacxKS0861rTOfDAmGkEQpuRs&libraries=places&callback=initMap`;
  
  export const fourSquareURL = marker => {
    const fourSquareClientId = `BNQIDOE1JIW5EUV1GS3WU2XWFYIVHOK4MUV4K41IU2GWYR5T`;
    const fourSquareClientSecret = `3XHDBXGQNCEILPF0IR2OZHYR11IBRBRBYD12KM1RYZNG2QLJ`;
    return `https://api.foursquare.com/v2/venues/${
      marker.fourSqId
    }/photos?client_id=${
      fourSquareClientId
    }&client_secret=${
      fourSquareClientSecret
    }&v=20181118`;
  };
  
