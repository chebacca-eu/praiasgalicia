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

    findBeaches();

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


// --------------
//  MeteoGalicia
// --------------


pg.data = {
    'places': [],
    'markers': [],
    'info': []
};


function findBeaches() {
    var params = {
        'location': 'praia',
        'types': 'beach',
        'lang': pg.config.lang
    };
    requestData('findPlaces', params, drawMarkers);
}


// TODO: Request data from MeteoGalicia via XMLHTTPRequest
//       Doesn't work yet, CORS needs to be activated in their server
//
// function requestData(operation, params) {
    // var paramStr = '&location=praia&types=beach';

    // var request = new XMLHttpRequest();
    // request.addEventListener('load', drawMarkers);
    // request.addEventListener('error', function () {
    //     console.log("ERROR!");
    // });

    // request.open('GET', 'http://servizos.meteogalicia.es/apiv3/' + operation + '?API_KEY=' + pg.config.apiKeys.mg + paramStr);
    // request.setRequestHeader('Accept', 'application/json');
    // request.responseType = 'json';
    // request.send();
// }


// TODO: Get data from MeteoGalicia through a Python proxy
//       When (If) CORS is activated in their server, do it directly via XMLHTTPRequest instead
//
function requestData(operation, params, callback) {
    var paramStr = '';
    for (var key in params) {
        paramStr += '&' + key + '=' + params[key];
    }

    var request = new XMLHttpRequest();
    request.addEventListener('load', callback);
    request.addEventListener('error', function () {
        console.log("ERROR!");
    });

    request.open('GET', pg.config.urls.mgProxy + '?operation=' + operation + '&API_KEY=' + pg.config.apiKeys.mg + paramStr);
    request.setRequestHeader('Accept', 'application/json');
    request.responseType = 'json';
    request.send();
}


function drawMarkers() {
    pg.data.places = this.response;
    pg.data.markers = pg.data.places.features.map(function (place) {
        return new google.maps.Marker({
            position: {
                lat: place.geometry.coordinates[1],
                lng: place.geometry.coordinates[0]
            },
            title: place.properties.name
        });
    });

    pg.infoWindow = new google.maps.InfoWindow();
    var place, params;

    pg.data.markers.forEach(function (marker, i) {
        place = pg.data.places.features[i];
        marker.addListener('visible_changed', function () {
            console.log("i: " + i);
        });
        marker.addListener('click', function () {
            var content = getInfoContent(place, i);
            infoWindow.setContent(content);
            infoWindow.open(pg.map, marker);
        });
    });
}


function getInfoContent(place, i) {
    var info;
    var info0;

    var content = '<h1>' + place.properties.name + '</h1>' +
                  '<p>' + place.properties.municipality + ' (' + place.properties.province + ')</p>' +
                  '<p>' + pg.data.info[i].value +
                  '<img src="' + pg.data.info[i].iconURL + '"></p>';
}
