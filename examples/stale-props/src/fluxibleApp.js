import Fluxible from 'fluxible';
import ListStore from './ListStore';

const fluxibleApp = new Fluxible({});

fluxibleApp.registerStore(ListStore);

export default fluxibleApp;
