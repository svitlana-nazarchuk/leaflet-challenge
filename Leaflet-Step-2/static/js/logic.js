url="https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

function markerSize(magnitude){
  return magnitude*10000;
};

//Function for a color of a circle marker
function markerColor(magnitude){
  var color;
  if (magnitude<1){
    color="green"
  }
  else if (magnitude<2){
    color ="yellow"
  }
  else if (magnitude<3){
    color = "gold"
  }
  else if (magnitude<4){
    color = "orange"
  }
  else if (magnitude<5){
    color = "red"
  }
  else color="brown";
  return color;
}; 


  
// Define  tile layers  
var streetMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY
});

var basicMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets-basic",
    accessToken: API_KEY
});

var darkMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: API_KEY
});


var baseMaps = {
    "Streets": streetMap,
    "Basic streets": basicMap,
    "Dark": darkMap
    
};

var legend = L.control({ position: "bottomright" });

legend.onAdd = function() {
    var div = L.DomUtil.create("div", "info legend");
    var labels = ["green", "yellow", "gold", "orange", "red", "brown"];
    var grades = [0, 1, 2, 3, 4, 5];

    
    var legendInfo = "<h3>Magnitude</h3>";
    
    for (var i = 0; i < grades.length; i++) {
      div.innerHTML +=
          "<li style=\"background-color: " + labels[i] + "\"></i> " +
          grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] +'<br>' : '+');
      
        } 

    div.innerHTML = legendInfo + div.innerHTML;
    return div;
};

d3.csv("static/data/t_plates.csv", function(data){

  var tPlates=[]
  
  for(i=0;i<data.length; i++){
    if((data[i].StartLong>0)&&(data[i].FinalLong<0)){tPlates=tPlates}
    else if((data[i].StartLong<0)&&(data[i].FinalLong>0)){tPlates=tPlates}
    else{tPlates.push(L.polygon([[data[i].StartLat, data[i].StartLong],[data[i].FinalLat, data[i].FinalLong]],{color:"red"}));}
    }
  // next file
  d3.json(url, function(response){
    var magnitudeMarkers = [];

    for(var i=0; i<response.features.length; i++){
      earthquake=response.features[i];
      marker=L.circle([earthquake.geometry.coordinates[1], earthquake.geometry.coordinates[0]],
        {fillOpacity:0.8,
        color:markerColor(earthquake.properties.mag),
        fillColor:markerColor(earthquake.properties.mag),
        radius: markerSize(earthquake.properties.mag)
            }).bindPopup(`<h3>${earthquake.properties.place}<hr>magnitude: ${earthquake.properties.mag}<h3>`);
          
      magnitudeMarkers.push(marker);
    };
    
    magLayer=L.layerGroup(magnitudeMarkers);
    tecLayer=L.layerGroup(tPlates);
      
    // Overlays that may be toggled on or off
    var overlayMaps = {
        "Magnitude": magLayer, 
        "Tectonic plates": tecLayer
      }; 

    // Create map object and set default layers
    var myMap = L.map("map", {
      center:[20.50, 10.68],
      zoom: 3,
      layers: [streetMap, magLayer]
        });

    L.control.layers(baseMaps, overlayMaps, {collapsed:false}).addTo(myMap);
    legend.addTo(myMap);
  
  }); 

}); 
  
  