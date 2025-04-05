import React from 'react'
import Message from './Message'
import SendMessage from './SendMessage'

const index = ({}) => {
    return (
        <div className='flex flex-col w-full h-full gap-5'>
            <Message />
            <SendMessage />
        </div>
    )
}

export default index
