
// var google;

// function init() {
//     // Basic options for a simple Google Map
//     // For more options see: https://developers.google.com/maps/documentation/javascript/reference#MapOptions
//     // var myLatlng = new google.maps.LatLng(40.71751, -73.990922);
//     var myLatlng = new google.maps.LatLng(40.69847032728747, -73.9514422416687);
//     // 39.399872
//     // -8.224454
    
//     var mapOptions = {
//         // How zoomed in you want the map to start at (always required)
//         zoom: 7,

//         // The latitude and longitude to center the map (always required)
//         center: myLatlng,

//         // How you would like to style the map. 
//         scrollwheel: false,
//         styles: [
//             {
//                 "featureType": "administrative.country",
//                 "elementType": "geometry",
//                 "stylers": [
//                     {
//                         "visibility": "simplified"
//                     },
//                     {
//                         "hue": "#ff0000"
//                     }
//                 ]
//             }
//         ]
//     };

    

//     // Get the HTML DOM element that will contain your map 
//     // We are using a div with id="map" seen below in the <body>
//     var mapElement = document.getElementById('map');

//     // Create the Google Map using out element and options defined above
//     var map = new google.maps.Map(mapElement, mapOptions);
    
//     var addresses = ['New York'];

//     for (var x = 0; x < addresses.length; x++) {
//         $.getJSON('http://maps.googleapis.com/maps/api/geocode/json?address='+addresses[x]+'&sensor=false', null, function (data) {
//             var p = data.results[0].geometry.location
//             var latlng = new google.maps.LatLng(p.lat, p.lng);
//             new google.maps.Marker({
//                 position: latlng,
//                 map: map,
//                 icon: 'images/loc.png'
//             });

//         });
//     }
    
// }
// google.maps.event.addDomListener(window, 'load', init);



function initMap(){
                    // Map options
                    var options = {
                      zoom: 14,
                      center: { lat: 12.624289, lng: -8.030230 },
                      scrollwheel: false,
        styles: [
            {
                "featureType": "administrative.country",
                "elementType": "geometry",
                "stylers": [
                    {
                        "visibility": "simplified"
                    },
                    {
                        "hue": "#ff0000"
                    }
                ]
            }
        ]
                    };

                    // New map
                    var map = new google.maps.Map(
                      document.getElementById("map"),
                      options
                    );

                    // // // Listen for click on map
                    // google.maps.event.addListener(map, "click", function (
                    //   event
                    // ) {
                    //   // Add marker
                    //   addMarker({ coords: event.latLng });
                    // });

 
                    // Array of markers
                    var markers = [
                      {
                        coords: { lat: 12.623200, lng: -8.029607 },
                        // iconImage:
                          // "https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png",
                          iconImage:
                          "/static/user/images/malinova_logo_1.png",
                        content: "<h1>Malinova Technology</h1>",
                      },
                    //   {
                    //     coords: { lat: 12.741686, lng: -8.073952 },
                    //     content: "<h1>Testing 2</h1>",
                    //   }
                      
                    ];

                    // Loop through markers
                    for (var i = 0; i < markers.length; i++) {
                      // Add marker
                      addMarker(markers[i]);
                    }

                    // Add Marker Function
                    function addMarker(props) {
                      var marker = new google.maps.Marker({
                        position: props.coords,
                        map: map,
                        //icon:props.iconImage
                      });

                      // Check for customicon
                      if (props.iconImage) {
                        // Set icon image
                        marker.setIcon(props.iconImage);
                      }

                      // Check content
                      if (props.content) {
                        var infoWindow = new google.maps.InfoWindow({
                          content: props.content,
                        });

                        marker.addListener("click", function () {
                          infoWindow.open(map, marker);
                        });
                      }
                    }
                }
 