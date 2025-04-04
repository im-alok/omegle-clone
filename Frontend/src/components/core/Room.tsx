import { handleICECandidateEvent, handleLocalVideoStream, handleTrackEvent } from '@/lib/webRTC'
import { useEffect, useRef, useState } from 'react'
import { Socket, io } from "socket.io-client"
import Background from './Background'
import ConversationPage from "@/components/core/Conversation/index"
import Loading from './Loading'
import { Button } from '../ui/button'
import { MoveRight } from 'lucide-react'


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


    const [socket, setSocket] = useState<null | Socket>(null);
    const [lobby, setLobby] = useState<Boolean>(true);
    const offererPc = useRef<RTCPeerConnection | null>(null);
    const answererPc = useRef<null | RTCPeerConnection>(null);
    const localVideoRef = useRef<HTMLVideoElement | null>(null);
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
    const remoteStream = useRef(new MediaStream());

    useEffect(() => {
        //logic to get the user

        const ws = io(URL, {
            autoConnect: true,
        });
        setSocket(ws);

        const setupOfferer = ({ roomId }: { roomId: string }) => {
            const pc = new RTCPeerConnection({
                iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
            });
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
                        <Button variant={"outline"} className='bg-green-500 text-black outline-none cursor-pointer' size={"lg"}>skip < MoveRight /></Button>
                    )
                }
            </div>

            {/* //chat apge */}

            <div className='w-full h-full'>
                <ConversationPage />
            </div>
        </div>
    )
}

export default Room



//todo:
// ** cleanup logic
// 1. write the logic to hndle user after they leave the room or click the next button
// 2. add the chat features
// 3. deploy the code
// 4. dome
