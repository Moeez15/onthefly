import React from 'react'
import '../css/Avatar.css'

const Avatar = (props) =>  {
    const avatarUrl = props.user?.photos?.[0]?.value || ''
    const avatarName = props.user?.displayName || 'User'

    return (
        <div className={`Avatar ${props.className || ''}`.trim()}>
            {avatarUrl ? <img className='user-img' src={avatarUrl} alt={avatarName} /> : null}
        </div>
    )
}

export default Avatar
