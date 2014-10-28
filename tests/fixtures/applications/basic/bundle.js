module.exports = {
    actions: {
        updateTime: require('./actions/updateTime')
    },
    controllerViews: {
        BasicApp: require('./components/Application'),
        Home: require('./components/Home')
    },
    stores: {
        ApplicationStore: require('./stores/ApplicationStore'),
        TimeStore: require('./stores/TimeStore')
    }
};
