'use client';

import { useEffect, useRef, useState } from 'react';

export default function EmotionCapture() {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [emotionData, setEmotionData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    // Start webcam stream
    useEffect(() => {
        const getMedia = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error('Error accessing webcam:', err);
                setError('Could not access webcam');
            }
        };

        getMedia();
    }, []);

    // Capture frame every 3 seconds and send to backend
    useEffect(() => {
        const interval = setInterval(() => {
            captureAndSendFrame();
        }, 3000); // every 3 seconds

        return () => clearInterval(interval);
    }, []);

    const captureAndSendFrame = async () => {
        if (!videoRef.current) return;

        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        const blob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob((b) => resolve(b), 'image/jpeg')
        );

        if (!blob) return;

        const formData = new FormData();
        formData.append('frame', blob, 'frame.jpg');

        try {
            const res = await fetch('http://localhost:5000/analyze', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) throw new Error('Server error');

            const data = await res.json();
            setEmotionData(data);
            setError(null);
        } catch (err) {
            console.error(err);
            setError('Failed to analyze frame');
        }
    };

    return (
        <div className="p-4 space-y-4">
            <h2 className="text-xl font-bold">Webcam Emotion Analyzer</h2>

            <video ref={videoRef} autoPlay muted className="border w-full max-w-md rounded" />

            {error && <p className="text-red-600">{error}</p>}

            {emotionData && (
                <div className="bg-gray-100 p-4 rounded">
                    <h3 className="font-semibold mb-2">Detected Emotion</h3>
                    <pre className="text-sm">{JSON.stringify(emotionData, null, 2)}</pre>
                </div>
            )}
        </div>
    );
}
