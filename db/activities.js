const client = require('./client')
const util = require('./utils')

const getAllActivities = async () => {
    try {
        const {rows} = await client.query(`
            SELECT * FROM activities
        `);
        return rows;
    } catch (error) {
        console.log('error getting all activities')
        throw error;
    }
}

const  getActivityById = async (id) => {
    try {
        const {rows: [activity]} = await client.query(`
            SELECT * FROM activities 
            WHERE id = $1
        `, [id])
        return activity;
    } catch (error) {
        console.log('error getting activity by id')
        throw error
    }
}

const getActivityByName = async (name) => {
    try {
        const {rows: activities} = await client.query(`
            SELECT * FROM activities
            WHERE name = $1
        `, [name])
        return activities;
    } catch (error) {
        console.log('error getting activities by name')
        throw error;
    }
}

const getActivitiesByRoutineId = async (id) => {
    try {
      const { rows: activities } = await client.query(`
      SELECT activities.*, routine_activities.duration, routine_activities.count, routine_activities.id AS "routineActivityId"
      FROM activities 
      JOIN routine_activities ON routine_activities."activityId" = activities.id
      WHERE routine_activities."routineId" = $1;
    `, [id]);
    return activities;
    } catch (error) {
      throw error;
    }
  }

const createActivity = async ({name, description}) => {
    try {
        const {rows: [activity]} = await client.query(`
        INSERT INTO activities(name, description) VALUES ($1, $2)
        ON CONFLICT (name) DO NOTHING 
        RETURNING *
      `, [name, description]);
      return activity;
    } catch (error) {
        console.log("error creating activity")
        throw error
    }
}

const updateActivity = async ({ id, ...fields }) => {
    try {
      const fieldsToUpdate = {}
      for(let column in fields) {
        console.log('column: ', column);
        if(fields[column] !== undefined) fieldsToUpdate[column] = fields[column];
      }
      let activity;
      if (util.dbFields(fieldsToUpdate).insert.length > 0) {
        const {rows} = await client.query(`
          UPDATE activities
          SET ${ util.dbFields(fieldsToUpdate).insert }
          WHERE id=${ id }
          RETURNING *;
        `, Object.values(fieldsToUpdate));
        activity = rows[0];
      }
      return activity;
    
    } catch (error) {
        
    }
}

module.exports = {
    getAllActivities,
    getActivityById,
    getActivityByName,
    getActivitiesByRoutineId,
    createActivity,
    updateActivity,
}