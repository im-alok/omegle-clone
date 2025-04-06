import React from 'react'
import { MessageType } from '../Room'
import { Socket } from 'socket.io-client'

const Message = ({ messages, socket }: { messages: MessageType[], socket: Socket | null }) => {
  return (
    <div className='overflow-auto min-w-full min-h-[90vh]  bg-gradient-to-br from-zinc-700 via-gray-800 to-neutral-900 backdrop-blur-sm rounded-2xl p-3'>
    <div className='flex justify-center text-xl font-mono text-gray-200'>Start your conversation</div>
      <div>
        {
          messages.map((message, index) => (
            <div key={index} className=''>
              <span className='text-xs text-gray-200'>
                {
                  message.sender === socket?.id ? "you" : "peer"
                }
              </span>
              <p className='font-mono text-gray-100'>
                {message.message}
              </p>
            </div>
          ))
        }
      </div>
    </div>
  )
}

export default Message
