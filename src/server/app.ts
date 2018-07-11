/* eslint-disable no-console, newline-after-var */
import "babel-polyfill";
import * as express from "express";
import * as bodyParser from "body-parser";
import * as mongoose from "mongoose";
import * as settings from "settings";
import * as morgan from "morgan";
import * as cors from "cors";
/**
 * Initialize the database.
 */
// @ts-ignore
mongoose.Promise = global.Promise;
mongoose.connect(
  settings.MONGO_URI,
  {
    useMongoClient: true
  }
);
mongoose.set("debug", true);

/**
 * Initialize the application.
 */
const app: express.Express = express();

export default app;

/**
 * Support json & urlencoded requests.
 */
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan("dev"));

require("api/users");
require("api/text");
/**
 * Run the server
 */
app.listen(settings.APP_PORT, () =>
  console.log(`App listening on port ${settings.APP_PORT}!`)
);
