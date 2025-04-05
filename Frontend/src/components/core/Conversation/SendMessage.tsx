import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'
import React, { useState } from 'react'

const SendMessage = () => {
  const [value,setValue] = useState("");

  function handleChange(e:React.ChangeEvent<HTMLInputElement>){
      setValue(e.target.value)
  }

  return (
    <div className='flex gap-2 items-center w-full '>
      <Input 
      type="text"
      value={value}
      onChange={handleChange}
      className="h-12 pl-3 border-green-700/30 bg-black/20 backdrop-blur-md input-focus-effect text-green-100"
      />
      <Button variant={"outline"} className='cursor-pointer'>send</Button>
    </div>
  )
}

export default SendMessage
