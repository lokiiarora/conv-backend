import { Schema } from "mongoose";
import app from "app";
import Text from "models/text";
import User from "models/user";

app.get(
  "/api/text/unapproved",
  async (req, res): Promise<void> => {
    // @ts-ignore
    let { typeOfUser } = req.user;
    if (typeOfUser === "corporate") {
      try {
        let texts = await Text.find({ isApproved: false }).populate(
          "createdBy",
          "username"
        );
        res.status(200).json(texts);
      } catch (e) {
        console.log(e);
        res.status(500).json({
          message: "Some db error"
        });
      }
    } else {
      res.status(403).json({
        message: "Unauthorized"
      });
    }
  }
);

app.get(
  "/api/text/:textID",
  async (req, res): Promise<void> => {
    let { textID } = req.params;
    try {
      let text = await Text.findOne({ _id: textID })
        .populate("createdBy", "username")
        .populate("approvedBy", "username");
      res.status(200).json(text);
    } catch (e) {
      console.log(e);
      res.status(500).json({
        message: "Some db error"
      });
    }
  }
);

app.put(
  "/api/text/:textID/approve",
  async (req, res): Promise<void> => {
    let { textID } = req.params;
    // @ts-ignore
    let { typeOfUser, _id } = req.user;
    if (typeOfUser !== "corporate") {
      res.status(403).json({
        message: "not allowed"
      });
    } else {
      try {
        let text = await Text.findOne({ _id: textID }).populate({
          path: "createdBy",
          select: "username"
        });
        // @ts-ignore
        if (text.isApproved) {
          res.status(200).json({
            success: false,
            message: "message already approved"
          });
        } else {
          // @ts-ignore
          text.isApproved = true;
          //@ts-ignore
          text.approvedBy = _id;
          await text.save();
          res.status(200).json({
            success: true
          });
        }
      } catch (e) {
        console.log(e);
      }
    }
  }
);

app.post("/api/text", async (req, res) => {
  let { text } = req.body;
  // @ts-ignore
  let { typeOfUser, _id } = req.user;
  // @ts-ignore
  console.log(req.user);
  try {
    if (typeOfUser === "corporate") {
      let payloadText = new Text({
        payload: text,
        createdBy: _id,
        isApproved: true,
        approvedBy: _id
      });
      await payloadText.save();
      let payloadUser = await User.findById(_id);
      // @ts-ignore
      payloadUser.textPayload.push(payloadText._id);
      await payloadUser.save();
      res.status(200).json("OK");
    } else {
      let payloadText = new Text({
        payload: text,
        createdBy: _id
      });
      await payloadText.save();
      let payloadUser = await User.findById(_id);
      // @ts-ignore
      payloadUser.textPayload.push(payloadText._id);
      await payloadUser.save();
      res.status(200).json("OK");
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({
      message: "Some db error"
    });
  }
});
