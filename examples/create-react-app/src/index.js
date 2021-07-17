import ReactDOM from 'react-dom';
import { createElementWithContext } from 'fluxible-addons-react';
import fluxibleApp from './fluxibleApp';

const context = fluxibleApp.createContext();
const element = createElementWithContext(context);
const rootElement = document.getElementById('root');

ReactDOM.render(element, rootElement);
