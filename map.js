// L.map accept the ID of the DIV as an input
var map = L.map("map").setView([37.8, -96], 4);

L.tileLayer("https://{s}.tile.openstreetmap.de/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright%22%3EOpenStreetMap</a>',
}).addTo(map);

d3.json("2017 Fire Occurances/2017Fires.geojson").then(function (dataset){
    console.log(dataset);

    L.geoJson(dataset, {
        style:style
    }).addTo(map);
});

function style(feature) {
    return {
        fillColor: getColor(feature.properties.Obesity),
        weight: 2,
        opacity: 1,
        color: "white",
        dashArray: "3",
        fillOpacity: 0.7,
    };
}

function getColor(d) {
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
    return d < 20
        ? colors[0]
        : d < 25
            ? colors[1]
            : d < 30
                ? colors[2]
                : d < 35
                    ? colors[3]
                    : d < 40
                        ? colors[4]
                        : d < 45
                            ? colors[5]
                            : colors[6];
}
