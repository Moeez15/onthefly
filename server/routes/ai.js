import express from 'express'
import AiController from '../controllers/ai.js'

const router = express.Router()

router.post('/itinerary', AiController.generateItinerary)
router.get('/itinerary/:trip_id', AiController.getItinerary)
router.post('/search', AiController.smartSearch)
router.post('/suggest', AiController.suggestDestinationsActivities)
router.post('/suggest/save', AiController.saveAiSuggestions)

export default router
