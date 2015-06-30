if (process.env.NODE_ENV !== 'production') {
    console.warn('`provideContext` has moved to the ' +
        '`fluxible-addons-react` package.');
    console.trace();
}
module.exports = require('fluxible-addons-react/provideContext');
