'use client';

import { useEffect, useRef, useState } from 'react';

export default function EmotionCaptureWebsocket() {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const ws = useRef<WebSocket | null>(null);
    const [emotion, setEmotion] = useState<string | null>(null);

    useEffect(() => {
        // Open WebSocket
        ws.current = new WebSocket('ws://localhost:8000/ws/emotion'); // match your backend
        ws.current.onmessage = (msg) => {
            const data = JSON.parse(msg.data);
            setEmotion(data?.dominant_emotion || 'Unknown');
        };

        return () => {
            ws.current?.close();
        };
    }, []);

    useEffect(() => {
        // Start webcam
        navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }

            const interval = setInterval(() => {
                captureAndSendFrame();
            }, 1000); // every second

            return () => clearInterval(interval);
        });
    }, []);

    const captureAndSendFrame = async () => {
        if (!videoRef.current || !ws.current || ws.current.readyState !== WebSocket.OPEN) return;

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

        const arrayBuffer = await blob.arrayBuffer();
        ws.current.send(arrayBuffer); // send raw bytes
    };

    return (
        <div className="space-y-4 p-4">
            <video ref={videoRef} autoPlay muted className="border rounded w-full max-w-md" />
            {emotion && <p className="text-lg font-bold">You look: {emotion}</p>}
        </div>
    );
}
