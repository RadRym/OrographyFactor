OrographyFactor
===============

OrographyFactor is a web-based application designed to calculate the orography factor, typically used in wind load analysis (e.g., according to Eurocode 1 / EN 1991-1-4). It features an interactive map interface allowing users to locate specific sites and assess terrain effects on wind velocity.

FEATURES
--------
* Interactive Map Interface:
    - Allows users to search for locations by address.
    - Visualizes the selected site on a map.

* Geocoding Integration:
    - Utilizes the OpenStreetMap Nominatim API to convert addresses into geographic coordinates.

* Calculation Logic:
    - Computes the orography factor based on terrain parameters (implied functionality based on standard wind engineering practices).
    - Dynamic updates of calculations based on user input.

* Lightweight Architecture:
    - Built using standard HTML, CSS, and vanilla JavaScript.
    - Client-side execution with no complex backend requirements.

PREREQUISITES
-------------
* A modern web browser (Chrome, Firefox, Edge, etc.).
* Internet connection (required for loading maps and OpenStreetMap API calls).

USAGE
-----
1. Extract the project files to a local folder.
2. Open the "index.html" file in your web browser.
3. Enter an address or location in the search bar.
4. The application locates the site and performs the relevant orography factor calculations (based on the implemented logic in script.js).
