import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const Landing = () => {

    const [text,setText] = useState('')
    
    return (
        <div className='flex justify-center gap-2'>
            <input onChange={(e)=>(setText(e.target.value))} placeholder='enter  your name:' className='border-2'/>
            <div>{text}</div>
            <Link to={`/room?name=${text.length === 0 ?('random123'):(text)}`}>Submit</Link>
        </div>
    )

    
}

export default Landing
