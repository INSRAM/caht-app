const AppError = require("../utils/apperror.js");
const user = require("../model/userModel.js");
const { sendToken } = require("./tokenController.js");

const checkUser = async (id_) => {
  return await user.findOne({ user_id: id_ });
};

// data parsing
const parseData = (req) => {
  return {
    user_name: req.body.user_name,
    user_email: req.body.user_email,
    user_password: req.body.user_password,
  };
};

const findUser = async (req) => {
  const user_found = await user.findOne({
    user_email: req.body.user_email,
  });
  if (user_found === null) {
    return "false";
  } else if (user_found.user_password !== req.body.user_password) {
    return "false";
  } else {
    return user_found;
  }
};
// login user
const loginUser = async (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    return next(new AppError("Body is empty", 204));
  }
  try {
    const resultcandidate = await findUser(req);
    if (resultcandidate === "false")
      return next(new AppError("Incorrect email or password!", 204));
    else {
      // calling send token
      sendToken(
        resultcandidate.user_email,
        resultcandidate.user_role_id,
        req,
        res
      );
    }
  } catch (error) {
    next(new AppError(error, 500));
  }
};

// add user
const addUser = async (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    return next(new AppError("Body is empty", 204));
  }
  const roleIdResult = await checkRoleId(req.body.user_role_id);
  if (roleIdResult !== null) {
    try {
      const userFind = await checkUser(req.body.user_id);
      if (userFind === null) {
        const data_ = parseData(req);
        user.create(data_, (err, collection) => {
          if (err) {
            return next(new AppError(err, 500));
          }
          return res.status(200).send("User added successfully!");
        });
      } else {
        return next(new AppError("User id already exist", 500));
      }
    } catch (error) {
      next(new AppError(error, 500));
    }
  } else {
    return next(new AppError("Incorrect role id", 500));
  }
};

// update user
const updateUser = async (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    return next(new AppError("Body is empty", 204));
  }
  try {
    const userFind = await checkUser(req.body.user_id);
    if (userFind !== null) {
      const data_ = parseData(req);
      user.findOneAndUpdate(
        { user_id: req.body.user_id },
        data_,
        (err, collection) => {
          if (err) {
            return next(new AppError(err, 500));
          }
          return res.status(200).send("User updated successfully!");
        }
      );
    } else {
      return next(new AppError("User id does not exist", 500));
    }
  } catch (error) {
    next(new AppError(error, 500));
  }
};

// delete user

const deleteUser = async (req, res, next) => {
  try {
    if (!req.params.user_id) {
      return next(new AppError("Please provide user id for delete", 204));
    }
    const userFind = await checkUser(req.params.user_id);
    if (userFind !== null) {
      user.findOneAndRemove(
        { user_id: req.params.user_id },
        (err, collection) => {
          if (err) {
            return next(new AppError(err, 500));
          }
          return res.status(200).send("User deleted successfully!");
        }
      );
    } else {
      return next(new AppError("User id does not exist", 500));
    }
  } catch (error) {
    next(new AppError(error, 500));
  }
};

//  search user

const searchUser = async (req, res, next) => {
  try {
    if (!req.body.user_id) {
      return next(new AppError("Please provide user id for search user", 204));
    }
    const userFind = await checkUser(req.body.user_id);
    if (userFind === null) {
      return res.status(204).send("This user id does not exist!");
    }
    return res.status(200).send(JSON.stringify(userFind));
  } catch (error) {
    next(new AppError(error, 500));
  }
};

module.exports = { addUser, deleteUser, updateUser, searchUser, loginUser };
