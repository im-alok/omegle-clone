import React from 'react'
import Message from './Message'
import SendMessage from './SendMessage'
import { Socket } from 'socket.io-client'
import { MessageType } from '../Room'

interface handleProps{
    roomId:string,
    socket:Socket | null,
    message:MessageType[],
    setMessage:React.Dispatch<React.SetStateAction<MessageType[]>>
}

const index = ({roomId,message,setMessage,socket}:handleProps) => {
    console.log(message);
    console.log(roomId)
    return (
        <div className='flex flex-col w-full h-full gap-5'>
            <Message messages={message} socket={socket}/>
            <SendMessage roomId={roomId} socket={socket}/>
        </div>
    )
}

export default index
