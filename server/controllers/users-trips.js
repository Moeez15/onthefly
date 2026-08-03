import { pool } from '../config/database.js'

export const createTripUser = async (req, res) => {
    try {
        const trip_id = parseInt(req.params.trip_id)
        const { username } = req.body

        const results = await pool.query(`
            INSERT INTO users_trips (trip_id, username)
            VALUES($1, $2)
            RETURNING *`,
            [trip_id, username]
        )

        res.status(200).json(results.rows[0])

        console.log('🆕 added user to trip')
    }
    catch (error) {
        res.status(409).json( { error: error.message } )
        console.log('Error:', error.message)
    }
}

export const getTripUsers = async (req, res) => {
    try {
        const trip_id = parseInt(req.params.trip_id)
        const results = await pool.query('SELECT * FROM users_trips WHERE trip_id = $1', [trip_id])
        res.status(200).json(results.rows)
    } catch (error) {
        res.status(409).json( { error: error.message } )
        console.log('🚫 unable to GET all users (travelers) - Error:', error.message)
    }
}

export const removeTripUser = async (req, res) => {
    try {
        const id = parseInt(req.params.id)
        const results = await pool.query('DELETE FROM users_trips WHERE id = $1', [id])
        res.status(200).json(results.rows)
    } catch (error) {
        res.status(409).json( { error: error.message } )
        console.log('🚫 unable to DELETE user from trip - Error:', error.message)
    }
}

export const getUserTrips = async (req, res) => {
    try {
        const username = req.params.username
        const results = await pool.query(`
            SELECT t.* FROM users_trips ut, trips t
            WHERE ut.trip_id = t.id
            AND ut.username = $1`,
            [username]
        )

        res.status(200).json(results.rows)
    } catch (error) {
        res.status(409).json( { error: error.message } )
        console.log('🚫 unable to GET users trips = Error:', error.message)
    }
}

