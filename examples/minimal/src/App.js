import React from "react";
import { provideContext } from "fluxible-addons-react";
import UuidGenerator from "./UuidGenerator";

const App = () => (
  <div>
    <h1>Fluxible Minimal Example</h1>
    <UuidGenerator />
  </div>
);

export default provideContext(App);
