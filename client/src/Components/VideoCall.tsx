import { useEffect, useRef, useState } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import { RotateLoader } from "react-spinners";
import agoraApiHelper from "../utils/api/agoraApiHelper";
import type { IAgoraRTCClient, ICameraVideoTrack, IMicrophoneAudioTrack } from "agora-rtc-sdk-ng";

const APP_ID = import.meta.env.VITE_AGORA_APP_ID;

interface Props {
  channelName: string;
  uid: number;
  onEnd?: () => void;
}

export default function VideoCall({ channelName, uid, onEnd }: Props) {
  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const localVideoTrackRef = useRef<ICameraVideoTrack | null>(null);
  const localAudioTrackRef = useRef<IMicrophoneAudioTrack | null>(null);
  const localRef = useRef<HTMLDivElement>(null);
  const remoteRef = useRef<HTMLDivElement>(null);

  const [joined, setJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const joinCall = async () => {
      if (!APP_ID) {
        setError("Missing Agora APP_ID");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
        clientRef.current = client;

        const tokenRes = await agoraApiHelper.getAgoraToken(channelName, uid);
        if (!tokenRes?.token) throw new Error("Failed to fetch token");

        await client.join(APP_ID, channelName, tokenRes.token, uid);

        const videoTrack = await AgoraRTC.createCameraVideoTrack();
        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();

        localVideoTrackRef.current = videoTrack;
        localAudioTrackRef.current = audioTrack;

        if (localRef.current) {
          videoTrack.play(localRef.current);
        }

        await client.publish([videoTrack, audioTrack]);

        client.on("user-published", async (user, mediaType) => {
          await client.subscribe(user, mediaType);
          if (mediaType === "video" && remoteRef.current) {
            user.videoTrack?.play(remoteRef.current);
          }
          if (mediaType === "audio") {
            user.audioTrack?.play();
          }
        });

        client.on("user-unpublished", (user, mediaType) => {
          if (mediaType === "video" && remoteRef.current) {
            remoteRef.current.innerHTML = "";
          }
        });

        setJoined(true);
      } catch (err: any) {
        console.error("Join call error:", err);
        setError(err.message || "Failed to join call");
      } finally {
        setLoading(false);
      }
    };

    joinCall();

    return () => {
      const cleanup = async () => {
        try {
          await clientRef.current?.unpublish();
          await clientRef.current?.leave();
          clientRef.current?.removeAllListeners();
          localVideoTrackRef.current?.close();
          localAudioTrackRef.current?.close();

          if (localRef.current) localRef.current.innerHTML = "";
          if (remoteRef.current) remoteRef.current.innerHTML = "";
        } catch (err) {
          console.error("Cleanup error:", err);
        }
      };
      cleanup();
    };
  }, [channelName, uid]);

  const toggleMute = () => {
    if (localAudioTrackRef.current) {
      const enabled = !isMuted;
      localAudioTrackRef.current.setEnabled(enabled);
      setIsMuted(!enabled);
    }
  };

  const toggleCamera = () => {
    if (localVideoTrackRef.current) {
      const enabled = !isCameraOff;
      localVideoTrackRef.current.setEnabled(enabled);
      setIsCameraOff(!enabled);
    }
  };

  const switchCamera = async () => {
    const cameras = await AgoraRTC.getCameras();
    const currentTrack = localVideoTrackRef.current;
    const currentLabel = currentTrack?.getTrackLabel();

    const next = cameras.find((cam) => cam.label !== currentLabel);
    if (next && currentTrack) {
      await currentTrack.setDevice(next.deviceId);
    }
  };

  const handleEnd = () => {
    onEnd?.();
  };

  if (error) {
    return (
      <div className="text-white bg-red-600 p-4">
        <p>{error}</p>
        <button onClick={handleEnd} className="bg-black mt-2 px-4 py-2">Close</button>
      </div>
    );
  }

        if (loading) {
          return (
            <div className="flex items-center justify-center h-screen bg-black">
              <RotateLoader color="#ffffff" loading={loading} size={15} />
              <span className="ml-4 text-white">Joining call...</span>
            </div>
          );
        }

        if (error) {
          return (
            <div className="text-white bg-red-600 p-4">
              <p>{error}</p>
              <button onClick={handleEnd} className="bg-black mt-2 px-4 py-2">Close</button>
            </div>
          );
        }

 

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-6 bg-black text-white h-screen">
      <div className="flex gap-6">
        <div className="relative">
          <div ref={localRef} className="w-64 h-48 bg-gray-800 rounded" />
          <div className="absolute bottom-1 left-1 text-xs bg-black bg-opacity-50 px-2 py-1 rounded">You</div>
        </div>
        <div className="relative">
          <div ref={remoteRef} className="w-64 h-48 bg-gray-800 rounded" />
          <div className="absolute bottom-1 left-1 text-xs bg-black bg-opacity-50 px-2 py-1 rounded">Them</div>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={toggleMute}
          className={`px-4 py-2 rounded-full ${isMuted ? "bg-red-500" : "bg-gray-700"}`}
        >
          {isMuted ? "Unmute" : "Mute"}
        </button>
        <button
          onClick={toggleCamera}
          className={`px-4 py-2 rounded-full ${isCameraOff ? "bg-red-500" : "bg-gray-700"}`}
        >
          {isCameraOff ? "Camera On" : "Camera Off"}
        </button>
        <button onClick={switchCamera} className="bg-gray-600 px-4 py-2 rounded-full">
          Switch Camera
        </button>
        <button onClick={handleEnd} className="bg-red-600 px-6 py-2 rounded-full">
          End Call
        </button>
      </div>

      {joined && <p className="text-sm text-gray-300 mt-2">Channel: {channelName}</p>}
    </div>
  );
}