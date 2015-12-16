function MockServiceManager () {
    this.services = {};
    this.serviceCalls = [];
}

MockServiceManager.prototype.setService = function (name, fetcher) {
    this.services[name] = fetcher;
};

MockServiceManager.prototype.read = function (name) {
    var args = Array.prototype.slice.call(arguments);
    args.shift();
    args.unshift('read');
    this.serviceCalls.push(args.concat(name));
    if (!this.services[name]) {
        throw new Error('Fetcher ' + name + ' has not been registered to mock fetcher');
    }
    this.services[name].apply(null, args);
};

MockServiceManager.prototype.create = function (name) {
    var args = Array.prototype.slice.call(arguments);
    args.shift();
    args.unshift('create');
    this.serviceCalls.push(args.concat(name));
    this.services[name].apply(null, args);
};

MockServiceManager.prototype.update = function (name) {
    var args = Array.prototype.slice.call(arguments);
    args.shift();
    args.unshift('update');
    this.serviceCalls.push(args.concat(name));
    this.services[name].apply(null, args);
};

MockServiceManager.prototype['delete'] = function (name) {
    var args = Array.prototype.slice.call(arguments);
    args.shift();
    args.unshift('del');
    this.serviceCalls.push(args.concat(name));
    this.services[name].apply(null, args);
};

module.exports = MockServiceManager;
