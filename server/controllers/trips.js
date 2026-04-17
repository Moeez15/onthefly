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

export default {
    createTrip
}