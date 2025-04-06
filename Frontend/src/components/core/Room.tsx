import { handleICECandidateEvent, handleLocalVideoStream, handleTrackEvent } from '@/lib/webRTC'
import { useEffect, useRef, useState } from 'react'
import { Socket, io } from "socket.io-client"
import Background from './Background'
import ConversationPage from "@/components/core/Conversation/index"
import Loading from './Loading'
import { Button } from '../ui/button'
import { MoveRight } from 'lucide-react'


const URL = "http://localhost:3000/"

export interface MessageType {
    sender: string,
    message: string
}

const Room = ({
    userName,
    localVideoStream,
    localAudioStream
}: {
    userName: string,
    localVideoStream: MediaStreamTrack | null,
    localAudioStream: MediaStreamTrack | null
}) => {


    const [socket, setSocket] = useState<null | Socket>(null);
    const [lobby, setLobby] = useState<Boolean>(true);
    const [message, setMessage] = useState<MessageType[]>([]);
    const offererPc = useRef<RTCPeerConnection | null>(null);
    const answererPc = useRef<null | RTCPeerConnection>(null);
    const localVideoRef = useRef<HTMLVideoElement | null>(null);
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
    const remoteStream = useRef(new MediaStream());
    const id = useRef<string>(""); //room ID

    useEffect(() => {
        //logic to get the user

        const ws = io(URL, {
            autoConnect: true,
        });

        setSocket(ws);
        ws.emitWithAck("initiate-call", {
            userName
        }, () => {
            console.log("Thing started");
        })

        const setupOfferer = ({ roomId }: { roomId: string }) => {
            const pc = new RTCPeerConnection({
                iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
            });
            id.current = roomId;
            offererPc.current = pc;

            pc.ontrack = (event) => handleTrackEvent(remoteStream, remoteVideoRef, event);

            if (localAudioStream && localVideoStream) {
                handleLocalVideoStream(pc, localAudioStream, localVideoStream);
            }

            pc.onicecandidate = (e) => handleICECandidateEvent(e, ws, "offerer", roomId);

            pc.onnegotiationneeded = async () => {
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                ws.emit("offer", {
                    sdp: offer,
                    roomId
                });
            };
        };

        const setupAnswerer = async ({ roomId, sdp }: { roomId: string, sdp: RTCSessionDescriptionInit }) => {
            const pc = new RTCPeerConnection({
                iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
            });
            id.current = roomId;
            answererPc.current = pc;

            if (localAudioStream && localVideoStream) {
                handleLocalVideoStream(pc, localAudioStream, localVideoStream);
            }

            pc.setRemoteDescription(new RTCSessionDescription(sdp));

            pc.ontrack = (event) => handleTrackEvent(remoteStream, remoteVideoRef, event);

            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            ws.emit("answer", {
                sdp: answer,
                roomId
            });

            pc.onicecandidate = (e) => handleICECandidateEvent(e, ws, "answerer", roomId);

            setLobby(false);
        };


        ws.on("lobby", () => setLobby(true));
        ws.on("send-offer", setupOfferer);
        ws.on("offer", setupAnswerer);
        ws.on("answer", async ({ sdp }) => {
            setLobby(false);
            if (!offererPc.current) return;
            await offererPc.current.setRemoteDescription(new RTCSessionDescription(sdp));
        });



        ws.on("add-ice-candidate", ({ type, candidate }) => {
            const rtcCandidate = new RTCIceCandidate(candidate);
            if (type === "offerer") {
                answererPc.current?.addIceCandidate(rtcCandidate);
            } else {
                offererPc.current?.addIceCandidate(rtcCandidate);
            }
        });
        ws?.on("room-ends", () => {
            remoteStream.current?.getTracks().forEach(track => {
                remoteStream.current.removeTrack(track);
                track.stop()
            });
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = null;
            }
            offererPc.current?.close();
            answererPc.current?.close();
            setMessage([]);
            setLobby(true);
        })

        ws?.on("conversation", ({ message, sender }: { message: string, sender: string }) => {
            const newMessage: MessageType = {
                message: message,
                sender: sender
            }
            setMessage(prev => [...prev, newMessage]);
        })



        return () => {
            ws.disconnect();
            ws.removeAllListeners();

            offererPc.current?.getSenders().forEach(sender => sender.track?.stop());
            answererPc.current?.getSenders().forEach(sender => sender.track?.stop());

            offererPc.current?.close();
            answererPc.current?.close();

            offererPc.current = null;
            answererPc.current = null;

            remoteStream.current?.getTracks().forEach(track => track.stop());

            if (localVideoRef.current) {
                localVideoRef.current.srcObject = null;
            }

            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = null;
            }

            setSocket(null);
        };

    }, [userName]);


    useEffect(() => {
        if (localVideoRef.current && localVideoStream) {
            const stream = new MediaStream();
            stream.addTrack(localVideoStream);
            localVideoRef.current.srcObject = stream;
            localVideoRef.current.play()
        }


    }, [localVideoStream]);


    function handleSkip() {
        socket?.emit("skip", {
            roomId: id.current
        })
    }


    return (
        <div className='w-screen h-screen p-2 flex gap-2 overflow-hidden'>
            <Background />
            <div className='flex flex-col justify-evenly items-center'>

                {/* localVideo */}
                <div className='flex flex-col gap-5'>
                    <video autoPlay muted width={400} ref={localVideoRef} className='rounded-2xl border-2 shadow-2xs shadow-white' />

                    {lobby ? (<Loading />) : null}

                    {/* incoming video */}
                    <video autoPlay muted={false} width={400} height={400} ref={remoteVideoRef} className='rounded-2xl' />
                </div>


                {
                    !lobby && (
                        <Button variant={"outline"} className='bg-green-500 text-black outline-none cursor-pointer' size={"lg"}
                        onClick={handleSkip}
                        >skip < MoveRight /></Button>
                    )
                }
            </div>


            {/* //chat apge */}

            <div className='w-full h-full'>
                <ConversationPage roomId={id.current} message={message} setMessage={setMessage} socket={socket} />
            </div>
        </div>
    )
}

export default Room



//todo: Deploy the code