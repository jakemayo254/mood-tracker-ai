'use client';

import { useRef, useState } from 'react';

export default function AudioCapture2() {
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const [recording, setRecording] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const audioChunks = useRef<Blob[]>([]);

    const startRecording = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = (event) => {
            audioChunks.current.push(event.data);
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(audioChunks.current, { type: 'audio/webm' });
            const url = URL.createObjectURL(blob);
            setAudioUrl(url);
            audioChunks.current = []; // Reset
        };

        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start();
        setRecording(true);
    };

    const stopRecording = () => {
        mediaRecorderRef.current?.stop();
        setRecording(false);
    };

    return (
        <div className="p-4 space-y-4">
            <button
                onClick={recording ? stopRecording : startRecording}
                className="px-4 py-2 bg-blue-500 text-white rounded"
            >
                {recording ? 'Stop Recording' : 'Start Recording'}
            </button>

            {audioUrl && (
                <div className="space-y-2">
                    <audio controls src={audioUrl} />
                    <a
                        href={audioUrl}
                        download="recording.webm"
                        className="text-blue-600 underline"
                    >
                        Download Audio
                    </a>
                </div>
            )}
        </div>
    );
}
