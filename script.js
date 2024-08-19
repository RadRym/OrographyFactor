document.addEventListener('DOMContentLoaded', function ()
{
    initializeMap();
    calculate();
});

function calculate()
{
    var addressInput = document.getElementById('address').value;
    var url = 'https://nominatim.openstreetmap.org/search?q=' + encodeURIComponent(addressInput) + '&format=json&addressdetails=1';

    fetch(url)
        .then(response => response.json())
        .then(data =>
        {
            if (data.length > 0)
            {
                var latitude = parseFloat(data[0].lat);
                var longitude = parseFloat(data[0].lon);

                var latitudeElement = document.getElementById('latitude');
                var longitudeElement = document.getElementById('longitude');

                latitudeElement.textContent = latitude;
                longitudeElement.textContent = longitude;

                marker.setLatLng([latitude, longitude]);

                map.setView([latitude, longitude]);

                calculateElevation(latitude, longitude)
                calculateAllDirectons(latitude, longitude)

            } else
            {
                alert('Nie można znaleźć współrzędnych dla podanego adresu.');
            }
        })
        .catch(error => console.error('Error:', error));
}

function initializeMap()
{

    var initialLatitude = 50.8503;
    var initialLongitude = 4.3517;

    map = L.map('map').setView([initialLatitude, initialLongitude], 13);

    var googleStreets = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    });

    var googleHybrid = L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    });

    var googleSat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    });

    var googleTerrain = L.tileLayer('http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    });

    var baseMaps = {
        "Google Streets": googleStreets,
        "Google Hybrid": googleHybrid,
        "Google Satellite": googleSat,
        "Google Terrain": googleTerrain
    };

    googleTerrain.addTo(map);

    L.control.layers(baseMaps).addTo(map);

    marker = L.marker([initialLatitude, initialLongitude], { draggable: true }).addTo(map);

    var circle05km = L.circle([initialLatitude, initialLongitude], {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.05,
        weight: 1,
        radius: 500
    }).addTo(map);

    var circle1km = L.circle([initialLatitude, initialLongitude], {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.05,
        weight: 1,
        radius: 1000
    }).addTo(map);

    var crossSize = 1100;

    var verticalLine = L.polyline([
        [initialLatitude - crossSize / 111000, initialLongitude],
        [initialLatitude + crossSize / 111000, initialLongitude]
    ], {
        color: 'red',
        weight: 1,
    }).addTo(map);

    var horizontalLine = L.polyline([
        [initialLatitude, initialLongitude - crossSize / (111000 * Math.cos(initialLatitude * Math.PI / 180))],
        [initialLatitude, initialLongitude + crossSize / (111000 * Math.cos(initialLatitude * Math.PI / 180))]
    ], {
        color: 'red',
        weight: 1,
    }).addTo(map);

    marker.on('move', function (event)
    {
        var markerPosition = event.latlng;

        circle05km.setLatLng(markerPosition);
        circle1km.setLatLng(markerPosition);

        var markerPosition = event.latlng;

        var newVerticalLineCoords = [
            [markerPosition.lat - crossSize / 111000, markerPosition.lng],
            [markerPosition.lat + crossSize / 111000, markerPosition.lng]
        ];

        var newHorizontalLineCoords = [
            [markerPosition.lat, markerPosition.lng - crossSize / (111000 * Math.cos(markerPosition.lat * Math.PI / 180))],
            [markerPosition.lat, markerPosition.lng + crossSize / (111000 * Math.cos(markerPosition.lat * Math.PI / 180))]
        ];

        verticalLine.setLatLngs(newVerticalLineCoords);
        horizontalLine.setLatLngs(newHorizontalLineCoords);

    });

    marker.on('dragend', function (event)
    {
        var markerPosition = event.target.getLatLng();
        var latitude = markerPosition.lat;
        var longitude = markerPosition.lng;
        calculateElevation(latitude, longitude)

        var latitudeElement = document.getElementById('latitude');
        var longitudeElement = document.getElementById('longitude');

        latitudeElement.textContent = latitude;
        longitudeElement.textContent = longitude;

        calculateAllDirectons(latitude, longitude)
    });
}

function calculateAllDirectons(latitude, longitude)
{
    calculateElevationForDirection(latitude, longitude, 'north_05km', latitude + (0.5 / 111)); // 0.5 km north
    calculateElevationForDirection(latitude, longitude, 'south_05km', latitude - (0.5 / 111)); // 0.5 km south
    calculateElevationForDirection(latitude, longitude, 'east_05km', latitude, longitude + (0.5 / (111 * Math.cos(latitude * Math.PI / 180)))); // 0.5 km east
    calculateElevationForDirection(latitude, longitude, 'west_05km', latitude, longitude - (0.5 / (111 * Math.cos(latitude * Math.PI / 180)))); // 0.5 km west

    calculateElevationForDirection(latitude, longitude, 'north_1km', latitude + (1 / 111)); // 1 km north
    calculateElevationForDirection(latitude, longitude, 'south_1km', latitude - (1 / 111)); // 1 km south
    calculateElevationForDirection(latitude, longitude, 'east_1km', latitude, longitude + (1 / (111 * Math.cos(latitude * Math.PI / 180)))); // 1 km east
    calculateElevationForDirection(latitude, longitude, 'west_1km', latitude, longitude - (1 / (111 * Math.cos(latitude * Math.PI / 180)))); // 1 km west

    var heightInput = parseFloat(document.getElementById("height").value);
    heightInput = parseFloat(a);
    document.getElementById("total_elevation").textContent = `${heightInput} meters`;
}

function calculateElevationForDirection(latitude, longitude, direction, newLatitude = latitude, newLongitude = longitude)
{
    const apiUrl = `https://api.open-meteo.com/v1/elevation?latitude=${newLatitude}&longitude=${newLongitude}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data =>
        {
            if (data.elevation && data.elevation.length > 0)
            {
                const elevation = data.elevation[0];
                document.getElementById(`elevation_${direction}`).textContent = `${elevation}`;
                calculateTotalElevation();
            } else
            {
                document.getElementById(`elevation_${direction}`).textContent = 'Data not available';
            }
        })
        .catch(error => console.error('Error:', error));
}

function calculateElevation(latitude, longitude)
{
    const apiUrl = `https://api.open-meteo.com/v1/elevation?latitude=${latitude}&longitude=${longitude}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data =>
        {
            if (data.elevation && data.elevation.length > 0)
            {
                const elevation = data.elevation[0];
                document.getElementById('elevation').textContent = `${elevation}`;
            } else
            {
                document.getElementById('elevation').textContent = 'Data not available';
            }
        })
        .catch(error => console.error('Error:', error));
}

function calculateTotalElevation()
{

    var elevationNorth05kmText = document.getElementById("elevation_north_05km").textContent;
    var elevationNorth1kmText = document.getElementById("elevation_north_1km").textContent;
    var elevationSouth05kmText = document.getElementById("elevation_south_05km").textContent;
    var elevationSouth1kmText = document.getElementById("elevation_south_1km").textContent;
    var elevationEast05kmText = document.getElementById("elevation_east_05km").textContent;
    var elevationEast1kmText = document.getElementById("elevation_east_1km").textContent;
    var elevationWest05kmText = document.getElementById("elevation_west_05km").textContent;
    var elevationWest1kmText = document.getElementById("elevation_west_1km").textContent;
    var elevationText = document.getElementById("elevation").textContent;

    var elevationNorth05km = parseFloat(elevationNorth05kmText.split(" ")[0]);
    var elevationNorth1km = parseFloat(elevationNorth1kmText.split(" ")[0]);
    var elevationSouth05km = parseFloat(elevationSouth05kmText.split(" ")[0]);
    var elevationSouth1km = parseFloat(elevationSouth1kmText.split(" ")[0]);
    var elevationEast05km = parseFloat(elevationEast05kmText.split(" ")[0]);
    var elevationEast1km = parseFloat(elevationEast1kmText.split(" ")[0]);
    var elevationWest05km = parseFloat(elevationWest05kmText.split(" ")[0]);
    var elevationWest1km = parseFloat(elevationWest1kmText.split(" ")[0]);
    var elevation = parseFloat(elevationText.split(" ")[0]);

    var sum1km = elevationNorth1km + elevationSouth1km + elevationEast1km + elevationWest1km;
    var sum05km = elevationNorth05km + elevationSouth05km + elevationEast05km + elevationWest05km;

    var towerHeight = parseFloat(document.getElementById("height").value);

    var Am = 1 / 10 * (2 * elevation + sum1km + sum05km);
    var DeltaAc = elevation - Am;

    var OrographyFactor;
    if (towerHeight > 10)
    {
        OrographyFactor = 1 + 0.004 * DeltaAc * Math.exp(-0.014 * (towerHeight - 10));
    } else
    {
        OrographyFactor = 1 + 0.004 * DeltaAc * Math.exp(-0.014 * (10 - 10));
    }

    OrographyFactor = Math.ceil(OrographyFactor * 100) / 100;

    document.getElementById("orography_factor").textContent = OrographyFactor;

    if (OrographyFactor < 1.0)
    {
        document.getElementById("orography_factor_comment").textContent = "c0(z) <1.0";
    } else if (OrographyFactor > 1.15)
    {
        document.getElementById("orography_factor_comment").textContent = "Wymagana szczegółowa analiza";
    } else
    {
        document.getElementById("orography_factor_comment").textContent = ""; // Wyczyść komentarz, jeśli nie spełniono żadnego warunku
    }
    var OrographyFactorFormatted = OrographyFactor.toFixed(2);
    document.getElementById("orography_factor").textContent = OrographyFactorFormatted;
}
