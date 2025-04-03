import React, { useEffect, useRef, useState } from 'react'
import Room from './Room';

const Landing = () => {

    const [text, setText] = useState('')

    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [localVideoStream, setLocalVideoStream] = useState<MediaStreamTrack | null>(null);
    const [localAudioStream, setLocalAudioStream] = useState<MediaStreamTrack | null>(null);

    const [joined, setJoined] = useState<Boolean>(false);

    async function getCam() {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        })
        const videoTracks = stream.getVideoTracks()[0];
        setLocalVideoStream(videoTracks);
        const audioTracks = stream.getAudioTracks()[0];
        setLocalAudioStream(audioTracks)
        if (!videoRef.current || !videoRef)
            return;
        videoRef.current.srcObject = stream
    }

    useEffect(() => {
        getCam()
    }, []);
    if (!joined) {
        return (
            <div className=''>
                <video autoPlay ref={videoRef} width={250} height={250}></video>
                <input onChange={(e) => (setText(e.target.value))} placeholder='enter  your name:' className='border-2' />
                <button onClick={() => {
                    setJoined(true)
                }}>join</button>
            </div>
        )
    }

    return <Room userName={text} localVideoStream={localVideoStream} localAudioStream={localAudioStream}/>



}

export default Landing
