import { v4 as uuidv4 } from "uuid";

const generateUuidAction = (context) => {
  const uuid = uuidv4();
  context.dispatch("SET_UUID", { uuid });
};

export default generateUuidAction;
