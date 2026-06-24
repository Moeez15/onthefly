import { useState } from 'react'
import '../css/ActivityBtn.css'

const ActivityBtn = (props) =>  {

  const [num_votes, setNumVotes] = useState(props.num_votes)

  const updateCount = () => {
    const options = {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({num_votes: num_votes + 1})
    }

    fetch(`${props.api_url}/api/activities/${props.id}`, options)
    setNumVotes((num_votes) => num_votes + 1)
  }

  const deleteActivity = async (e) => {
    e.stopPropagation()

    await fetch(`${props.api_url}/api/activities/${props.id}`, { method: 'DELETE' })
    props.onDelete(props.id)
  }

  return (
    <div className='activityWrapper'>
      <div className='activityBtn' id={props.id} onClick={updateCount}>
        {props.activity} <br/> {'△ ' + num_votes + ' Upvotes' }
        <span className='deleteActivityBtn' onClick={deleteActivity}>✕</span>
      </div>
    </div>
  )

}

export default ActivityBtn