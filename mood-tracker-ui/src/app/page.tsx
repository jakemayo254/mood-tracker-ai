import Image from "next/image";
import AudioCapture from "@/app/components/audio-capture";
import AudioCapture2 from "@/app/components/audio-capture-2";
import VideoCapture from "@/app/components/video-capture";
import VideoCapture2 from "@/app/components/video-capture-2";
import EmotionCapture from "@/app/components/emotion-capture";
import EmotionCaptureWebsocket from "@/app/components/emotion-capture-websocket";
import VideoWhisper from "@/app/components/video-whisper";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      {/*<AudioCapture />*/}
      {/*<AudioCapture2 />*/}
      {/*<VideoCapture />*/}
      {/*<VideoCapture2 />*/}
      {/*<EmotionCapture />*/}
      {/*<EmotionCaptureWebsocket/>*/}
        <VideoWhisper />
    </div>
  );
}
