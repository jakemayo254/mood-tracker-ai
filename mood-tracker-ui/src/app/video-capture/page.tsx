'use client';

import { useEffect, useRef, useState } from 'react';

export default function VideoRecorder() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [chunks, setChunks] = useState<Blob[]>([]);

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then((stream) => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }

                const recorder = new MediaRecorder(stream);

                recorder.ondataavailable = (event) => {
                    setChunks((prev) => [...prev, event.data]);
                };

                recorder.onstop = () => {
                    const blob = new Blob(chunks, { type: 'video/webm' });
                    const url = URL.createObjectURL(blob);

                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'mood-entry.webm';
                    a.click();

                    URL.revokeObjectURL(url);

                    console.log("Stop Recording!!!")
                };

                setMediaRecorder(recorder);
            })
            .catch((err) => {
                console.error('Error accessing webcam:', err);
            });
    }, [chunks]);

    const startRecording = () => {
        console.log('startRecording');
        setChunks([]);
        mediaRecorder?.start();
    };

    const stopRecording = () => {
        console.log('stopRecording');
        mediaRecorder?.stop();
    };

    return (
        <div>
            <video
                ref={videoRef}
                autoPlay
                muted
                className="w-1/4 h-auto rounded shadow-lg"
            />
            <div className="mt-4 flex gap-4">
                <button onClick={startRecording}>Start</button>
                <button onClick={stopRecording}>Stop</button>
            </div>
        </div>
    );
}
