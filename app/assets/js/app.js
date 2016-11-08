
//
// Configure the websocket
//
var userName = "guest"
var socket = new WebSocket("ws://"+window.location.host+"/api/v1/activities/stream?user="+userName)

var onMessage = function(e){
  console.log("New event: "+e)
}

socket.onmessage = function(e){
  onMessage(JSON.parse(e.data))
}

function displaySegment(segment){
  var points = [
    segment.startLatlng,
    segment.endLatlng,
  ]
  L.polyline(points, {
      color: "yellow"
    })
    .addTo(map)

  console.log(segment.startLatlng)
  console.log(segment.endLatlng)
}

function displayRoute(streamData){
  latings = streamData[0].data
  distances = streamData[1].data
  altitudes = streamData[2].data
}

function exploreSegments(){
  var bounds = map.getBounds()
  var northEastLat = bounds["_northEast"].lat
  var northEastLng = bounds["_northEast"].lng
  var southWestLat = bounds["_southWest"].lat
  var southWestLng = bounds["_southWest"].lng
  var url = "/api/v1/segments/explore?bounds=" +
    southWestLat + "," + southWestLng + "," +
    northEastLat + "," + northEastLng

  $.get(url, function(data){
    var segments = data.Segments

    for (var i=0; i<segments.length; i++){
      displaySegment(segments[i])
    }
  })

}

function loadMap(){
  if (window.L) {
    // createMap()
    $("#mapView").html("")
    clearInterval(waitForLInterval)

    map = L.map("mapView", {
      center: latings[Math.round((latings.length)/2)],
      zoom: 10
      })

    polyline = L
      .polyline(streamData[0].data, {
        color: "blue"
      })
      .addTo(map)

    L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png", {
      attribution: "&copy; <a href=\"http://osm.org/copyright\">OpenStreetMap</a> contributors"
    })
    .addTo(map)
  }

  map.on("moveend", exploreSegments)
}

//
//  Run
//

var map
var latings
var distances
var altitudes
var waitForLInterval = setInterval(loadMap, 300)

var routesURL = "/public/js/routes.json"
$.get(routesURL, function(data) {
  streamData = data.data
  displayRoute(streamData)
})
