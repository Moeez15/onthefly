import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import '../css/EditDestination.css'

const EditDestination = ({ data, api_url }) => {

    const { id } = useParams()
    const [destination, setDestination] = useState({
        id: 0,
        destination: '',
        description: '',
        city: '',
        country: '',
        img_url: '',
        flag_img_url: ''
    })

    useEffect(() => {
        const result = data.filter(item => item.id === parseInt(id))[0]

        if (result) {
            setDestination({
                id: parseInt(result.id),
                destination: result.destination,
                description: result.description,
                city: result.city,
                country: result.country,
                img_url: result.img_url,
                flag_img_url: result.flag_img_url
            })
        }
    }, [data, id])

    const handleChange = (event) => {
        const { name, value } = event.target

        setDestination((prev) => {
            return {
                ...prev,
                [name]: value,
            }
        })
    }

    const updateDestination = (event) => {
        event.preventDefault()

        const options = {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(destination)
        }

        fetch(`${api_url}/api/destinations/${id}`, options)
        window.location.href = '/destinations'
    }

    const deleteDestination = async (event) => {
        event.preventDefault()

        const options = { method: 'DELETE' }

        await fetch(`${api_url}/api/trips-destinations/destination/${id}`, options)
        await fetch(`${api_url}/api/destinations/${id}`, options)
        window.location.href = '/destinations'
    }

    return (
        <form>
            <center><h3>Edit Destination</h3></center>

            <label>Destination</label> <br />
            <input type='text' id='destination' name='destination' value={destination.destination} onChange={handleChange}/><br />
            <br/>

            <label>Description</label><br />
            <textarea rows='5' cols='50' id='description' name='description' value={destination.description} onChange={handleChange}></textarea>
            <br/>

            <label>City</label><br />
            <input type='text' id='city' name='city' value={destination.city} onChange={handleChange}/><br />
            <br/>

            <label>Country</label><br />
            <input type='text' id='country' name='country' value={destination.country} onChange={handleChange}/><br />
            <br/>

            <label>Image URL</label><br />
            <input type='text' id='img_url' name='img_url' value={destination.img_url} onChange={handleChange}/><br />
            <br/>

            <label>Flag Image URL</label><br />
            <input type='text' id='flag_img_url' name='flag_img_url' value={destination.flag_img_url} onChange={handleChange}/><br />
            <br/>

            <input type='submit' value='Submit' onClick={updateDestination} />
            <button className='deleteButton' onClick={deleteDestination}>Delete</button>
        </form>
    )
}

export default EditDestination
