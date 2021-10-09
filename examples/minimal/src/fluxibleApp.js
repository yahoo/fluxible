import Fluxible from 'fluxible';
import App from './App';
import AppStore from './AppStore';

const fluxibleApp = new Fluxible({ component: App });

fluxibleApp.registerStore(AppStore);

export default fluxibleApp;
