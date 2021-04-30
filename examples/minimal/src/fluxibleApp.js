import Fluxible from "fluxible";
import App from "./App";
import UuidStore from "./UuidStore";

const fluxibleApp = new Fluxible({ component: App });

fluxibleApp.registerStore(UuidStore);

export default fluxibleApp;
