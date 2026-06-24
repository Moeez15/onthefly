import { useState, useEffect } from 'react'
import { useRoutes, Link } from 'react-router-dom'
import ReadTrips from './pages/ReadTrips'
import CreateTrip from './pages/CreateTrip'
import EditTrip from './pages/EditTrip'
import CreateDestination from './pages/CreateDestination'
import ReadDestinations from './pages/ReadDestinations'
import TripDetails from './pages/TripDetails'
import CreateActivity from './pages/CreateActivity'
import AddToTrip from './pages/AddToTrip'
import AddUserToTrip from './pages/AddUserToTrip'
import EditDestination from './pages/EditDestination'
import MyTrips from './pages/MyTrips'
import GenerateItinerary from './pages/GenerateItinerary'
import SmartSearch from './pages/SmartSearch'
import Login from './pages/Login'
import Avatar from './components/Avatar'
import './App.css'

const App = () => {
  const API_URL = 'http://localhost:3001'

  const [trips, setTrips] = useState([])
  const [destinations, setDestinations] = useState([])
  const [user, setUser] = useState([])

  useEffect(() => {
    const fetchTrips = async () => {
      const response = await fetch(`${API_URL}/api/trips`)
      const data = await response.json()
      setTrips(data)
    }

    const fetchDestinations = async () => {
      const response = await fetch(`${API_URL}/api/destinations`)
      const data = await response.json()
      setDestinations(data)
    }

    const getUser = async () => {
      const response = await fetch(`${API_URL}/auth/login/success`, { credentials: 'include' } )
      const json = await response.json()
      setUser(json.user)
    }

    getUser()
    fetchTrips()
    fetchDestinations()
  }, [])

  const logout = async () => {
    await fetch(`${API_URL}/auth/logout`, { credentials: 'include' })
    setUser(null)
  }

  let element = useRoutes([
    {
      path: '/',
      element: user && user.id ?
          <ReadTrips user={user} data={trips} /> : <Login api_url={API_URL} />
    },
    {
      path: '/trip/new',
      element: user && user.id ?
          <CreateTrip user={user} api_url={API_URL} /> : <Login api_url={API_URL} />
    },
    {
      path: '/edit/:id',
      element: user && user.id ?
          <EditTrip user={user} data={trips} api_url={API_URL} /> : <Login api_url={API_URL} />
    },
    {
      path: '/destinations',
      element: user && user.id ?
          <ReadDestinations user={user} data={destinations} /> : <Login api_url={API_URL} />
    },
    {
      path: '/trip/get/:id',
      element: user && user.id ?
          <TripDetails user={user} data={trips} api_url={API_URL} /> : <Login api_url={API_URL} />
    },
    {
      path: '/destination/new/:trip_id',
      element: user && user.id ?
          <CreateDestination user={user} api_url={API_URL} /> : <Login api_url={API_URL} />
    },
    {
      path: '/activity/create/:trip_id',
      element: user && user.id ?
          <CreateActivity user={user} api_url={API_URL} /> : <Login api_url={API_URL} />
    },
    {
      path: '/destinations/add/:destination_id',
      element: user && user.id ?
          <AddToTrip user={user} data={trips} api_url={API_URL} /> : <Login api_url={API_URL} />
    },
    {
      path: '/users/add/:trip_id',
      element: user && user.id ?
          <AddUserToTrip api_url={API_URL}/> : <Login api_url={API_URL} />
    },
    {
      path: '/destination/edit/:id',
      element: user && user.id ?
          <EditDestination user={user} data={destinations} api_url={API_URL} /> : <Login api_url={API_URL} />
    },
    {
      path: '/my-trips',
      element: user && user.id ?
          <MyTrips user={user} api_url={API_URL} /> : <Login api_url={API_URL} />
    },
    {
      path: '/trip/itinerary/:id',
      element: user && user.id ?
          <GenerateItinerary user={user} data={trips} api_url={API_URL} /> : <Login api_url={API_URL} />
    },
    {
      path: '/search',
      element: user && user.id ?
          <SmartSearch user={user} api_url={API_URL} /> : <Login api_url={API_URL} />
    },
])

  return ( 
    <div className='App'>
      {
          user && user.id ?
              <div className='header'>
                  <h1>On The Fly ✈️</h1>
                  <Avatar className='avatar' user={user} />
                  <Link to='/search'><button className='headerBtn'>Smart Search</button></Link>
                  <Link to='/'><button className='headerBtn'>Explore Trips</button></Link>
                  <Link to='/destinations'><button className='headerBtn'>Explore Destinations</button></Link>
                  <Link to='/my-trips'><button className='headerBtn'>My Trips</button></Link>
                  <Link to='/trip/new'><button className='headerBtn'> + Add Trip </button></Link>
                  <button className='headerBtn' onClick={logout}>Logout</button>
              </div>
          : <></>
      }
      {element}
    </div>

  )
}

export default App
