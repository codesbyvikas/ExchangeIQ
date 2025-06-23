const authCheck = require("../middleware/authCheck");

app.post("/profile/updateSkills", authCheck, async (req, res) => {
  const { learnSkills, teachSkills } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          learnSkills,
          teachSkills,
        },
      },
      { new: true }
    );

    res.json(updatedUser);
  } catch (err) {
    console.error("Error updating user skills:", err);
    res.status(500).send("Internal server error");
  }
});


