import { Socket } from "socket.io-client";

export const handleICECandidateEvent = (
    event: RTCPeerConnectionIceEvent,
    socket: Socket,
    sender: string,
    roomId:string
) => {
    if (event.candidate) {
        socket.emit("add-ice-candidate", {
            candidate: event.candidate,
            roomId,
            type: sender
        })
    }
}


export const handleTrackEvent = (
    remoteStream: React.RefObject<MediaStream>,
    videoRef: React.RefObject<HTMLVideoElement | null>,
    event: RTCTrackEvent
) => {
    if (!remoteStream.current.getTracks().some(t => t.id === event.track.id)) {
        remoteStream.current.addTrack(event.track);
    }
    if (videoRef.current) {
        videoRef.current.srcObject = remoteStream.current;
        videoRef.current.play().catch(e => console.error("Play failed:", e));
    }
}


export const handleLocalVideoStream = (
    pc: RTCPeerConnection,
    audioTrack: MediaStreamTrack,
    videoTrack: MediaStreamTrack
) => {
    pc.addTrack(audioTrack);
    pc.addTrack(videoTrack);
}
export const handleNegotiationNeededEvent = () => {

}