import React from 'react';
import { IndexRoute, Route } from 'react-router';
import Application from './Application';
import Home from './Home';
import About from './About';

const routes = (
    <Route name="app" path="/" component={Application}>
        <Route name="about" path="about" component={About} />
        <IndexRoute name="home" component={Home} />
    </Route>
);

export default routes;
