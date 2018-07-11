import * as mongoose from "mongoose";
import * as bcrypt from "bcrypt-nodejs";
const UserSchema = new mongoose.Schema({
  /**
   * username.
   */
  username: {
    type: String,
    unique: true
  },
  typeOfUser: {
    type: String
  },
  password: {
    type: String
  },
  textPayload: [
    {
      ref: "Text",
      type: mongoose.Schema.Types.ObjectId
    }
  ]
});

UserSchema.pre("save", function save(next) {
  const user = this;
  if (!user.isModified("password")) {
    return next();
  }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      return next(err);
    }
    bcrypt.hash(user.password, salt, null, (err, hash) => {
      if (err) {
        return next(err);
      }
      user.password = hash;
      next();
    });
  });
});

/**
 * Helper method for validating user's password.
 */
UserSchema.methods.comparePassword = function comparePassword(
  candidatePassword,
  cb
) {
  let user = this;
  return new Promise((resolve, reject) => {
    bcrypt.compare(candidatePassword, user.password, (err, isMatch) => {
      if (err) reject(err);
      else {
        resolve(isMatch);
      }
    });
  });
};

export default mongoose.model("User", UserSchema);
