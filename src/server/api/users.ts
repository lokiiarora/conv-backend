/* eslint-disable prefer-arrow-callback, no-magic-numbers */
import app from "app";
import User from "models/user";
import { login } from "../controllers/users";
import { createJWToken, verifyTokenMiddleware } from "../auth";
/**
 * Return a single user.
 */

app.post(
  "/api/users/login",
  async (req, res): Promise<void> => {
    const { username, password } = req.body;
    try {
      let user = await login(username, password);
      let match = await user.comparePassword(password);
      if (match) {
        let token = createJWToken({
          sessionData: {
            _id: user["_id"],
            typeOfUser: user["typeOfUser"]
          }
        });
        res.status(200).json({
          authToken: token,
          _id: user["_id"],
          typeOfUser: user["typeOfUser"]
        });
      } else {
        res.status(403).json({
          message: "Wrong password"
        });
      }
    } catch (e) {
      console.log(e);
      res.status(406).json({
        message: "User doesn't exist"
      });
    }
  }
);

app.post(
  "/api/users/debug/corporate",
  async (req, res): Promise<void> => {
    const { username } = req.body;
    let password: string = Math.random()
      .toString(15)
      .replace(/[^a-z]+/g, "");
    try {
      let newUser = await User.create({
        username,
        password,
        typeOfUser: "corporate"
      });
      console.log("Stuck here");
      await newUser.save();
      res
        .status(200)
        .json({ username: newUser["username"], password, _id: newUser["_id"] });
    } catch (err) {
      res.status(500).json(err);
    }
  }
);

app.use(verifyTokenMiddleware);

app.get(
  "/api/users/me",
  async (req, res): Promise<void> => {
    // @ts-ignore
    const { _id } = req.user;
    try {
      let me = await User.findById(_id).populate("textPayload");
      res.status(200).json(me);
    } catch (e) {
      console.log(e);
      res.status(500).send(e);
    }
  }
);

app.get("/api/users/:userId", async function(req, res): Promise<void> {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);

    res.status(200).json(user);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

/**
 * Return a list of users.
 */
app.get("/api/users", async function(req, res): Promise<void> {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

/**
 * Add a user
 */
app.post("/api/users", async function(req, res): Promise<void> {
  const { username, password, type } = req.body;
  // @ts-ignore
  let { typeOfUser } = req.user;
  if (typeOfUser !== "corporate") {
    res.status(403);
  } else {
    try {
      let user = new User({ username, password, typeOfUser: type });
      await user.save();
      res.status(200).json({
        _id: user._id,
        username: username
      });
    } catch (err) {
      res.status(500).send(err.message);
    }
  }
});
