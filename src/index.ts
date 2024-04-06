import * as dotenv from "dotenv";
import { initServer } from "./app";

dotenv.config();

async function init() {
  const app = await initServer();

  app.listen(process.env.PORT || 8080, () =>
    console.log(`app listening on PORT ${process.env.PORT || 8080}`)
  );
}

init();
