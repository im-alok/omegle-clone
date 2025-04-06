import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'
import React, { useState } from 'react'
import { Socket } from 'socket.io-client';

const SendMessage = ({ roomId, socket }: { roomId: string, socket: Socket | null }) => {
  const [value, setValue] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValue(e.target.value)

  }

  function handleSubmit() {
    if(value.length ===0){
      return;
    }

    socket?.emit("conversation", {
      roomId,
      message: value,
      sender: socket?.id
    })
    setValue("")
  }

  return (
    <div className='flex gap-2 items-center w-full '>
      <Input
        type="text"
        value={value}
        onChange={handleChange}
        className="h-12 pl-3 border-green-700/30 bg-black/20 backdrop-blur-md input-focus-effect text-green-100"
      />
      <Button disabled={roomId ? false : true} onClick={handleSubmit} variant={"default"} className={`${roomId ? "cursor-pointer" : "cursor-not-allowed"}`}>send</Button>
    </div>
  )
}

export default SendMessage
