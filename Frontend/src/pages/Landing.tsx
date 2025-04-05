import React, { useEffect, useRef, useState } from 'react'
import Room from '../components/core/Room';
import Background from '@/components/core/Background';
import { Mic, MicOff, Video, VideoOff } from "lucide-react";
import { cn } from "@/lib/utils";
import NameInput from '@/components/core/NameInput';
import ConsentButton from '@/components/core/ConsentButton';

const Landing = () => {

    const [text, setText] = useState('')
    const [isMicOn, setIsMicOn] = useState(true);
    const [isVideoOn, setIsVideoOn] = useState(true);

    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [localVideoStream, setLocalVideoStream] = useState<MediaStreamTrack | null>(null);
    const [localAudioStream, setLocalAudioStream] = useState<MediaStreamTrack | null>(null);

    const [joined, setJoined] = useState<Boolean>(false);

    async function getCam() {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: isVideoOn ? true : false,
            audio: isMicOn ? true : false
        })
        if (isVideoOn) {
            const videoTracks = stream.getVideoTracks()[0];
            setLocalVideoStream(videoTracks);
        }

        if (isMicOn) {
            const audioTracks = stream.getAudioTracks()[0];
            setLocalAudioStream(audioTracks)
        }
        if (!videoRef.current || !videoRef)
            return;
        videoRef.current.srcObject = stream
    }

    useEffect(() => {
        getCam()
    }, []);
    const toggleMic = () => {
        if (localAudioStream) {
            localAudioStream.enabled = !isMicOn;
        }
        setIsMicOn(prev => !prev);
    }

    const toggleVideo = () => {
        if (localVideoStream) {
            localVideoStream.enabled = !isVideoOn;
        }
        setIsVideoOn(prev => !prev);
    }

    if (!joined) {
        return (
            <div className="w-screen h-screen flex p-10 items-center justify-between">
                <Background />
                <div className='flex-1 relative'>
                    <video autoPlay ref={videoRef} width={600} className='rounded-2xl relative' ></video>

                    <div className="absolute top-5  left-5 flex gap-4">
                        <button
                            onClick={() => toggleMic()}
                            className={cn(
                                "w-16 h-16 rounded-full flex items-center justify-center",
                                isMicOn ? "bg-transparent border border-white" : "bg-[#EA4335] border border-[#EA4335] cursor-pointer"
                            )}
                        >
                            {isMicOn ? <Mic size={21} className="text-green-100" /> : <MicOff size={21} className="text-red-100" />}
                        </button>
                        <button
                            onClick={() => toggleVideo()}
                            className={cn(
                                " cursor-pointer w-16 h-16 rounded-full flex items-center justify-center",
                                isVideoOn ? "bg-transparent border border-white" : "bg-[#EA4335] border border-[#EA4335]"
                            )}
                        >
                            {isVideoOn ? <Video size={21} className="text-green-100" /> : <VideoOff size={21} className="text-red-100" />}
                        </button>
                    </div>

                </div>

                <div className='w-1/2 flex gap-5 flex-col'>
                    <h1 className='text-2xl  font-mono text-indigo-200'>Your Name:</h1>
                    <div className='flex flex-col gap-5'>
                        <NameInput onNameChange={setText} />
                        {
                            text && <ConsentButton onConsent={setJoined} isReady={joined} />
                        }
                    </div>
                </div>
            </div>
        )
    }

    return <Room userName={text} localVideoStream={localVideoStream} localAudioStream={localAudioStream} />



}

export default Landing
