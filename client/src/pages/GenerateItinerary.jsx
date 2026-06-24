import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import '../css/GenerateItinerary.css'

const GenerateItinerary = ({ data, api_url }) => {

    const { id } = useParams()
    const [itinerary, setItinerary] = useState('')
    const [loading, setLoading] = useState(false)
    const [loadingSaved, setLoadingSaved] = useState(true)
    const [destinations, setDestinations] = useState([])
    const [trip, setTrip] = useState({
        title: '',
        description: '',
        num_days: 0,
        start_date: '',
        end_date: '',
        total_cost: 0
    })

    useEffect(() => {
        const result = data.filter(item => item.id === parseInt(id))[0]

        if (result) {
            setTrip({
                title: result.title,
                description: result.description,
                num_days: parseInt(result.num_days),
                start_date: result.start_date.slice(0, 10),
                end_date: result.end_date.slice(0, 10),
                total_cost: result.total_cost
            })
        }
    }, [data, id])

    useEffect(() => {
        const fetchDestinations = async () => {
            const response = await fetch(`${api_url}/api/trips-destinations/destinations/${id}`)
            const data = await response.json()
            setDestinations(data)
        }

        const fetchSavedItinerary = async () => {
            const response = await fetch(`${api_url}/api/ai/itinerary/${id}`)
            const data = await response.json()
            if (data && data.content) {
                setItinerary(data.content)
            }
            setLoadingSaved(false)
        }

        fetchDestinations()
        fetchSavedItinerary()
    }, [api_url, id])

    const generateItinerary = async () => {
        setLoading(true)
        setItinerary('')

        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ trip_id: id, ...trip, destinations })
        }

        const response = await fetch(`${api_url}/api/ai/itinerary`, options)
        const data = await response.json()

        if (data.error) {
            setItinerary('Failed to generate itinerary. Please try again.')
        } else {
            setItinerary(data.itinerary)
        }

        setLoading(false)
    }

    const formatLine = (text) => {
        const parts = []
        const regex = /\*\*(.+?)\*\*/g
        let lastIndex = 0
        let match

        while ((match = regex.exec(text)) !== null) {
            if (match.index > lastIndex) {
                parts.push(text.slice(lastIndex, match.index))
            }
            parts.push(<strong key={match.index}>{match[1]}</strong>)
            lastIndex = regex.lastIndex
        }

        if (lastIndex < text.length) {
            parts.push(text.slice(lastIndex))
        }

        return parts.length > 0 ? parts : text
    }

    const formatItinerary = (text) => {
        return text.split('\n').map((line, i) => {
            if (line.startsWith('##### ')) return <h5 key={i}>{line.slice(6)}</h5>
            if (line.startsWith('#### ')) return <h4 key={i}>{line.slice(5)}</h4>
            if (line.startsWith('### ')) return <h4 key={i}>{line.slice(4)}</h4>
            if (line.startsWith('## ')) return <h3 key={i}>{line.slice(3)}</h3>
            if (line.startsWith('# ')) return <h2 key={i}>{line.slice(2)}</h2>
            if (line.startsWith('* ')) return <li key={i}>{formatLine(line.slice(2))}</li>
            if (line.startsWith('- ')) return <li key={i}>{formatLine(line.slice(2))}</li>
            if (line.trim() === '') return <br key={i} />
            return <p key={i}>{formatLine(line)}</p>
        })
    }

    return (
        <div className='generateItinerary'>
            <div className='tripSummary'>
                <h2>{trip.title}</h2>
                <p>{trip.num_days} days | {trip.start_date} to {trip.end_date} | Budget: {trip.total_cost}</p>
                {destinations.length > 0 && (
                    <p>Destinations: {destinations.map(d => d.destination).join(', ')}</p>
                )}
            </div>

            <button className='generateBtn' onClick={generateItinerary} disabled={loading}>
                {loading ? 'Generating...' : itinerary ? 'Regenerate Itinerary' : 'Generate Itinerary'}
            </button>

            {loading && <div className='loader'></div>}

            {loadingSaved && !itinerary && <p className='loadingText'>Loading saved itinerary...</p>}

            {itinerary && (
                <div className='itineraryResult'>
                    {formatItinerary(itinerary)}
                </div>
            )}
        </div>
    )
}

export default GenerateItinerary
