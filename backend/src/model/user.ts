import { UserType, UserRecord } from '../types/user'
import { pool } from '../db/connect'
import bcrypt from 'bcryptjs'
import { ServiceUserInput, RegisterUserInput } from '../types/params'

const registerUser = async ({
  username,
  email,
  password
}: RegisterUserInput): Promise<UserType> => {
  const queryText =
    'INSERT INTO USERS(username, email, password) VALUES($1, $2, $3) RETURNING id, username, user_role, email'
  const cryptedPassword = bcrypt.hashSync(password, 10)
  const queryResult = await pool.query<UserRecord>(queryText, [
    username,
    email,
    cryptedPassword,
  ])

  return queryResult.rows[0]
}

const updateUsername = async (username: string, newUsername: string): Promise<UserRecord | null>=> {
  const queryText =
    'UPDATE USERS SET username = $1 WHERE username = $2 RETURNING id, username, user_role, email'
  const queryResult = await pool.query<UserRecord>(queryText, [
    newUsername,
    username
  ])

  if (queryResult.rows.length === 0) {
    return null
  }
  return queryResult.rows[0]
}


const updatePassword = async (username: string, newPassword: string): Promise<UserRecord | null>=> {
  const queryText =
    'UPDATE USERS SET password = $1 WHERE username = $2 RETURNING id, username, user_role, email'
  const cryptedPassword = bcrypt.hashSync(newPassword, 10)
  const queryResult = await pool.query<UserRecord>(queryText, [
    cryptedPassword,
    username
  ])

  if (queryResult.rows.length === 0) {
    return null
  }
  return queryResult.rows[0]
}

const updateEmail = async (username: string, newEmail: string): Promise<UserRecord | null>=> {
  const queryText =
    'UPDATE USERS SET email = $1 WHERE username = $2 RETURNING id, username, user_role, email'
  const queryResult = await pool.query<UserRecord>(queryText, [
    newEmail,
    username
  ])

  if (queryResult.rows.length === 0) {
    return null
  }
  return queryResult.rows[0]
}

const updateUserRole = async (username: string, newUserRole: string): Promise<UserRecord | null>=> {
  const queryText =
    'UPDATE USERS SET user_role = $1 WHERE username = $2 RETURNING id, username, user_role, email'
  const queryResult = await pool.query<UserRecord>(queryText, [
    newUserRole,
    username
  ])

  if (queryResult.rows.length === 0) {
    return null
  }
  return queryResult.rows[0]
}

const registerAdmin = async ({
  username,
  email,
  password
}: RegisterUserInput): Promise<UserType> => {
  const user_role = 'admin'
  const queryText =
    'INSERT INTO USERS(username, user_role, email, password) VALUES($1, $2, $3, $4) RETURNING id, username, user_role, email'
  const cryptedPassword = bcrypt.hashSync(password, 10)
  const queryResult = await pool.query<UserRecord>(queryText, [
    username,
    user_role,
    email,
    cryptedPassword,
  ])

  return queryResult.rows[0]
}

const findUserByUsername = async (
  username: string
): Promise<UserRecord | null> => {
  const queryText = 'SELECT * FROM USERS WHERE username = $1'
  const queryResult = await pool.query<UserRecord>(queryText, [username])

  if (queryResult.rows.length === 0) {
    return null
  }

  return queryResult.rows[0]
}

const deleteAll = async (): Promise<void> => {
  const queryText = 'DELETE FROM USERS'
  await pool.query(queryText)
}

const addServiceUser = async ({
  user_id,
  services_id,
  username,
  email,
  reposurl,
}: ServiceUserInput): Promise<void> => {
  const insertQuery = `
  INSERT INTO SERVICE_USERS(user_id, services_id, username, email, reposurl)
    VALUES ($1, $2, $3, $4, $5) 
    ON CONFLICT DO NOTHING;
    `
  await pool.query(insertQuery, [
    user_id,
    services_id,
    username,
    email,
    reposurl,
  ])
}

const getUserById = async (id: number): Promise<UserType | null> => {
  const sql = `
    SELECT row_to_json(t) AS user
    FROM (
      SELECT id, username, user_role, email,
        (
          SELECT json_agg(json_build_object(
            'username', service_users.username,
            'email', SERVICE_USERS.email,
            'reposurl', SERVICE_USERS.reposurl,
            'serviceName', SERVICES.name
            )
          ) as services
          FROM SERVICE_USERS
          JOIN SERVICES ON SERVICES.id = SERVICE_USERS.services_id
          WHERE user_id=USERS.id
        ) 
      FROM Users
    WHERE id=$1
  ) t;`

  const queryResult = await pool.query<{ user: UserType }>(sql, [id])
  if (queryResult.rowCount == 0) return null
  return queryResult.rows[0].user
}

const getAllUsers = async (): Promise<UserType[] | null> => {
  const sql = `SELECT id, username, user_role, email FROM Users;`
  const queryResult = await pool.query<UserType>(sql)

  if (queryResult.rowCount == 0) return null

  return queryResult.rows
}

const deleteUser = async (username: string): Promise<void> => {
  const queryText = `
  DELETE FROM Users WHERE username=$1
  `
  await pool.query(queryText, [username])

}

export default {
  registerUser,
  registerAdmin,
  findUserByUsername,
  deleteAll,
  addServiceUser,
  getUserById,
  getAllUsers,
  deleteUser,
  updateEmail,
  updateUserRole,
  updatePassword,
  updateUsername
}
