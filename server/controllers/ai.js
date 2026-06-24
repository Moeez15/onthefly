import Groq from 'groq-sdk'
import { pool } from '../config/database.js'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const generateItinerary = async (req, res) => {
    try {
        const { trip_id, title, description, num_days, destinations, start_date, end_date, total_cost } = req.body

        const destinationList = destinations && destinations.length > 0
            ? destinations.map(d => d.destination).join(', ')
            : 'not specified'

        const prompt =
`You are a travel planning expert. Generate a detailed day-by-day itinerary for the following trip:

Trip: ${title}
Description: ${description}
Number of Days: ${num_days}
Destinations: ${destinationList}
Start Date: ${start_date}
End Date: ${end_date}
Budget: ${total_cost}

Please provide:
1. A day-by-day itinerary with morning, afternoon, and evening activities
2. Suggested places to eat
3. Travel tips for the destinations
4. Estimated daily budget breakdown

Format the response in a clean, readable way using markdown.`

        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.7,
            max_tokens: 2048,
        })

        const itinerary = chatCompletion.choices[0]?.message?.content || 'Unable to generate itinerary.'

        await pool.query(
            `INSERT INTO itineraries (trip_id, content) VALUES ($1, $2)
             ON CONFLICT (trip_id) DO UPDATE SET content = $2, created_at = NOW()`,
            [trip_id, itinerary]
        )

        res.status(200).json({ itinerary })
    } catch (error) {
        res.status(500).json({ error: error.message })
        console.log('🚫 Unable to generate itinerary - Error:', error.message)
    }
}

const getItinerary = async (req, res) => {
    try {
        const trip_id = parseInt(req.params.trip_id)
        const results = await pool.query('SELECT * FROM itineraries WHERE trip_id = $1', [trip_id])

        if (results.rows.length > 0) {
            res.status(200).json(results.rows[0])
        } else {
            res.status(200).json(null)
        }
    } catch (error) {
        res.status(500).json({ error: error.message })
        console.log('🚫 Unable to GET itinerary - Error:', error.message)
    }
}

const smartSearch = async (req, res) => {
    try {
        const { query } = req.body

        const tripsResult = await pool.query('SELECT * FROM trips ORDER BY id ASC')
        const tripsDestResult = await pool.query(
            `SELECT td.trip_id, d.destination, d.city, d.country
             FROM trips_destinations td
             JOIN destinations d ON td.destination_id = d.id`
        )

        const tripDestMap = {}
        tripsDestResult.rows.forEach(row => {
            if (!tripDestMap[row.trip_id]) tripDestMap[row.trip_id] = []
            tripDestMap[row.trip_id].push(`${row.destination} (${row.city}, ${row.country})`)
        })

        const tripsData = tripsResult.rows.map(t => ({
            id: t.id,
            title: t.title,
            description: t.description,
            num_days: t.num_days,
            start_date: t.start_date,
            end_date: t.end_date,
            total_cost: t.total_cost,
            destinations: tripDestMap[t.id] || []
        }))

        const prompt =
`You are a travel search assistant. A user is searching for trips with this query:

"${query}"

Here are all available trips:
${JSON.stringify(tripsData, null, 2)}

Return a JSON object with two fields:
1. "matched_ids": an array of trip IDs that match the user's query, ordered by best match first. If none match, use an empty array.
2. "suggested_trip": a new trip suggestion based on the user's query with these fields:
   - "title": a catchy trip title
   - "description": a 2-3 sentence description
   - "num_days": number of days (integer)
   - "start_date": a suggested start date in YYYY-MM-DD format (pick a reasonable upcoming date)
   - "end_date": a suggested end date in YYYY-MM-DD format
   - "total_cost": estimated total cost as a number
   - "img_url": a relevant Unsplash image URL like "https://images.unsplash.com/photo-XXXX" that matches the trip theme

Return ONLY valid JSON, nothing else. Example:
{"matched_ids": [3, 1], "suggested_trip": {"title": "Beach Getaway", "description": "A relaxing trip...", "num_days": 5, "start_date": "2026-08-01", "end_date": "2026-08-05", "total_cost": 1500, "img_url": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e"}}`

        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.3,
            max_tokens: 512,
        })

        const responseText = chatCompletion.choices[0]?.message?.content || '{}'
        const jsonMatch = responseText.match(/\{[\s\S]*\}/)
        const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { matched_ids: [], suggested_trip: null }

        const matchedIds = parsed.matched_ids || []
        const matchedTrips = matchedIds
            .map(id => tripsResult.rows.find(t => t.id === id))
            .filter(Boolean)

        res.status(200).json({
            matched: matchedTrips,
            suggested: parsed.suggested_trip || null
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
        console.log('🚫 Unable to perform smart search - Error:', error.message)
    }
}

const suggestDestinationsActivities = async (req, res) => {
    try {
        const { trip_id, title, description, num_days } = req.body

        const prompt =
`You are a travel planning expert. Based on this trip, suggest destinations and activities:

Trip: ${title}
Description: ${description}
Number of Days: ${num_days}

Return a JSON object with two arrays:
1. "destinations": array of 3-4 destination objects, each with:
   - "destination": name of the place
   - "description": 1-2 sentence description
   - "city": city name
   - "country": country name
   - "img_url": a relevant Unsplash image URL like "https://images.unsplash.com/photo-XXXX"
   - "flag_img_url": a flag emoji or URL for the country

2. "activities": array of 5-6 activity strings (short activity names like "Visit the Eiffel Tower", "Snorkeling", "Wine Tasting")

Return ONLY valid JSON, nothing else.`

        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.5,
            max_tokens: 1024,
        })

        const responseText = chatCompletion.choices[0]?.message?.content || '{}'
        const jsonMatch = responseText.match(/\{[\s\S]*\}/)
        const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { destinations: [], activities: [] }

        res.status(200).json({
            destinations: parsed.destinations || [],
            activities: parsed.activities || []
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
        console.log('🚫 Unable to suggest - Error:', error.message)
    }
}

const saveAiSuggestions = async (req, res) => {
    try {
        const { trip_id, destinations, activities } = req.body

        const savedDestinations = []
        for (const dest of destinations) {
            const result = await pool.query(
                `INSERT INTO destinations (destination, description, city, country, img_url, flag_img_url)
                 VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
                [dest.destination, dest.description, dest.city, dest.country, dest.img_url || '', dest.flag_img_url || '']
            )
            const destId = result.rows[0].id
            savedDestinations.push(result.rows[0])

            await pool.query(
                'INSERT INTO trips_destinations (trip_id, destination_id) VALUES ($1, $2)',
                [trip_id, destId]
            )
        }

        const savedActivities = []
        for (const activity of activities) {
            const result = await pool.query(
                `INSERT INTO activities (trip_id, activity, num_votes)
                 VALUES ($1, $2, 0) RETURNING *`,
                [trip_id, activity]
            )
            savedActivities.push(result.rows[0])
        }

        res.status(201).json({ destinations: savedDestinations, activities: savedActivities })
    } catch (error) {
        res.status(500).json({ error: error.message })
        console.log('🚫 Unable to save suggestions - Error:', error.message)
    }
}

export default {
    generateItinerary,
    getItinerary,
    smartSearch,
    suggestDestinationsActivities,
    saveAiSuggestions
}
