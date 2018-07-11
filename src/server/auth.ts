import jwt from "jsonwebtoken";
import _ from "lodash";
import { JWT_SECRET } from "../../settings";

export function createJWToken(details) {
  if (typeof details !== "object") {
    details = {};
  }

  if (!details.maxAge || typeof details.maxAge !== "number") {
    details.maxAge = 3600;
  }

  details.sessionData = _.reduce(
    details.sessionData || {},
    (memo, val, key) => {
      if (typeof val !== "function" && key !== "password") {
        memo[key] = val;
      }
      return memo;
    },
    {}
  );

  let token = jwt.sign(
    {
      data: details.sessionData
    },
    JWT_SECRET,
    {
      expiresIn: details.maxAge,
      algorithm: "HS256"
    }
  );

  return token;
}

export function verifyJWTToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, JWT_SECRET, (err, decodedToken) => {
      if (err || !decodedToken) {
        return reject(err);
      }

      resolve(decodedToken);
    });
  });
}

export function verifyTokenMiddleware(req, res, next) {
  let { token } = req.query;

  verifyJWTToken(token)
    .then((decodedToken: any) => {
      req.user = decodedToken.data;
      next();
    })
    .catch(err => {
      res.status(405).json({ message: "Invalid auth token provided." });
    });
}
