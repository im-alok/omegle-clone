import { handleICECandidateEvent, handleLocalVideoStream, handleTrackEvent } from '@/lib/webRTC'
import React, { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Socket, io } from "socket.io-client"


const URL = "http://localhost:3000/"

const Room = ({
    userName,
    localVideoStream,
    localAudioStream
}: {
    userName: string,
    localVideoStream: MediaStreamTrack | null,
    localAudioStream: MediaStreamTrack | null
}) => {

    const [searchParams, setSearchParams] = useSearchParams();
    const [socket, setSocket] = useState<null | Socket>(null);
    const [lobby, setLobby] = useState<Boolean>(true);
    const offererPc = useRef<RTCPeerConnection | null>(null);
    const answererPc = useRef<null | RTCPeerConnection>(null);
    const localVideoRef = useRef<HTMLVideoElement | null>(null);
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
    const remoteStream = useRef(new MediaStream());

    const name = searchParams.get('name');

    useEffect(() => {
        //logic to get the user

        const ws = io(URL, {
            autoConnect: true,
        });
        setSocket(ws);

        ws.on("lobby", () => {
            setLobby(true);
        })
        ws.on("send-offer", ({ roomId }) => {
            const pc = new RTCPeerConnection({
                iceServers: [
                    { urls: "stun:stun.l.google.com:19302" },
                ]
            });
            offererPc.current = pc;

            //event handler to receive the remote media
            pc.ontrack = (event) =>handleTrackEvent(remoteStream,remoteVideoRef,event);

            //adding the local audio and video streams
            if (localAudioStream && localVideoStream)
                handleLocalVideoStream(pc,localAudioStream,localVideoStream);

            //if crendentials and ip came send it to other side
            pc.onicecandidate = (e) => handleICECandidateEvent(e,ws,"offerer",roomId)

            //sending offer to start the connection
            pc.onnegotiationneeded = async () => {
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                ws.emit("offer", {
                    sdp: offer,
                    roomId
                })
            }
        })

        ws.on("offer", async ({ roomId, sdp }) => {
            const pc = new RTCPeerConnection({
                iceServers: [
                    { urls: "stun:stun.l.google.com:19302" },
                ]
            });
            answererPc.current = pc;

            if (localAudioStream && localVideoStream) 
                handleLocalVideoStream(pc,localAudioStream,localVideoStream)

            // setting up the remote sdp comming in offer
            pc.setRemoteDescription(new RTCSessionDescription(sdp));

            pc.ontrack = (event) =>handleTrackEvent(remoteStream,remoteVideoRef,event);

            const answer = await pc.createAnswer()
            await pc.setLocalDescription(answer);
            ws.emit("answer", {
                sdp: answer,
                roomId: roomId
            })

            pc.onicecandidate = (e) => handleICECandidateEvent(e,ws,"answerer",roomId)

            setLobby(false);

        })
        ws.on("answer", async ({ sdp }) => {
            setLobby(false)
            if (!offererPc.current) return;
            await offererPc.current.setRemoteDescription(new RTCSessionDescription(sdp));

        })


        // if ice candidate is received sending it to correct pos
        ws.on("add-ice-candidate", ({ type, candidate }) => {
            if (type === "offerer") {
                answererPc.current?.addIceCandidate(candidate);
            } else {
                console.log(offererPc);
                offererPc.current?.addIceCandidate(candidate);

            }
        })

    }, [name]);


    useEffect(() => {
        if (localVideoRef.current && localVideoStream) {
            const stream = new MediaStream();
            stream.addTrack(localVideoStream);
            localVideoRef.current.srcObject = stream;
            localVideoRef.current.play()
        }

        return () => {
            offererPc.current!.close();
            console.log(answererPc)
            answererPc.current!.close();
        }
    }, [localVideoStream]);




    return (
        <div className='text-2xl'>
            Hi {name}
            <video autoPlay muted width={400} height={400} ref={localVideoRef} />
            {lobby ? "Waiting to connect you to someone" : null}
            <video autoPlay muted={false} width={400} height={400} ref={remoteVideoRef} />
        </div>
    )
}

export default Room
