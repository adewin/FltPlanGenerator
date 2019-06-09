//Made with the help of https://medium.com/attentive-ai/working-with-openlayers-4-part-2-using-markers-or-points-on-the-map-f8e9b5cae098 and www.sqlitetutorial.net/sqlite-nodejs/query/
/**
 * Elements that make up the popup.
 */
var flightpath = [];
var container = document.getElementById('popup');
var content = document.getElementById('popup-content');
var closer = document.getElementById('popup-closer');
var select = null; //Ref to currently selected airport
var selectedMarker = null;

//Add event listner to search box
var search = document.getElementById("search");
search.addEventListener("keyup", function(event) {
  if(event.keyCode === 13){
    event.preventDefault();
    goToAirport(search.value);
  }
});
/**
 * Create an overlay to anchor the popup to the map.
 */
var overlay = new ol.Overlay({
  element: container,
  autoPan: true,
  autoPanAnimation: {
    duration: 250
  }
});

var styles = [
  'Road',
  'Aerial',
  'AerialWithLabels'
];

var layers = [];
var i, ii;
for (i = 0, ii = styles.length; i < ii; ++i) {
  layers.push(new ol.layer.Tile({
    visible: false,
    preload: Infinity,
    source: new ol.source.BingMaps({
      key: 'AsInNxcQ0jt2Rk5aUvmJtik_6UMOIIrWbSoxMQ40iodBWQM31M2oVVu8fpwyy32o',
      imagerySet: styles[i],
      // use maxZoom 19 to see stretched tiles instead of the BingMaps
      // "no photos at this zoom level" tiles
      // maxZoom: 19
    })
  }));
}
var map = new ol.Map({
  target: 'map',
  layers: layers,
  loadTilesWhileInteracting: true,
  overlays: [overlay],
  view: new ol.View({
    center: ol.proj.fromLonLat([-77.171889, 39.171843]),
    code: 'EPSG:4326',
    zoom: 8
  })
});

var selectedlayer = document.getElementById('layer-select');
function onChange() {
  var style = selectedlayer.value;
  for (var i = 0, ii = layers.length; i < ii; ++i) {
    layers[i].setVisible(styles[i] === style);
  }
}
selectedlayer.addEventListener('change', onChange);
onChange();

var airportData = loadAirports();
var navaidData = loadNavaids();

//Iterate through airportLonLats and create markers
var smallAirportMarkers = [];
var mediumAirportMarkers = [];
var largeAirportMarkers = [];
var heliportMarkers = [];
var navaidMarkers = [];
var allMarkers = [];
var smallAirportsVectorSource = new ol.source.Vector({

});
var mediumAirportsVectorSource = new ol.source.Vector({

});
var largeAirportsVectorSource = new ol.source.Vector({

});
var heliportVectorSource = new ol.source.Vector({

});
var navaidVectorSource = new ol.source.Vector({

});
for(var i = 0; i < airportData.length; i++){
  //console.log(airportLonLats[i]);
  var marker = new ol.Feature({
    geometry: new ol.geom.Point(
      ol.proj.fromLonLat([parseFloat(airportData[i].long), parseFloat(airportData[i].lat)])
    ),
  });
  marker.data = airportData[i];
  var iconUri = getSrcFromAirportType();

  var markerStyle = new ol.style.Style({
    image: new ol.style.Icon(({
      scale: 0.7,
      src: iconUri,
    }))
  });
  marker.setStyle(markerStyle);
  allMarkers.push(marker);
  switch(marker.data.size){
    case("small_airport"):
      smallAirportMarkers.push(marker);
      break;
    case("medium_airport"):
      mediumAirportMarkers.push(marker);
      break;
    case("large_airport"):
      largeAirportMarkers.push(marker);
      break;
    case("heliport"):
      heliportMarkers.push(marker);
      break;
  }
  //vectorSource.addFeature(marker);
}
for(var i = 0; i < navaidData.length; i++){
  var marker = new ol.Feature({
    geometry: new ol.geom.Point(
      ol.proj.fromLonLat([parseFloat(airportData[i].long), parseFloat(airportData[i].lat)])
    ),
  });
  marker.data = navaidData[i];
  var iconUri = "rsc/vor.png";

  var markerStyle = new ol.style.Style({
    image: new ol.style.Icon(({
      scale: 0.1,
      src: iconUri,
    }))
  });
  marker.setStyle(markerStyle);
  navaidMarkers.push(marker);
  //vectorSource.addFeature(marker);
}

smallAirportsVectorSource.addFeatures(smallAirportMarkers);
mediumAirportsVectorSource.addFeatures(mediumAirportMarkers);
largeAirportsVectorSource.addFeatures(largeAirportMarkers);
heliportVectorSource.addFeatures(largeAirportMarkers);
navaidVectorSource.addFeatures(navaidMarkers);

var smallAirportsVectorLayer = new ol.layer.Vector({
  source: smallAirportsVectorSource,
  maxResolution: 800,
});
var mediumAirportsVectorLayer = new ol.layer.Vector({
  source: mediumAirportsVectorSource,
  maxResolution: 5000,
});
var heliportsVectorLayer = new ol.layer.Vector({
  source: heliportVectorSource,
  maxResolution: 5000,
});
var largeAirportsVectorLayer = new ol.layer.Vector({
  source: largeAirportsVectorSource,
});
var navaidsVectorLayer = new ol.layer.Vector({
  source: navaidVectorSource,
  maxResolution: 1200
});

map.addLayer(smallAirportsVectorLayer);
map.addLayer(mediumAirportsVectorLayer);
map.addLayer(heliportsVectorLayer);
map.addLayer(largeAirportsVectorLayer);
map.addLayer(navaidsVectorLayer);

//Select interations working on "singleclick"
var selectSingleClick = new ol.interaction.Select({
  condition: ol.events.condition.click
});

//Select interaction working on "pointermove"
var selectPointerMove = new ol.interaction.Select({
  condition: ol.events.condition.pointerMove
});

map.getView().on('change:resolution', (event) => {
    var zoom = map.getView().getZoom();
});

/**
 * Add a click handler to hide the popup.
 * @return {boolean} Don't follow the href.
 */
closer.onclick = function() {
  overlay.setPosition(undefined);
  closer.blur();
  //map.removeInteraction(select);
  return false;
};

var changeInteraction = function(){
  if(select !== null){
    map.removeInteraction(select);
    featureSelected = false;
  }
  select = selectSingleClick;
  if(select !== null){
    map.addInteraction(select);
    select.on('select', function(e){
      var marker = e.selected[0];
      selectedMarker = marker;
      console.log(marker.data);
      var coordinate = e.selected[0].getGeometry().getCoordinates();
      var runways = strToRunways(marker.data.runways);
      var lens = strToLens(marker.data.runways);
      var runwaystable = generateRunwaysTable(runways, lens);
      var frequenciestable = generateFrequenciesTable(marker.data.frequencies);
      content.innerHTML ='<p>' + titleCase(marker.data['navaidname']) + '</p><p>Runways:</p>' + runwaystable + '<p>Frequencies:</p>' + frequenciestable + '<button type="button" onclick="addToFlightPath()" class="btn btn-success">Add to flight</button>';
      overlay.setPosition(coordinate);
      //alert(marker.data.navaidname);
    })
  }   
}
changeInteraction();

function addToFlightPath(){
  flightpath.push(selectedMarker);
  console.log(flightpath);
  var points = [];
  if(flightpath.length > 1){
    for(var i = 0; i < flightpath.length; i++){
      console.log(ol.proj.fromLonLat([flightpath[i].data.long, flightpath[i].data.lat]))
      points.push(ol.proj.fromLonLat([parseFloat(flightpath[i].data.long), parseFloat(flightpath[i].data.lat)]));
    }
    var lineString = new ol.geom.LineString(points);

    // create the feature
    var feature = new ol.Feature({
        geometry: lineString,
        name: 'Line'
    });

    var lineStyle = new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: '#ffcc33',
            width: 5
        })
    });
    var source = new ol.source.Vector({
        features: [feature]
    });
    var vector = new ol.layer.Vector({
        source: source,
        style: [lineStyle]
    });
    map.addLayer(vector);
  }
}
function strToRunways(data){
  if(data !== undefined){
    var output = ""
    var runwayStrs = data.split("_");
    for(runway = 0; runway < runwayStrs.length -1; runway++)
    {
      var runwayDesigRaw = runwayStrs[runway].substring(runwayStrs[runway].indexOf("*")+1, runwayStrs[runway].indexOf("-"));
      var runwayDesigClean = runwayDesigRaw.substring(0,runwayDesigRaw.length/2) + " - " + runwayDesigRaw.substring(runwayDesigRaw.length/2,runwayDesigRaw.length);
      output += runwayDesigClean + "\n";
    }
    return output;
  }
}
function strToLens(data){
  if(data !== undefined){
    var output = ""
    var runwayStrs = data.split("_");
    for(runway = 0; runway < runwayStrs.length -1; runway++)
    {
      var runwayLens = numberWithCommas(runwayStrs[runway].split("-")[1].split("*")[1].split("-")[0]) + "'";
      output += runwayLens + "\n";
    }
    return output;
  }
}
function generateRunwaysTable(runways, lens){
  if(runways !== undefined || lens !== undefined){
    var table ='<table class="table table-dark">\
                  <tbody>';
    var runwaysarr = runways.split("\n");
    var lensarr = lens.split("\n");
    for(var i = 0; i < runwaysarr.length - 1; i++)
    {
      table += '<tr><td>' + runwaysarr[i] + '</td>';
      table += '<td>' + lensarr[i] + '</td></tr>';
    }
    table += '</tbody>';
    table += '</table>';
    return table;
  }
  else{
    return '<p>None :(</p>';
  }
}
function generateFrequenciesTable(frequencies){
  if(frequencies !== "none" && frequencies !== undefined){
    var table ='<table class="table table-dark">\
                  <tbody>';
    var frequenciesarr = [];
    console.log(frequencies);
    for(var i = 0; i < frequencies.split("_").length -1; i++){
      var frequency = frequencies.split("_")[i];
      frequenciesarr.push([frequency.split("type*")[1].split("-")[0], frequency.split("freq*")[1].split("M")[0]]);
    }
    console.log(frequenciesarr);
    for(var i = 0; i < frequenciesarr.length - 1; i++)
    {
      table += '<tr><td>' + frequenciesarr[i][0] + '</td>';
      table += '<td>' + frequenciesarr[i][1] + '</td></tr>';
    }
    table += '</tbody>';
    table += '</table>';
    console.log(table);
    return table;
  }
  else{
    return "<p>None :(</p>";
  }
}
function loadAirports(){
  var xhttp;
  xhttp = new XMLHttpRequest();
  var response;
  xhttp.onreadystatechange = function(){
    if(this.readyState == 4 && this.status == 200){
      response = this.responseText;
    }
  };
  xhttp.open("GET", "getairports.php", false);
  xhttp.send();
  return JSON.parse(response); //The AJAX call should reply with a json object containing every airport in the world's longitude and latitude
}
function loadNavaids(){
  var xhttp;
  xhttp = new XMLHttpRequest();
  var response;
  xhttp.onreadystatechange = function(){
    if(this.readyState == 4 && this.status == 200){
      response = this.responseText;
    }
  };
  xhttp.open("GET", "getnavaids.php", false);
  xhttp.send();
  return JSON.parse(response); //The AJAX call should reply with a json object containing every airport in the world's longitude and latitude
}
function getSrcFromAirportType(){
  if(marker.data.frequencies.includes("TWR")) 
    return '/rsc/Civilairportwithnocontroltowersmall.png';
  else
    return '/rsc/Civilairportwithcontroltowersmall.png'
}
function titleCase(str) {
  str = str.toLowerCase().split(' ');
  for (var i = 0; i < str.length; i++) {
    str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1); 
  }
  return str.join(' ');
}
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function goToAirport(airport){
  var airportLonLat = [];
  for(var i = 0; i < allMarkers.length; i++){
    var currentMarker = allMarkers[i];
    if(airport.toUpperCase() === currentMarker.data.name){
      console.log(currentMarker);
      openOverlay(currentMarker);
    }
  }
}
function openOverlay(marker){
  console.log("Openin'");
  var changeInteraction = function(){
    select = selectSingleClick;
    map.addInteraction(select);
    var marker = e.selected[0];
    selectedMarker = marker;
    console.log(marker.data);
    var coordinate = e.selected[0].getGeometry().getCoordinates();
    var runways = strToRunways(marker.data.runways);
    var lens = strToLens(marker.data.runways);
    var runwaystable = generateRunwaysTable(runways, lens);
    var frequenciestable = generateFrequenciesTable(marker.data.frequencies);
    content.innerHTML ='<p>' + titleCase(marker.data['navaidname']) + '</p><p>Runways:</p>' + runwaystable + '<p>Frequencies:</p>' + frequenciestable + '<button type="button" onclick="addToFlightPath()" class="btn btn-success">Add to flight</button>';
    overlay.setPosition(coordinate);
    //alert(marker.data.navaidname);
    }
}