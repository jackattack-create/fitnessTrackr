// create an api router
// attach other routers from files in this api directory (users, activities...)
// export the api router
const express = require("express");
const usersRouter = require("./users");
const activitiesRouter = require("./activities");
const apiRouter = express.Router();

const { getUserById } = require('../db/users')

const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

//middleWare

//Routes

apiRouter.get("/", (req, res, next) => {
  try {
    res.send("api route");
  } catch (error) {
    console.error(error);
  }
});

apiRouter.get("/health", async (req, res, next) => {
  try {
    res.send({ message: "all is good" });
  } catch (error) {
    next(error)
  }
});

//JWT Middleware
apiRouter.use(async (req, res, next) => {
  const prefix = "Bearer ";
  const auth = req.header("Authorization");
  if (!auth) {
    next();
  } else if (auth.startsWith(prefix)) {
    const token = auth.slice(prefix.length);

    try {
      const { id } = jwt.verify(token, JWT_SECRET);

      if (id) {
        req.user = await getUserById(id);
      }
      next();
    } catch (err) {
      next(err);
    }
  } else {
    next({
      name: "AuthorizationHeaderError",
      message: `Authorization token must start with ${prefix}`,
    });
  }
});

apiRouter.use((req, res, next) => {
  if (req.user) {
    console.log('REQ.USER---------: ', req.user);
  }
  next();
});

apiRouter.use("/users", usersRouter);
apiRouter.use("/activities", activitiesRouter);

module.exports = apiRouter;
