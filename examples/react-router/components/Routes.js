import React from 'react';
import { DefaultRoute, Route } from 'react-router';
import Application from './Application';
import Home from './Home';
import About from './About';

const routes = (
    <Route name="app" path="/" handler={Application}>
        <Route name="about" handler={About}/>
        <DefaultRoute name="home" handler={Home}/>
    </Route>
);

export default routes;
