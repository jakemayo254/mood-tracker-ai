'use client';

import { useRef, useState, useEffect } from 'react';

export default function VideoCapture2() {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const chunks = useRef<Blob[]>([]);
    const [recording, setRecording] = useState(false);
    const [videoURL, setVideoURL] = useState<string | null>(null);

    const startRecording = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
        });

        streamRef.current = stream;

        if (videoRef.current) {
            videoRef.current.srcObject = stream;
        }

        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = (e) => {
            chunks.current.push(e.data);
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(chunks.current, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            setVideoURL(url);
            chunks.current = [];
        };

        mediaRecorder.start();
        mediaRecorderRef.current = mediaRecorder;
        setRecording(true);
    };

    const stopRecording = () => {
        mediaRecorderRef.current?.stop();
        streamRef.current?.getTracks().forEach((track) => track.stop());
        setRecording(false);
    };

    useEffect(() => {
        return () => {
            // Cleanup on unmount
            streamRef.current?.getTracks().forEach((track) => track.stop());
        };
    }, []);

    return (
        <div className="p-4 space-y-4">
            <video
                ref={videoRef}
                autoPlay
                muted
                className="w-full max-w-md border rounded"
            />

            <div>
                <button
                    onClick={recording ? stopRecording : startRecording}
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                    {recording ? 'Stop Recording' : 'Start Recording'}
                </button>
            </div>

            {videoURL && (
                <div className="space-y-2">
                    <video src={videoURL} controls className="w-full max-w-md" />
                    <a
                        href={videoURL}
                        download="recording.webm"
                        className="text-blue-600 underline"
                    >
                        Download Video
                    </a>
                </div>
            )}
        </div>
    );
}
