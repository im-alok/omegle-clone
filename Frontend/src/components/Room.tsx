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
            console.log("offerer: user is asked to send the message", ws.id);
            const pc = new RTCPeerConnection({
                iceServers: [
                    { urls: "stun:stun.l.google.com:19302" },
                    // Add TURN server if needed for NAT traversal
                ]
            });
            offererPc.current = pc;
            console.log(offererPc);

            pc.ontrack = (event) => {
                if (!remoteStream.current.getTracks().some(t => t.id === event.track.id)) {
                    remoteStream.current.addTrack(event.track);
                }
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = remoteStream.current;
                    remoteVideoRef.current.play().catch(e => console.error("Play failed:", e));
                }
            };


            if (localAudioStream) {
                console.log("2. offerer: local stream is added")
                pc.addTrack(localAudioStream)
            }
            if (localVideoStream) {
                pc.addTrack(localVideoStream)
            }



            pc.onicecandidate = (e) => {
                console.log("offerer: getting ice candidate and sending up to the server/other side", ws.id)
                console.log(e.candidate)
                if (e.candidate) {
                    ws.emit("add-ice-candidate", {
                        candidate: e.candidate,
                        roomId,
                        type: "offerer"
                    })
                }
            }




            pc.onnegotiationneeded = async () => {
                console.log("offerer: offer is being sent");
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
                    // Add TURN server if needed for NAT traversal
                ]
            });
            answererPc.current = pc;
            if (localAudioStream) {
                pc.addTrack(localAudioStream)
            }
            if (localVideoStream) {
                pc.addTrack(localVideoStream);
            }

            pc.setRemoteDescription(new RTCSessionDescription(sdp));


            pc.ontrack = (event) => {
                if (!remoteStream.current.getTracks().some(t => t.id === event.track.id)) {
                    remoteStream.current.addTrack(event.track);
                }
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = remoteStream.current;
                    remoteVideoRef.current.play().catch(e => console.error("Play failed:", e));
                }
            };



            const answer = await pc.createAnswer()
            await pc.setLocalDescription(answer);
            ws.emit("answer", {
                sdp: answer,
                roomId: roomId
            })
            pc.onicecandidate = (e) => {
                console.log("answerer: ice candidate is received")
                if (e.candidate) {
                    ws.emit("add-ice-candidate", {
                        candidate: e.candidate,
                        roomId,
                        type: "answerer"
                    })
                }
            }
            console.log("answerer: answer is being sent");

            setLobby(false);

        })
        ws.on("answer", async ({ sdp }) => {
            console.log(sdp);
            setLobby(false)
            if (!offererPc.current) {
                console.log("return from here only ")
                return;
            }

            await offererPc.current.setRemoteDescription(new RTCSessionDescription(sdp));

        })



        ws.on("add-ice-candidate", ({ type, candidate }) => {
            console.log("ice cndiate is received");
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
