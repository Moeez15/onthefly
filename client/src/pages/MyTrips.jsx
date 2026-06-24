import { useState, useEffect } from 'react'
import Card from '../components/Card'

const MyTrips = ({ user, api_url }) => {

    const [trips, setTrips] = useState([])

    useEffect(() => {
        const fetchMyTrips = async () => {
            const response = await fetch(`${api_url}/api/users-trips/trips/${user.username}`)
            const data = await response.json()
            setTrips(data)
        }

        if (user && user.username) {
            fetchMyTrips()
        }
    }, [api_url, user])

    return (
        <div className='MyTrips'>
            <center><h3>My Trips</h3></center>
            {
                trips && trips.length > 0 ?
                trips.map((trip) =>
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
                ) : <h3 className='noResults'>{'No Trips Yet 😞'}</h3>
            }
        </div>
    )
}

export default MyTrips
