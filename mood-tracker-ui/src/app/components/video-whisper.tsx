'use client';

import React, { useRef, useState } from 'react';

export default function VideoWhisper() {
    const videoRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const [recording, setRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [reflection, setReflection] = useState('');
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
            mediaStream.getTracks().forEach(track => track.stop());
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

        try {
            const response = await fetch('http://localhost:8000/transcribe', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            setTranscript(data.transcript);
            setReflection(data.reflection);
        } catch (error) {
            console.error("Upload failed:", error);
            setTranscript("❌ Failed to transcribe.");
            setReflection("❌ No reflection available.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 space-y-6">
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

            {loading && <p className="text-gray-600">⏳ Transcribing and reflecting...</p>}

            {transcript && (
                <div>
                    <h2 className="text-lg font-semibold">📝 Transcript</h2>
                    <p className="whitespace-pre-wrap">{transcript}</p>
                </div>
            )}

            {reflection && (
                <div>
                    <h2 className="text-lg font-semibold">🤖 Reflection</h2>
                    <p className="whitespace-pre-wrap">{reflection}</p>
                </div>
            )}
        </div>
    );
}
