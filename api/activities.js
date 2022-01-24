const express = require('express');
const { getAllActivities, createActivity } = require('../db');

const activitiesRouter = express.Router()

activitiesRouter.get('/activities', async (req, res, next) => {
    try {
      const activities = await getAllActivities();
      res.send({ activities: activities });
    } catch (error) {
      console.error(error);
      next(error);
    }
});

module.exports = activitiesRouter;