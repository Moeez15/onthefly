import { Link } from 'react-router-dom'
import more from '../assets/more.png'
import '../css/DestinationCard.css'

const DestinationCard = (props) =>  {
  return (
      <div className='DestinationCard' style={{ backgroundImage:`url(${props.img_url})`}}>
        <div className='card-info'>
          <Link to={'/destination/edit/'+ props.id}><img className='moreButton' alt='edit button' src={more} /></Link>
          <h2 className='destination'>{props.destination}</h2>
          <p className='description'>{props.description}</p>
         <Link to={'add/'+ props.id}><button className='addToTripBtn'>+ Add to Trip</button></Link>
        </div>
      </div>
  )
}

export default DestinationCard
