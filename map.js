// L.map accept the ID of the DIV as an input
let map = L.map("map").setView([37.8, -96], 4);

L.tileLayer("https://{s}.tile.openstreetmap.de/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright%22%3EOpenStreetMap</a>',
}).addTo(map);

d3.json("2017Fires.geojson").then(function (dataset){
    console.log(dataset);

    let latlng = [];
    for (let i of dataset["features"]) {
        let lat = i['properties']["LATITUDE"]
        let lon = i['properties']["LONGITUDE"]
        let acre = i['properties']["ACRES"]
        let type = i['properties']["FIRE_TYPE"]
        let month = parseInt(i['properties']['IG_DATE'].slice(5, 7));
        latlng.push({
            lat:lat,
            lon:lon,
            acre:acre,
            type:type,
            month:month
        })
    }

    let btn1 = document.createElement("button");
    btn1.innerHTML = "Clear Map";
    btn1.addEventListener("click", function () {
        map.eachLayer(function(layer){
            if (layer.options.radius !== undefined) {
                map.removeLayer(layer);
            }
        });
    });
    document.body.appendChild(btn1);

    let btn = document.createElement("button");
    btn.innerHTML = "Show Fires by Size and Type";
    btn.addEventListener("click", function () {
        for(let l of latlng){
            addMarker(l)
        }
    });
    document.body.appendChild(btn);

    let timeSlider = document.createElement('input');
    timeSlider.type = 'range';
    timeSlider.min = '1';
    timeSlider.max = '12';
    timeSlider.value = '1';

    timeSlider.oninput = function () {
        clearMarkers();
        for (let d of latlng) {
            if (parseInt(this.value) === d.month) {
                addMarker(d);
            }
        }
    };

    document.body.appendChild(timeSlider);
});

d3.json("fires-by-state.geojson").then(function (dataset){
    L.geoJson(dataset, {
        style:fireCountStyle
    }).addTo(map);
});

function addMarker(data) {
    var marker = L.circleMarker([data['lat'],data['lon']],  {
    });
    marker.setRadius(data['acre']/10000);

    switch(data['type']){
        case 'Prescribed Fire': marker.setStyle({color: 'green'})
            break;
        case 'Wildfire': marker.setStyle({color: 'red'})
            break;
        default: marker.setStyle({color: 'grey'})
    }

    marker.addTo(map);
}

function clearMarkers() {
    map.eachLayer(function (layer) {
        if (layer.options.radius !== undefined) {
            map.removeLayer(layer);
        }
    });
}


//legend
var legend = L.control({position: 'bottomleft'});

legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
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
    // var colors = ['#f2f0f7','#dadaeb','#bcbddc','#9e9ac8','#807dba','#6a51a3','#4a1486'];
    // colors = colors.reverse();
    // var colors = ['#f6eff7','#d0d1e6','#a6bddb','#67a9cf','#3690c0','#02818a','#016450'];
    var colors = [
        "#ffffb2",
        "#fed976",
        "#feb24c",
        "#fd8d3c",
        "#fc4e2a",
        "#e31a1c",
        "#b10026",
    ];
    // colors = colors.reverse();
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
