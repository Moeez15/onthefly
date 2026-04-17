import { pool } from '../config/database.js'

const createTrip = async (req, res) => {
    try {
        const { title, description, img_url, num_days, start_date, end_date, total_cost} = req.body
        const results = await pool.query(
            `INSERT INTO trips (title, description, img_url, num_days, start_date, end_date, total_cost)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *`, 
            [title, description, img_url, num_days, start_date, end_date, total_cost]
        )
        res.status(201).json(results.rows[0])
    } 
    catch (error) {
        res.status(409).json( { error: error.message } )
    }
}

const getTrips = async (req, res) => {
    try {
        const results = await pool.query(`SELECT * FROM trips ORDER BY id ASC`)
        res.status(201).json(results.rows)
    }
    catch (error) {
        res.status(409).josn( { error: error.message } )
    }
}

const getTrip = async (req, res) => {
    try {
        const id = parseInt(req.params.id)
        const result = await pool.query(`SELECT * FROM trips WHERE id = $1`, [id])
        res.status(201).json(result.rows[0])
    }
    catch (error) {
        res.status(409).json( { error: error.message } )
    }
}





export default {
    createTrip,
    getTrips,
    getTrip
}