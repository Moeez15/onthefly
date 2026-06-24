import {useState, useEffect} from 'react'
import { Link, useParams } from 'react-router-dom'
import ActivityBtn from '../components/ActivityBtn'
import DestinationBtn from '../components/DestinationBtn'
import '../css/TripDetails.css'

const TripDetails = ( { data, api_url } ) => {

    const { id } = useParams()
    const [activities, setActivities] = useState([])
    const [destinations, setDestinations] = useState([])
    const [travelers, setTravelers] = useState([])
    const [suggesting, setSuggesting] = useState(false)
    const [suggestions, setSuggestions] = useState(null)
    const [selectedDests, setSelectedDests] = useState([])
    const [selectedActs, setSelectedActs] = useState([])
    const [savingSuggestions, setSavingSuggestions] = useState(false)
    const [trip, setTrip] = useState({
        id: 0,
        title: '',
        description: '',
        img_url: '',
        num_days: 0,
        start_date: '',
        end_date: '',
        total_cost: 0.0
    })

    useEffect(() => {
        const result = data.filter(item => item.id === parseInt(id))[0]

        if (result) {
            setTrip({
                id: parseInt(result.id),
                title: result.title,
                description: result.description,
                img_url: result.img_url,
                num_days: parseInt(result.num_days),
                start_date: result.start_date.slice(0, 10),
                end_date: result.end_date.slice(0,10),
                total_cost: result.total_cost
            })
        }
    }, [data, id])

    useEffect(() => {
        const fetchActivities = async () => {
            const response = await fetch(`${api_url}/api/activities/${id}`)
            const data = await response.json()
            setActivities(data)
        }

        const fetchDestinations = async () => {
            const response = await fetch(`${api_url}/api/trips-destinations/destinations/${id}`)
            const data = await response.json()
            setDestinations(data)
        }

        fetchActivities()
        fetchDestinations()
    }, [data, id])

    useEffect(() => {
        const fetchTravelers = async () => {
            const response = await fetch(`${api_url}/api/users-trips/users/${id}`)
            const travelersJson = await response.json()
            setTravelers(travelersJson)
        }

        fetchTravelers()
    }, [api_url, id])

    const aiSuggest = async () => {
        setSuggesting(true)
        setSuggestions(null)
        setSelectedDests([])
        setSelectedActs([])

        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                trip_id: id,
                title: trip.title,
                description: trip.description,
                num_days: trip.num_days
            })
        }

        const response = await fetch(`${api_url}/api/ai/suggest`, options)
        const data = await response.json()
        setSuggestions(data)

        setSelectedDests([])
        setSelectedActs([])

        setSuggesting(false)
    }

    const toggleDest = (index) => {
        setSelectedDests(prev =>
            prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
        )
    }

    const toggleAct = (index) => {
        setSelectedActs(prev =>
            prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
        )
    }

    const saveSuggestions = async () => {
        if (!suggestions) return

        const destsToSave = selectedDests.map(i => suggestions.destinations[i])
        const actsToSave = selectedActs.map(i => suggestions.activities[i])

        if (destsToSave.length === 0 && actsToSave.length === 0) return

        setSavingSuggestions(true)

        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                trip_id: id,
                destinations: destsToSave,
                activities: actsToSave
            })
        }

        const response = await fetch(`${api_url}/api/ai/suggest/save`, options)
        const saved = await response.json()

        setDestinations([...destinations, ...saved.destinations])
        setActivities([...activities, ...saved.activities])
        setSuggestions(null)
        setSavingSuggestions(false)
    }

    const selectedCount = selectedDests.length + selectedActs.length

    return (
        <div className='out'>
            <div className='flex-container'>

                <div className='left-side'>
                    <h3>{trip.title}</h3>
                    <p>{'🗓️ Duration: ' + trip.num_days + ' days'}</p>
                    <p>{'🛫 Depart: ' + trip.start_date}</p>
                    <p>{'🛬 Return: ' + trip.end_date}</p>
                    <p>{trip.description}</p>
                    <Link to={'/trip/itinerary/' + id}><button className='generateItineraryBtn'>Generate Itinerary</button></Link>
                    <button className='aiSuggestBtn' onClick={aiSuggest} disabled={suggesting}>
                        {suggesting ? 'AI Thinking...' : 'AI Suggest'}
                    </button>
                </div>

                <div className='right-side' style={{ backgroundImage:`url(${trip.img_url})`}}>
                </div>
            </div>

            {suggestions && (
                <div className='suggestionsPanel'>
                    <h3>AI Suggestions</h3>
                    <p className='selectHint'>Select the items you want to add to your trip</p>

                    {suggestions.destinations && suggestions.destinations.length > 0 && (
                        <div className='suggestionGroup'>
                            <h4>Destinations</h4>
                            {suggestions.destinations.map((dest, i) => (
                                <div key={i} className={'suggestionItem suggestionSelectable' + (selectedDests.includes(i) ? ' selected' : '')} onClick={() => toggleDest(i)}>
                                    <strong>{dest.destination}</strong> — {dest.city}, {dest.country}
                                    <p>{dest.description}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {suggestions.activities && suggestions.activities.length > 0 && (
                        <div className='suggestionGroup'>
                            <h4>Activities</h4>
                            {suggestions.activities.map((activity, i) => (
                                <div key={i} className={'suggestionItem suggestionSelectable' + (selectedActs.includes(i) ? ' selected' : '')} onClick={() => toggleAct(i)}>
                                    {activity}
                                </div>
                            ))}
                        </div>
                    )}

                    <div className='suggestionActions'>
                        <button className='saveSuggestionsBtn' onClick={saveSuggestions} disabled={savingSuggestions || selectedCount === 0}>
                            {savingSuggestions ? 'Saving...' : `Add Selected (${selectedCount})`}
                        </button>
                        <button className='dismissSuggestionsBtn' onClick={() => setSuggestions(null)}>Dismiss</button>
                    </div>
                </div>
            )}

            <div className='flex-container'>
                <div className='activities'>
                    {
                        activities && activities.length > 0 ?
                        activities.map((activity, index) =>
                            <ActivityBtn
                                key={activity.id}
                                id={activity.id}
                                activity={activity.activity}
                                num_votes={activity.num_votes}
                                api_url={api_url}
                                onDelete={(deletedId) => setActivities(activities.filter(a => a.id !== deletedId))}
                            />
                        ) : ''
                    }
                    <br/>
                    <Link to={'../../activity/create/' + id}><button className='addActivityBtn'>+ Add Activity</button></Link>
                </div>

                <div className='destinations'>
                    {
                        destinations && destinations.length > 0 ?
                        destinations.map((destination, index) =>
                            <DestinationBtn
                                key={destination.id}
                                id={destination.id}
                                destination={destination.destination}
                                api_url={api_url}
                                onDelete={(deletedId) => setDestinations(destinations.filter(d => d.id !== deletedId))}
                            />
                        ) : ''
                    }
                    <br/>
                    <Link to={'../../destination/new/' + id}><button className='addDestinationBtn'>+ Add Destination</button></Link>
                </div>

                <div className='travelers'>
                    {
                        travelers && travelers.length > 0 ?
                        travelers.map((traveler, index) =>
                            <div key={traveler.id || index} className='travelerWrapper'>
                                <div className='travelerBtn'>
                                    {traveler.username}
                                    <span className='deleteTravelerBtn' onClick={async () => {
                                        await fetch(`${api_url}/api/users-trips/${traveler.id}`, { method: 'DELETE' })
                                        setTravelers(travelers.filter(t => t.id !== traveler.id))
                                    }}>✕</span>
                                </div>
                            </div>
                        ) : ''
                    }

                    <br/>
                    <Link to={'../../users/add/' + id}><button className='addTravelerBtn'>+ Add Traveler</button></Link>
                </div>
            </div>

        </div>
    )
}

export default TripDetails
