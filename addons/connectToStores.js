if (process.env.NODE_ENV !== 'production') {
    console.warn('`connectToStores` has moved to the ' +
        '`fluxible-addons-react` package.');
}
module.exports = require('fluxible-addons-react/connectToStores');
