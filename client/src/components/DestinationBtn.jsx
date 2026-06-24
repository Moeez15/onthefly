import '../css/DestinationBtn.css'

const DestinationBtn = (props) =>  {

  const deleteDestination = async (e) => {
    e.stopPropagation()
    await fetch(`${props.api_url}/api/trips-destinations/destination/${props.id}`, { method: 'DELETE' })
    await fetch(`${props.api_url}/api/destinations/${props.id}`, { method: 'DELETE' })
    props.onDelete(props.id)
  }

  return (
    <div className='destinationWrapper'>
      <div className='DestinationBtn' id={props.id}>
        {props.destination}
        <span className='deleteDestinationBtn' onClick={deleteDestination}>✕</span>
      </div>
    </div>
  )
}

export default DestinationBtn
