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
    const [localPc, setLocalPc] = useState<null | RTCPeerConnection>(null);
    const [remotePc, setRemotePc] = useState<null | RTCPeerConnection>(null);
    const localVideoRef = useRef<HTMLVideoElement | null>(null);
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

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
            const pc = new RTCPeerConnection();
            setLocalPc(pc);



            const localStream = new MediaStream();
            if (localAudioStream) {
                localStream.addTrack(localAudioStream);
            }
            if (localVideoStream) {
                localStream.addTrack(localVideoStream);
            }

            localStream.getTracks().forEach(track => pc.addTrack(track, localStream));


            pc.onicecandidate = (e) => {
                ws.emit("add-ice-candidate", {
                    candidate: e.candidate,
                    roomId,
                    type: "sender"
                })
            }

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
            const pc = new RTCPeerConnection();
            setRemotePc(pc);
            await pc.setRemoteDescription(sdp);

            pc.onicecandidate = (e) => {
                ws.emit("add-ice-candidate", {
                    candidate: e.candidate,
                    roomId,
                    type: "receiver"
                })
            }

            const remoteMediaStream = new MediaStream();

            pc.ontrack = async (event) => {
                if (remoteVideoRef.current) {
                    remoteMediaStream.addTrack(event.track)
                    if (event.track.kind === "video") {
                        remoteVideoRef.current.srcObject = remoteMediaStream;
                        await remoteVideoRef.current.play();
                    }
                }

            }



            pc.onnegotiationneeded = async () => {
                const answer = await pc.createAnswer()
                await pc.setLocalDescription(answer);

                ws.emit("answer", {
                    sdp: sdp,
                    roomId: roomId
                })
            }

            setLobby(false);

        })
        ws.on("answer", async ({ sdp }) => {

            if (!localPc) return;

            await localPc.setRemoteDescription(sdp);
        })

        ws.on("add-ice-candidate", ({ type, candidate }) => {
            if (type === "sender") {
                setRemotePc(pc => {
                    pc?.addIceCandidate(candidate);
                    return pc;
                })
            } else {
                setLocalPc(pc => {
                    pc?.addIceCandidate(candidate)
                    return pc
                })
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
    }, [localVideoStream]);




    return (
        <div className='text-2xl'>
            Hi {name}
            <video autoPlay muted width={400} height={400} ref={localVideoRef} />
            {lobby ? "Waiting to connect you to someone" : null}
            <video autoPlay width={400} height={400} ref={remoteVideoRef} />
        </div>
    )
}

export default Room
