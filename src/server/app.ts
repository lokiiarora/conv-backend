/* eslint-disable no-console, newline-after-var */
import "babel-polyfill";
import * as express from "express";
import * as bodyParser from "body-parser";
import * as mongoose from "mongoose";
import * as settings from "settings";
import * as morgan from "morgan";
import * as cors from "cors";
import * as helmet from "helmet";
import * as compression from "compression";
import * as path from "path";
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
app.use(helmet());
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "frontend")));

require("api/users");
require("api/text");
app.get("*", (req: express.Request, res: express.Response) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});
/**
 * Run the server
 */
app.listen(settings.APP_PORT, () =>
  console.log(`App listening on port ${settings.APP_PORT}!`)
);
