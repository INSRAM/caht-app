const jwt = require("jsonwebtoken");

// signing token
const signToken = async (mail, role) => {
  return await jwt.sign(
    {
      email: mail,
      user_role_id: role,
    },
    process.env.key
  );
};

const sendToken = async (mail, role, req, res) => {
  const token_ = await signToken(mail, role);
  res.cookie("token", token_, {
    expires: new Date(Date.now() + 3000 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: req.secure || req.headers["x-forwarded-proto"] === "https",
  });

  res.status(200).json({
    status: "success",
    token_,
  });
};

const logout_ = (req, res, next) => {
  res.cookie("token", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: " logout successfully" });
};
module.exports = { sendToken, logout_ };
