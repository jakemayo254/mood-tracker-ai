'use client';

import React, { useRef, useState } from 'react';

export default function VideoWhisper() {
    const videoRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const [recording, setRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [loading, setLoading] = useState(false);
    const [stream, setStream] = useState(null);

    const startRecording = async () => {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(mediaStream);
        videoRef.current.srcObject = mediaStream;

        const recorder = new MediaRecorder(mediaStream);
        const chunks = [];

        recorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                chunks.push(event.data);
            }
        };

        recorder.onstop = async () => {
            const blob = new Blob(chunks, { type: 'video/webm' });
            await uploadVideo(blob);
            mediaStream.getTracks().forEach(track => track.stop()); // stop camera & mic
        };

        recorder.start();
        mediaRecorderRef.current = recorder;
        setRecording(true);
    };

    const stopRecording = () => {
        mediaRecorderRef.current.stop();
        setRecording(false);
    };

    const uploadVideo = async (blob) => {
        setLoading(true);
        const formData = new FormData();
        formData.append('video', blob, 'recording.webm');

        const response = await fetch('http://localhost:8000/transcribe', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        setTranscript(data.transcript);
        setLoading(false);
    };

    return (
        <div className="p-4 space-y-4">
            <video ref={videoRef} autoPlay muted className="w-full max-w-md border rounded" />

            {!recording ? (
                <button onClick={startRecording} className="bg-blue-600 text-white px-4 py-2 rounded">
                    Start Recording
                </button>
            ) : (
                <button onClick={stopRecording} className="bg-red-600 text-white px-4 py-2 rounded">
                    Stop & Upload
                </button>
            )}

            {loading ? (
                <p className="text-gray-600">Transcribing...</p>
            ) : (
                transcript && <p className="whitespace-pre-wrap text-lg font-medium">📝 {transcript}</p>
            )}
        </div>
    );
}
