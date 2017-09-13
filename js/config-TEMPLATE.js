// Global variable for the app
var pg = {};


// ---------------------------
//  User-configurable options
// ---------------------------


pg.config = {
    // Application language
    //   [Galician (default): 'gl' | Spanish: 'es' | English: 'en']
    lang: 'gl',

    apiKeys: {
        // Google API key
        google: 'GOOGLE_API_KEY',
        // MeteoGalicia API key
        mg: 'METEOGALICIA_API_KEY'
    },

    urls: {
        // Absolute URL of the application's base directory
        baseDir: 'BASE_DIR_URL',
        // Absolute URL of the Python proxy needed for MeteoGalicia API requests (mgapi_proxy.py)
        mgProxy: 'METEOGALICIA_PROXY_URL'
    }
};
