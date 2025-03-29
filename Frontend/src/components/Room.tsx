import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Socket, io } from "socket.io-client"


const URL = "http://localhost:3000/"

const Room = () => {

    const [searchParams, setSearchParams] = useSearchParams();
    const [socket, setSocket] = useState<null | Socket>(null);
    const [lobby,setLobby] = useState<Boolean>(true);

    const name = searchParams.get('name');

    useEffect(() => {
        //logic to get the user
        const ws = io(URL, {
            autoConnect: true,
        });
        setSocket(ws);
        
        ws.on("lobby",()=>{
            setLobby(true);
        })
        ws.on("send-offer", (data) => {
            alert(`need to send offer: \n`);
            
            // offer created
            ws.emit("offer",{
                sdp:"",
                roomId:"1"
            })
        })

        ws.on("offer",()=>{
            alert("offere received sccessfully &&  need to send the answer");
            //add the answer and send to the answer to the other party
            setLobby(false);
            ws.emit("answer",{
                sdp:"",
                roomId:1
            })
        })
        ws.on("answer",()=>{
            //set the answer to the remote sdp
            setLobby(false);
            alert("connection successfully")
        })

    }, [name]);


    if(lobby){
        return <div>
            Waiting for you to connect
        </div>
    }

    return (
        <div className='text-2xl'>
            Hi, {name}
        </div>
    )
}

export default Room
