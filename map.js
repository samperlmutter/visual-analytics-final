// L.map accept the ID of the DIV as an input
var map = L.map("map").setView([37.8, -96], 4);

L.tileLayer("https://{s}.tile.openstreetmap.de/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright%22%3EOpenStreetMap</a>',
}).addTo(map);

d3.json("2017Fires.geojson").then(function (dataset){
    console.log(dataset);
    let fires = {};
    for (let f of dataset['features']) {
        let state = f['properties']['FIRE_ID'].slice(0, 2)
        if (fires[state] === undefined) {
            fires[state] = [f];
        } else {
            fires[state].push(f);
        }
    }

    let btn = document.createElement("button");
    btn.innerHTML = "Show Fires by Size and Type";
    btn.addEventListener("click", function () {
        let latlng = [];
        for (let i of dataset["features"]) {
            let lat = i['properties']["LATITUDE"]
            let lon = i['properties']["LONGITUDE"]
            let acre = i['properties']["ACRES"]
            let type = i['properties']["FIRE_TYPE"]
            latlng.push({
                lat:lat,
                lon:lon,
                acre:acre,
                type:type
            })

        }

        //   L.geoJson(dataset, {
        //      style:style
        //  }).addTo(map);


        for(let l of latlng){
            var marker = L.circleMarker([l['lat'],l['lon']],  {
            });
            marker.setRadius(l['acre']/10000);

            switch(l['type']){
                case 'Prescribed Fire': marker.setStyle({color: 'green'})
                    break;
                case 'Wildfire': marker.setStyle({color: 'red'})
                    break;
                default: marker.setStyle({color: 'grey'})
            }


            marker.addTo(map);

        }


    });
    document.body.appendChild(btn);

    d3.json("fires-by-state.geojson").then(function (dataset){
        L.geoJson(dataset, {
            style:fireCountStyle
        }).addTo(map);
    });
});

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
            : d = "Unknown"
                ? colors[2]
                : d < 40
                    ? colors[3]
                    : d < 50
                        ? colors[4]
                        : d < 60
                            ? colors[5]
                            : colors[6];
}
