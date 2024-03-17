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
    });
}

// Funkcja do obliczania wysokości nad poziomem morza na podstawie współrzędnych geograficznych
function calculateElevation(latitude, longitude)
{
    var url = `https://api.open-elevation.com/api/v1/lookup?locations=${latitude},${longitude}`;

    fetch(url)
        .then(response => response.json())
        .then(data =>
        {
            if (data && data.results && data.results.length > 0)
            {
                var elevation = data.results[0].elevation;
                document.getElementById('elevation').textContent = `${elevation} meters`;
            } else
            {
                document.getElementById('elevation').textContent = ' data not available';
            }
        })
        .catch(error => console.error('Error:', error));
}
