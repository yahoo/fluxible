/*globals document*/

import React from 'react';
import Nav from './Nav';
import ApplicationStore from '../stores/ApplicationStore';
import { connectToStores, provideContext } from 'fluxible-addons-react';
import { handleHistory } from 'fluxible-router';
import pages from '../configs/routes';

class Application extends React.Component {
    render() {
        var Handler = this.props.currentRoute.get('handler');

        return (
            <div>
                <Nav currentRoute={this.props.currentRoute} links={pages} />
                <Handler />
            </div>
        );
    }

    componentDidUpdate(prevProps, prevState) {
        const newProps = this.props;
        if (newProps.pageTitle === prevProps.pageTitle) {
            return;
        }
        document.title = newProps.pageTitle;
    }
}

export default provideContext(handleHistory(connectToStores(
    Application,
    [ApplicationStore],
    function (context, props) {
        var appStore = context.getStore(ApplicationStore);
        return {
            pageTitle: appStore.getPageTitle()
        };
    }
)));
