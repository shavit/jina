
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

function selectSegment(id){
  var center = segments[id].path[Math.round((segments[id].path.length)/2)]
  // map.setView(center, map._zoom, {})
  map.setView(center, 12, {})
}

function loadSegments(){
  if (!map){
    var waitForMap = setInterval(function(){
      if (map){
        clearInterval(waitForMap)
        loadSegments()
      }
    }, 300)
  } else {

    $.get("/api/v1/segments/index", function(data) {
      if (data){
        var ids = new Array()

        $segmentList =  $(".segment-list")
        for (var i=0; i<data.length; i++){
          // Check if the segment already in the view
          if (ids.indexOf(data[i].id) < 0){
            ids.push(data[i].id)
            segments[data[i].id] = data[i]
            displaySegment(data[i])
            $segment = $("<li class=\"mdl-list__item\" data-id=\""+data[i].id+"\" onclick=\"selectSegment("+data[i].id+")\" />")
            $segment.text(data[i].name)
            $segmentList.append($segment)
          }
        }
      }
    })

  }


}

function displaySegment(segment){
  var points = segment.path
  points.shift()
  var color = [
    "yellow",
    "red",
    "blue",
    "green",
    "brown",
    "ocean",
  ][Math.floor(Math.random() * 6) + 1]
  var polyline = L.polyline(points, {
      color: color
    })

  polyline.addTo(map)
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

    // for (var i=0; i<segments.length; i++){
    //   displaySegment(segments[i])
    // }
  })

}

function loadMap(){
  if (window.L) {
    // createMap()
    $("#mapView").html("")
    clearInterval(waitForLInterval)

    map = L.map("mapView", {
      center: latings[Math.round((latings.length)/2)],
      zoom: 12
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
var segments = new Array()

var routesURL = "/public/js/routes.json"
$.get(routesURL, function(data) {
  streamData = data.data
  displayRoute(streamData)
})

loadSegments()
