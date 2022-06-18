const express = require("express");
const { logout_ } = require("../controller/tokenController.js");

const {
  addUser,
  deleteUser,
  updateUser,
  searchUser,
  loginUser,
} = require("../controller/userController.js");
const routes = express.Router();

routes.post("/adduser", addUser);
routes.get("/logoutuser", logout_);
routes.post("/loginuser", loginUser);
routes.post("/searchuser", searchUser);
routes.patch("/updateuser", updateUser);
routes.delete("/deleteuser/:user_id", deleteUser);

module.exports = routes;
