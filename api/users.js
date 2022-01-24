const express = require("express");
const usersRouter = express.Router();
const {
  getAllUsers,
  createUser,
  getUserByUsername,
  getUser,
} = require("../db");
const bcrypt = require("bcrypt");

const { requireUser } = require('./util');

const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;



// GET Routes
// usersRouter.get("/", async (req, res, next) => {
//   try {
//     const users = await getAllUsers();
//     res.send(users);
//   } catch (error) {
//     console.log(error);
//   }
// });

usersRouter.post("/register", async (req, res, next) => {
  const { username, password } = req.body;
  console.log(username, password);
  const testName = await getUserByUsername(username);
  if (!username || !password) {
    next({
      name: "MissingRegisterInfoError",
      message: "Please supply all fields",
    });
  } else {
    try {
      if (password.length < 8) {
        next({
          name: "passwordNotLongEnoughError",
          message: "Password Not Long Enough",
        });
      } else if (testName) {
        next({
          name: "usernameAlreadyTaken",
          message: "Username Already Taken",
        });
      } else {
        const newUser = await createUser({
          username,
          password,
        });
        console.log("newUser", newUser);
        res.send({
          user: newUser,
        });
      }
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
});

usersRouter.post("/login", async (req, res, next) => {
  const { username, password } = req.body;
  console.log(username, password);

  if (!username || !password) {
    next({
      name: "MissingCredentialsError",
      message: "Please supply both a username and password",
    });
  }

  try {
    const user = await getUserByUsername(username);
    const passwordIsCorrect = await bcrypt.compare(password, user.password);

    if (user && passwordIsCorrect) {
      const token = jwt.sign(
        {
          id: user.id,
          username,
        },
        JWT_SECRET
      );
      console.log('token', token);

      res.send({
        message: "you're logged in!",
        token,
      });
    } else {
      next({
        name: "IncorrectCredentialsError",
        message: "Username or password is incorrect",
      });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

usersRouter.get("/me", requireUser, async (req, res, next) => {
  try {
    if (req.user) {
      res.send(req.user);
    } else {
      next({
        name: "NotLoggedInError",
        message: "You're not logged in",
      });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

//exports

module.exports = usersRouter;
