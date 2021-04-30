import React from "react";
import { connectToStores } from "fluxible-addons-react";
import UuidStore from "./UuidStore";
import generateUuidAction from "./generateUuidAction";

const UuidGenerator = ({ uuid, generateUuid }) => (
  <div>
    <p>
      <b>UUID:</b> {uuid}
    </p>
    <button onClick={generateUuid}>Generate new UUID</button>
  </div>
);

export default connectToStores(UuidGenerator, [UuidStore], (context) => ({
  uuid: context.getStore(UuidStore).getUuid(),
  generateUuid: () => context.executeAction(generateUuidAction),
}));
