const path = require('path');

module.exports = {
    recursive: true,
    reporter: 'spec',
    require: path.join(__dirname, './testSetup'),
    timeout: 10000
};
