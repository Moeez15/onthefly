import { useState } from 'react'
import Card from '../components/Card'
import '../css/SmartSearch.css'

const SmartSearch = ({ api_url }) => {

    const [query, setQuery] = useState('')
    const [results, setResults] = useState([])
    const [suggested, setSuggested] = useState(null)
    const [loading, setLoading] = useState(false)
    const [searched, setSearched] = useState(false)
    const [saving, setSaving] = useState(false)

    const handleSearch = async (e) => {
        e.preventDefault()
        if (!query.trim()) return

        setLoading(true)
        setSearched(true)
        setSuggested(null)

        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query })
        }

        const response = await fetch(`${api_url}/api/ai/search`, options)
        const data = await response.json()

        setResults(data.matched || [])
        setSuggested(data.suggested || null)
        setLoading(false)
    }

    const saveTrip = async () => {
        if (!suggested) return
        setSaving(true)

        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: suggested.title,
                description: suggested.description,
                img_url: suggested.img_url || '',
                num_days: suggested.num_days,
                start_date: suggested.start_date,
                end_date: suggested.end_date,
                total_cost: suggested.total_cost
            })
        }

        await fetch(`${api_url}/api/trips`, options)
        setSaving(false)
        window.location.href = '/'
    }

    return (
        <div className='smartSearch'>
            <center><h2>Smart Search</h2></center>
            <p className='searchHint'>Try: "beach trip under $2000" or "5 day trip to Europe" or "cheap weekend getaway"</p>

            <form className='searchForm' onSubmit={handleSearch}>
                <input
                    type='text'
                    className='searchInput'
                    placeholder='Describe your ideal trip...'
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <button type='submit' className='searchBtn' disabled={loading}>
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </form>

            {loading && <div className='loader'></div>}

            {suggested && !loading && (
                <div className='suggestedSection'>
                    <h3>AI Suggested Trip</h3>
                    <div className='suggestedCard' style={{ backgroundImage: `url(${suggested.img_url})` }}>
                        <div className='suggestedInfo'>
                            <h2>{suggested.title}</h2>
                            <p className='suggestedDesc'>{suggested.description}</p>
                            <div className='suggestedMeta'>
                                <span>{suggested.num_days} days</span>
                                <span>${suggested.total_cost}</span>
                                <span>{suggested.start_date} to {suggested.end_date}</span>
                            </div>
                            <button className='saveTripBtn' onClick={saveTrip} disabled={saving}>
                                {saving ? 'Saving...' : 'Save Trip'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className='searchResults'>
                {results.length > 0 && <h3 className='matchedHeader'>Matching Trips</h3>}
                {searched && !loading && results.length === 0 && !suggested && (
                    <p className='noResults'>No matching trips found. Try a different search.</p>
                )}
                {results.map((trip) =>
                    <Card
                        key={trip.id}
                        id={trip.id}
                        title={trip.title}
                        description={trip.description}
                        img_url={trip.img_url}
                        num_days={trip.num_days}
                        start_date={trip.start_date}
                        end_date={trip.end_date}
                        total_cost={trip.total_cost}
                    />
                )}
            </div>
        </div>
    )
}

export default SmartSearch
