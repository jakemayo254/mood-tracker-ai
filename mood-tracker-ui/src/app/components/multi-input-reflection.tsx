'use client';

import React, { useRef, useState } from 'react';

export default function MultiInputReflection() {
    const videoRef = useRef(null);
    const videoRecorderRef = useRef(null);
    const audioRecorderRef = useRef(null);
    const [recordingVideo, setRecordingVideo] = useState(false);
    const [recordingAudio, setRecordingAudio] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [reflection, setReflection] = useState('');
    const [loading, setLoading] = useState(false);
    const [textInput, setTextInput] = useState('');
    const [selectedVideoName, setSelectedVideoName] = useState('');

    const scrollToBottom = () => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    };

    // VIDEO RECORDING
    const startVideoRecording = async () => {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        videoRef.current.srcObject = mediaStream;

        const recorder = new MediaRecorder(mediaStream);
        const chunks = [];

        recorder.ondataavailable = (event) => {
            if (event.data.size > 0) chunks.push(event.data);
        };

        recorder.onstop = async () => {
            const blob = new Blob(chunks, { type: 'video/webm' });
            await uploadVideoBlob(blob);
            mediaStream.getTracks().forEach(track => track.stop());
        };

        recorder.start();
        videoRecorderRef.current = recorder;
        setRecordingVideo(true);
    };

    const stopVideoRecording = () => {
        videoRecorderRef.current.stop();
        setRecordingVideo(false);
    };

    const uploadVideoBlob = async (blob) => {
        setLoading(true);
        const formData = new FormData();
        formData.append('video', blob, 'recording.webm');

        try {
            const response = await fetch('http://localhost:8000/transcribe_video', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            setTranscript(data.transcript);
            setReflection(data.reflection);
            scrollToBottom();
        } catch (error) {
            console.error('Upload failed:', error);
        } finally {
            setLoading(false);
        }
    };

    // AUDIO RECORDING
    const startAudioRecording = async () => {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });

        const recorder = new MediaRecorder(mediaStream);
        const chunks = [];

        recorder.ondataavailable = (event) => {
            if (event.data.size > 0) chunks.push(event.data);
        };

        recorder.onstop = async () => {
            const blob = new Blob(chunks, { type: 'audio/webm' });
            await uploadAudio(blob);
            mediaStream.getTracks().forEach(track => track.stop());
        };

        recorder.start();
        audioRecorderRef.current = recorder;
        setRecordingAudio(true);
    };

    const stopAudioRecording = () => {
        audioRecorderRef.current.stop();
        setRecordingAudio(false);
    };

    const uploadAudio = async (blob) => {
        setLoading(true);
        const formData = new FormData();
        formData.append('audio', blob, 'recording.webm');

        try {
            const response = await fetch('http://localhost:8000/transcribe_audio', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            setTranscript(data.transcript);
            setReflection(data.reflection);
            scrollToBottom();
        } catch (error) {
            console.error('Upload failed:', error);
        } finally {
            setLoading(false);
        }
    };

    // VIDEO UPLOAD
    const uploadVideoFile = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        setSelectedVideoName(file.name);

        setLoading(true);
        const formData = new FormData();
        formData.append('video', file);

        try {
            const response = await fetch('http://localhost:8000/transcribe_video', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            setTranscript(data.transcript);
            setReflection(data.reflection);
            scrollToBottom();
        } catch (error) {
            console.error('Upload failed:', error);
        } finally {
            setLoading(false);
        }
    };

    // TEXT SUBMIT
    const submitText = async () => {
        setLoading(true);

        try {
            const response = await fetch('http://localhost:8000/submit_text', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text: textInput })
            });

            const data = await response.json();
            setTranscript(textInput);
            setReflection(data.reflection);
            scrollToBottom();
        } catch (error) {
            console.error('Text submission failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 space-y-6 max-w-xl mx-auto pb-24">
            <h1 className="text-2xl font-bold mb-4">📥 Submit Your Mood Entry</h1>

            {/* Upload a video file */}
            <div>
                <h2 className="text-lg font-semibold mb-2">📂 Upload a Video File</h2>
                <input type="file" accept="video/*" onChange={uploadVideoFile} />
                {selectedVideoName && (
                    <p className="text-sm text-gray-400 mt-1">Selected file: {selectedVideoName}</p>
                )}
            </div>

            {/* Record a video */}
            <div>
                <h2 className="text-lg font-semibold mb-2">📸 Record a Video</h2>
                <video ref={videoRef} autoPlay muted className="w-full border rounded mb-2" />
                {!recordingVideo ? (
                    <button onClick={startVideoRecording} className="bg-purple-600 text-white px-4 py-2 rounded">
                        Start Video Recording
                    </button>
                ) : (
                    <button onClick={stopVideoRecording} className="bg-red-600 text-white px-4 py-2 rounded">
                        Stop & Upload
                    </button>
                )}
            </div>

            {/* Record audio */}
            <div>
                <h2 className="text-lg font-semibold mb-2">🎙️ Record Audio</h2>
                {!recordingAudio ? (
                    <button onClick={startAudioRecording} className="bg-blue-600 text-white px-4 py-2 rounded">
                        Start Audio Recording
                    </button>
                ) : (
                    <button onClick={stopAudioRecording} className="bg-red-600 text-white px-4 py-2 rounded">
                        Stop & Upload
                    </button>
                )}
            </div>

            {/* Submit text */}
            <div>
                <h2 className="text-lg font-semibold mb-2">📝 Type Your Thoughts</h2>
                <textarea
                    rows="4"
                    className="w-full p-2 border rounded"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                />
                <button onClick={submitText} className="mt-2 bg-green-600 text-white px-4 py-2 rounded">
                    Submit Text
                </button>
            </div>

            {/* Feedback */}
            <div className="min-h-[200px] mt-6">
                {loading && <p className="text-gray-600">⏳ Processing...</p>}

                <div>
                    <h2 className="text-lg font-semibold">📝 Transcript</h2>
                    <p className="whitespace-pre-wrap">{transcript || "No transcript yet."}</p>
                </div>

                <div className="mt-4">
                    <h2 className="text-lg font-semibold">🤖 Reflection</h2>
                    <p className="whitespace-pre-wrap">{reflection || "No reflection yet."}</p>
                </div>
            </div>
        </div>
    );
}
