// --------
//  Global
// --------


// Available languages
pg.langs = ['gl', 'es', 'en'];


pg.setLang = function (newLang) {
    pg.config.lang = pg.langs.includes(newLang) ? newLang : pg.langs[0];

    document.getElementsByTagName('html')[0].setAttribute('lang', pg.config.lang);
}


// Application language
pg.setLang(pg.config.lang);


// -------------
//  Google Maps
// -------------


// Google Maps API request
createMapRequest();


function createMapRequest() {
    var mapRequest = document.createElement('script');

    mapRequest.setAttribute('src', 'https://maps.googleapis.com/maps/api/js?libraries=geometry&callback=initMap&key=' + pg.config.apiKeys.google);
    mapRequest.setAttribute('async', '');
    mapRequest.setAttribute('defer', '');

    document.getElementsByTagName('body')[0].appendChild(mapRequest);
}


function initMap() {
    pg.mapConfig = {
        center: {
            lat: 42.75,
            lng: -7.90
        },
        bounds: {
            east: -6.80,
            north: 43.90,
            south: 41.70,
            west: -9.50
        },
        geoLocation: true
    };

    pg.map = new google.maps.Map(document.getElementById('map'), {
        mapTypeId: 'hybrid',
        center: pg.mapConfig.center
    });

    pg.centerMarker = new google.maps.Marker({
        map: pg.map,
        visible: false
    });

    pg.coastArea = new google.maps.Polygon({
        map: pg.map,
        paths: [
            {lat: 42.87, lng: -9.50},    // Fisterra
            {lat: 43.10, lng: -9.50},    // Muxía
            {lat: 43.27, lng: -9.37},    // Laxe
            {lat: 43.50, lng: -8.90},    // Malpica
            {lat: 43.48, lng: -8.57},    // A Coruña
            {lat: 43.65, lng: -8.50},    // Ferrol
            {lat: 43.90, lng: -8.00},    // Ortigueira
            {lat: 43.90, lng: -7.50},    // Viveiro
            {lat: 43.70, lng: -7.10},    // Ribadeo
            {lat: 43.70, lng: -6.80},    // Navia
            {lat: 43.20, lng: -6.80},    // Cangas del Narcea
            {lat: 43.20, lng: -7.70},    // Vilalba
            {lat: 42.90, lng: -8.30},    // Santiago
            {lat: 41.95, lng: -8.20},    // Braga
            {lat: 41.70, lng: -8.80},    // Viana do Castelo 1
            {lat: 41.70, lng: -9.05},    // Viana do Castelo 2
            {lat: 42.30, lng: -9.12},    // Bueu
            {lat: 42.45, lng: -9.25},    // O Grove
            {lat: 42.65, lng: -9.28}     // Muros
        ],
//         visible: false
        // DEBUG
        strokeColor: 'red',
        strokeWeight: 1
    });

    resetMap();

    // DEBUG
    new google.maps.Rectangle({
        bounds: pg.mapConfig.bounds,
        map: pg.map,
        strokeColor: 'yellow',
        strokeWeight: 1
    });
}


function resetMap() {
    pg.map.fitBounds(pg.mapConfig.bounds);

    setCenterMarker(pg.mapConfig.center);

    if ((pg.mapConfig.geoLocation === true) && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            pg.mapConfig.center = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            pg.mapConfig.geoLocation = true;

            setCenterMarker(pg.mapConfig.center);
        });
    }
}


function setCenterMarker(center) {
    var mapCenter = new google.maps.LatLng(center);

    if (google.maps.geometry.poly.containsLocation(mapCenter, pg.coastArea)) {
        pg.map.setCenter(mapCenter);

        pg.centerMarker.setPosition(mapCenter);
        pg.centerMarker.setAnimation(google.maps.Animation.DROP);
        pg.centerMarker.setVisible(true);
    }
}
