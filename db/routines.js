const client = require('./client')
const { getActivitiesByRoutineId } = require('./activities')
const { getUserByUsername } = require('./users')
const util = require('./utils')

const getRoutineById = async (id) => {
    try {
      const {rows: [routine]} = await client.query(`
        SELECT * FROM routines
        WHERE id = $1
      `, [id]);
      return routine;
    } catch (error) {
      throw error;
    }
}

const getRoutinesWithoutActivities = async () => {
    try {
      const {rows} = await client.query(`
      SELECT * FROM routines;
      `);
      return rows;
    } catch (error) {
      throw error
    }
}

const getAllRoutines = async () => {
    try {
      const { rows: routines } = await client.query(`
      SELECT routines.*, users.username AS "creatorName"
      FROM routines
      JOIN users ON routines."creatorId" = users.id 
      `);
      for (let routine of routines) {
        routine.activities = await getActivitiesByRoutineId(routine.id);
      }
      return routines;
    } catch (error) {
      throw error
    }
}

const getAllRoutinesByUser = async ({username}) => {
    try {
      const user = await getUserByUsername(username);
      const { rows: routines } = await client.query(`
      SELECT routines.*, users.username AS "creatorName"
      FROM routines
      JOIN users ON routines."creatorId" = users.id 
      WHERE "creatorId" = $1
      `, [user.id]);
      for (let routine of routines) {
        routine.activities = await getActivitiesByRoutineId(routine.id);
      }
      return routines;
    } catch (error) {
      throw error
    }
}

const getPublicRoutinesByUser = async ({username}) => {
  try {
    const user = await getUserByUsername(username);
    const { rows: routines } = await client.query(`
    SELECT routines.*, users.username AS "creatorName"
    FROM routines
    JOIN users ON routines."creatorId" = users.id 
    WHERE "creatorId" = $1
    AND "isPublic" = true
    `, [user.id]);
    for (let routine of routines) {
      routine.activities = await getActivitiesByRoutineId(routine.id);
    }
    return routines;
  } catch (error) {
    throw error
  }
}

const getPublicRoutinesByActivity = async ({id}) => {
  try {
    const { rows: routines } = await client.query(`
    SELECT routines.*, users.username AS "creatorName"
    FROM routines
    JOIN users ON routines."creatorId" = users.id
    JOIN routine_activities ON routine_activities."routineId" = routines.id
    WHERE routines."isPublic" = true
    AND routine_activities."activityId" = $1;
  `, [id]);
    for (let routine of routines) {
      routine.activities = await getActivitiesByRoutineId(routine.id);
    }
    return routines;
  } catch (error) {
    throw error;
  }
}

const getAllPublicRoutines = async () => {
  try {
    const { rows: routines } = await client.query(`
    SELECT routines.*, users.username AS "creatorName"
    FROM routines
    JOIN users ON routines."creatorId" = users.id
    WHERE "isPublic" = true
    `);
    for (let routine of routines) {
      routine.activities = await getActivitiesByRoutineId(routine.id);
    }
    return routines;
  } catch (error) {
    throw error
  }
}



const createRoutine = async ({creatorId, isPublic, name, goal}) => {
    try {
      const {rows: [routine]} = await client.query(`
          INSERT INTO routines ("creatorId", "isPublic", "name", "goal")
          VALUES($1, $2, $3, $4)
          RETURNING *;
      `, [creatorId, isPublic, name, goal]);
  
      return routine;
    } catch (error) {
      throw error;
    }
}

const updateRoutine = async ({id, ...fields}) => {
  try {
    const fieldsToUpdate = {}
    for(let column in fields) {
      if(fields[column] !== undefined) fieldsToUpdate[column] = fields[column];
    }
    let routine;
    if (util.dbFields(fields).insert.length > 0) {
      const {rows} = await client.query(`
          UPDATE routines 
          SET ${ util.dbFields(fieldsToUpdate).insert }
          WHERE id=${ id }
          RETURNING *;
      `, Object.values(fieldsToUpdate));
      routine = rows[0];
      return routine;
    }
  } catch (error) {
    throw error;
  }
}

const destroyRoutine = async (id) => {
  try {
    await client.query(`
        DELETE FROM routine_activities 
        WHERE "routineId" = $1;
    `, [id]);
    const {rows: [routine]} = await client.query(`
        DELETE FROM routines 
        WHERE id = $1
        RETURNING *
    `, [id]);
    return routine;
  } catch (error) {
    throw error;
  }
}



module.exports = {
      getRoutineById,
      getRoutinesWithoutActivities,
      getAllRoutines,
      getAllRoutinesByUser,
      getPublicRoutinesByUser,
      getAllPublicRoutines,
      getPublicRoutinesByActivity,
      updateRoutine,
      destroyRoutine,
      createRoutine,
  }