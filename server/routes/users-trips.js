import express from 'express'
import { createTripUser, getTripUsers, getUserTrips, removeTripUser } from '../controllers/users-trips.js'

const router = express.Router()

router.post('/create/:trip_id', createTripUser)
router.get('/users/:trip_id', getTripUsers)
router.get('/trips/:username', getUserTrips)
router.delete('/:id', removeTripUser)

export default router