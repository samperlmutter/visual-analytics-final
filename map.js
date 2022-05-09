// L.map accept the ID of the DIV as an input
let map = L.map("map").setView([37.8, -96], 4);
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
    'August', 'September', 'October', 'November', 'December'];

L.tileLayer("https://{s}.tile.openstreetmap.de/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright%22%3EOpenStreetMap</a>',
}).addTo(map);

let info = L.control();

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
};

info.update = function (props) {
    this._div.innerHTML = '<h4>Fire Occurances</h4>' +  (props ?
        '<b>' + props['NAME'] + '</b><br />' + props['FireCount'] + ' fires per year'
        : 'Hover over a state');
};

info.addTo(map);

let markerLayer;
let markerLayers = [];
for (let i = 0; i < months.length; i++) {
    markerLayers.push(L.layerGroup().setZIndex(1000));
}

let geoJson;
d3.json("fires-by-state.geojson").then(function (dataset){
    geoJson = L.geoJson(dataset, {
        style:fireCountStyle,
        onEachFeature:onEachFeature
    }).setZIndex(100).addTo(map);

    d3.json("2017Fires.geojson").then(function (dataset){
        let markerData = [];
        for (let i of dataset["features"]) {
            let lat = i['properties']["LATITUDE"]
            let lon = i['properties']["LONGITUDE"]
            let acre = i['properties']["ACRES"]
            let type = i['properties']["FIRE_TYPE"]
            let month = parseInt(i['properties']['IG_DATE'].slice(5, 7));
            markerData.push({
                lat:lat,
                lon:lon,
                acre:acre,
                type:type,
                month:month
            });
        }

        for (let m of markerData) {
            markerLayers[m.month - 1].addLayer(addMarker(m));
        }

        markerLayer = L.layerGroup(markerLayers).setZIndex(1000).addTo(map);
    });
});

let btn1 = document.createElement("button");
btn1.innerHTML = "Clear Map";
btn1.addEventListener("click", function () {
    map.removeLayer(markerLayer);
});
document.body.appendChild(btn1);

let btn = document.createElement("button");
btn.innerHTML = "Show Fires by Size and Type";
btn.addEventListener("click", function () {
    map.removeLayer(markerLayer);
    map.addLayer(markerLayer);
});
document.body.appendChild(btn);

let timeSlider = document.createElement('input');

timeSlider.type = 'range';
timeSlider.min = '1';
timeSlider.max = '12';
timeSlider.value = '1';

let monthDisplay = document.createElement('span');
monthDisplay.innerText = 'Month: ' + months[parseInt(timeSlider.value) - 1];

timeSlider.oninput = function () {
    map.eachLayer(function (layer) {
        if (markerLayers.includes(layer)) {
            map.removeLayer(layer);
        }
    });
    map.addLayer(markerLayers[parseInt(timeSlider.value) - 1]);
    monthDisplay.innerText = 'Month: ' + months[parseInt(timeSlider.value) - 1];
};

document.body.appendChild(timeSlider);
document.body.appendChild(monthDisplay);

function addMarker(data) {
    var marker = L.circleMarker([data['lat'],data['lon']],  {
    });
    marker.setRadius(data['acre']/10000);

    switch(data['type']){
        case 'Prescribed Fire': marker.setStyle({color: 'green'})
            break;
        case 'Wildfire': marker.setStyle({color: 'blue'})
            break;
        default: marker.setStyle({color: 'grey'})
    }

    return marker;
}

//legend
var legend = L.control({position: 'bottomleft'});

legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'legend'),
        grades = [10, 20, 30, 40, 50, 60],
        labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getFireCountColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};

legend.addTo(map);


function fireCountStyle(feature) {
    return {
        fillColor: getFireCountColor(feature['properties']['FireCount']),
        weight: 2,
        opacity: 1,
        color: "white",
        dashArray: "3",
        fillOpacity: 0.7,
    };
}

function getFireCountColor(d) {
    let colors = [
        "#ffffb2",
        "#fed976",
        "#feb24c",
        "#fd8d3c",
        "#fc4e2a",
        "#e31a1c",
        "#b10026",
    ];

    return d < 10
        ? colors[0]
        : d < 20
            ? colors[1]
            : d < 30
                ? colors[2]
                : d < 40
                    ? colors[3]
                    : d < 50
                        ? colors[4]
                        : d < 60
                            ? colors[5]
                            : colors[6];
}

function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }

    info.update(layer['feature']['properties']);
}

function resetHighlight(e) {
    geoJson.resetStyle(e.target);
    info.update();
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight
    });
}