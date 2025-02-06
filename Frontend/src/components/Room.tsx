import React, { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

const Room = () => {

    const [searchParams, setSearchParams] = useSearchParams();

    const name = searchParams.get('name');

    useEffect(()=>{ 
        //logic to get the user
    },[]);

    return (
        <div className='text-2xl'>
            Hi, {name}
        </div>
    )
}

export default Room
