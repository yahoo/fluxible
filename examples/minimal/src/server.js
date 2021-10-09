import path from 'path';
import ReactDOMServer from 'react-dom/server';
import express from 'express';
import { createElementWithContext } from 'fluxible-addons-react';
import serialize from 'serialize-javascript';
import fluxibleApp from './fluxibleApp';
import * as actions from './actions';

const app = express();

app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('*', (req, res) => {
    const context = fluxibleApp.createContext();

    context
        .executeAction(actions.setRandomNumber)
        .then(() => {
            const element = createElementWithContext(context);
            const markup = ReactDOMServer.renderToString(element);
            const state = serialize(fluxibleApp.dehydrate(context));

            res.send(`
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Fluxible Minimal Example</title>
  </head>
  <body>
    <div id="root">${markup}</div>
    <script>window.FLUXIBLE_STATE = ${state}</script>
    <script src="/assets/browser.js"></script>
  </body>
</html>
`);
        })
        .catch((err) => {
            console.error(err);
            res.send('Something went wrong');
        });
});

app.listen(8080, () => {
    console.log('Listening on http://localhost:8080');
});
