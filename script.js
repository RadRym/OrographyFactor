document.addEventListener('DOMContentLoaded', function ()
{
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

                latitudeElement.textContent = 'Latitude: ' + latitude;
                longitudeElement.textContent = 'Longitude: ' + longitude;

                // Update marker position
                marker.setLatLng([latitude, longitude]);

                // Update map view to new coordinates
                map.setView([latitude, longitude]);


                // Update elevation
                calculateElevation(latitude, longitude)
                calculateAllDirectons(latitude, longitude)

            } else
            {
                alert('Nie można znaleźć współrzędnych dla podanego adresu.');
            }
        })
        .catch(error => console.error('Error:', error));
}

document.addEventListener('DOMContentLoaded', function ()
{
    initializeMap();
});

function initializeMap()
{
    // Initial coordinates for Brussels
    var initialLatitude = 50.8503;
    var initialLongitude = 4.3517;

    // Initialize Leaflet map
    map = L.map('map').setView([initialLatitude, initialLongitude], 13);

    // Definiuj warstwy map
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

    // Dodaj warstwy map do kontrolera warstw
    var baseMaps = {
        "Google Streets": googleStreets,
        "Google Hybrid": googleHybrid,
        "Google Satellite": googleSat,
        "Google Terrain": googleTerrain
    };

    // Domyślna warstwa mapy
    googleTerrain.addTo(map);

    // Dodaj kontroler warstw do mapy
    L.control.layers(baseMaps).addTo(map);

    // Add marker to the map
    marker = L.marker([initialLatitude, initialLongitude], { draggable: true }).addTo(map);

    var circle05km = L.circle([initialLatitude, initialLongitude], {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.05,
        weight: 1,
        radius: 500 // promień w metrach (0.5 km = 500 m)
    }).addTo(map);

    var circle1km = L.circle([initialLatitude, initialLongitude], {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.05,
        weight: 1,
        radius: 1000 // promień w metrach (1 km = 1000 m)
    }).addTo(map);

    var crossSize = 1100; // Wielkość krzyżyka w metrach (2 km = 2000 m)

    // Linia pionowa
    var verticalLine = L.polyline([
        [initialLatitude - crossSize / 111000, initialLongitude], // Współrzędne punktu startowego
        [initialLatitude + crossSize / 111000, initialLongitude]  // Współrzędne punktu końcowego
    ], {
        color: 'red',  // Kolor linii
        weight: 1,      // Grubość linii w pikselach
    }).addTo(map);

    // Linia pozioma
    var horizontalLine = L.polyline([
        [initialLatitude, initialLongitude - crossSize / (111000 * Math.cos(initialLatitude * Math.PI / 180))], // Współrzędne punktu startowego
        [initialLatitude, initialLongitude + crossSize / (111000 * Math.cos(initialLatitude * Math.PI / 180))]  // Współrzędne punktu końcowego
    ], {
        color: 'red',  // Kolor linii
        weight: 1,      // Grubość linii w pikselach
    }).addTo(map);

    marker.on('move', function (event)
    {
        var markerPosition = event.latlng;

        // Update circles position
        circle05km.setLatLng(markerPosition);
        circle1km.setLatLng(markerPosition);

        var markerPosition = event.latlng;

        // Oblicz nowe współrzędne linii
        var newVerticalLineCoords = [
            [markerPosition.lat - crossSize / 111000, markerPosition.lng],
            [markerPosition.lat + crossSize / 111000, markerPosition.lng]
        ];

        var newHorizontalLineCoords = [
            [markerPosition.lat, markerPosition.lng - crossSize / (111000 * Math.cos(markerPosition.lat * Math.PI / 180))],
            [markerPosition.lat, markerPosition.lng + crossSize / (111000 * Math.cos(markerPosition.lat * Math.PI / 180))]
        ];

        // Ustaw nowe współrzędne dla linii
        verticalLine.setLatLngs(newVerticalLineCoords);
        horizontalLine.setLatLngs(newHorizontalLineCoords);

    });

    // Add event listener for marker dragend event
    marker.on('dragend', function (event)
    {
        var markerPosition = event.target.getLatLng();
        var latitude = markerPosition.lat;
        var longitude = markerPosition.lng;
        calculateElevation(latitude, longitude)

        // Update latitude and longitude elements
        var latitudeElement = document.getElementById('latitude');
        var longitudeElement = document.getElementById('longitude');

        latitudeElement.textContent = latitude;
        longitudeElement.textContent = longitude;

        calculateAllDirectons(latitude, longitude)
    });
}

function calculateAllDirectons(latitude, longitude)
{
    // Calculate elevation for directions
    calculateElevationForDirection(latitude, longitude, 'north_05km', latitude + (0.5 / 111)); // 0.5 km north
    calculateElevationForDirection(latitude, longitude, 'south_05km', latitude - (0.5 / 111)); // 0.5 km south
    calculateElevationForDirection(latitude, longitude, 'east_05km', latitude, longitude + (0.5 / (111 * Math.cos(latitude * Math.PI / 180)))); // 0.5 km east
    calculateElevationForDirection(latitude, longitude, 'west_05km', latitude, longitude - (0.5 / (111 * Math.cos(latitude * Math.PI / 180)))); // 0.5 km west

    calculateElevationForDirection(latitude, longitude, 'north_1km', latitude + (1 / 111)); // 1 km north
    calculateElevationForDirection(latitude, longitude, 'south_1km', latitude - (1 / 111)); // 1 km south
    calculateElevationForDirection(latitude, longitude, 'east_1km', latitude, longitude + (1 / (111 * Math.cos(latitude * Math.PI / 180)))); // 1 km east
    calculateElevationForDirection(latitude, longitude, 'west_1km', latitude, longitude - (1 / (111 * Math.cos(latitude * Math.PI / 180)))); // 1 km west
}

// Funkcja do obliczania wysokości nad poziomem morza dla określonego kierunku z wykorzystaniem API Open-Meteo
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
                document.getElementById(`elevation_${direction}`).textContent = `${elevation} meters`;
            } else
            {
                document.getElementById(`elevation_${direction}`).textContent = 'Data not available';
            }
        })
        .catch(error => console.error('Error:', error));
}

// Funkcja do obliczania wysokości nad poziomem morza na podstawie współrzędnych geograficznych z wykorzystaniem API Open-Meteo
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
                document.getElementById('elevation').textContent = `${elevation} meters`;
            } else
            {
                document.getElementById('elevation').textContent = 'Data not available';
            }
        })
        .catch(error => console.error('Error:', error));
}

