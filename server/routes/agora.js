const express = require("express");
const router = express.Router();
const { RtcTokenBuilder, RtcRole } = require("agora-token");



router.get("/token", (req, res) => {
  const APP_ID = process.env.AGORA_APP_ID;
  const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;


  const { channelName, uid } = req.query;
  

  if (!channelName) {
    return res.status(400).json({ error: "Channel name is required" });
  }

  const userUid = uid ? parseInt(uid) : Math.floor(Math.random() * 1000000);
  const role = RtcRole.PUBLISHER;

  const expireTimeSeconds = 3600;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expireTimeSeconds;

  const token = RtcTokenBuilder.buildTokenWithUid(
    APP_ID,
    APP_CERTIFICATE,
    channelName,
    userUid,
    role,
    privilegeExpiredTs
  );

  return res.json({ token, uid: userUid });
});

module.exports = router;
