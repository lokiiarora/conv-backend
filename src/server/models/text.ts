import * as mongoose from "mongoose";
import { ObjectID } from "../../../node_modules/@types/bson";

const TextSchema = new mongoose.Schema({
  payload: {
    type: String,
    default: ""
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User"
  }
});

export default mongoose.model("Text", TextSchema);
