import Message from './Message'
import SendMessage from './SendMessage'
import { Socket } from 'socket.io-client'
import { MessageType } from '../Room'

interface handleProps{
    roomId:string,
    socket:Socket | null,
    message:MessageType[]
}

const index = ({roomId,message,socket}:handleProps) => {
    return (
        <div className='flex flex-col w-full h-full gap-5'>
            <Message messages={message} socket={socket}/>
            <SendMessage roomId={roomId} socket={socket}/>
        </div>
    )
}

export default index
