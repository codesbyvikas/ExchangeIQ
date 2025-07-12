import Peer from 'simple-peer';

/**
 * Request user media (camera + mic)
 */
export const getMediaStream = async (
  constraints: MediaStreamConstraints = { video: true, audio: true }
): Promise<MediaStream> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    console.log('Media stream acquired:', stream);
    return stream;
  } catch (error) {
    console.error('Error accessing media devices:', error);
    throw error;
  }
};

/**
 * Request screen capture stream
 */
export const getScreenStream = async (): Promise<MediaStream> => {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true
    });
    console.log('Screen stream acquired:', stream);
    return stream;
  } catch (error) {
    console.error('Error accessing screen capture:', error);
    throw error;
  }
};

/**
 * Create a WebRTC peer connection
 */
export const createPeer = (
  initiator: boolean,
  stream: MediaStream,
  onSignal: (data: Peer.SignalData) => void,
  onStream: (stream: MediaStream) => void,
  onError?: (error: Error) => void
): Peer.Instance => {
  // Validate arguments
  if (!stream || typeof onSignal !== 'function' || typeof onStream !== 'function') {
    throw new Error('Invalid arguments passed to createPeer');
  }

  console.log('Creating peer connection', { initiator, stream });

  try {
    const peer = new Peer({
      initiator,
      trickle: false,
      stream,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      }
    });

    peer.on('signal', onSignal);
    peer.on('stream', onStream);
    peer.on('error', onError || ((err: Error) => console.error('Peer error:', err)));

    return peer;
  } catch (error) {
    console.error('Error creating peer instance:', error);
    throw error;
  }
};

/**
 * Stop all tracks in the media stream
 */
export const stopMediaStream = (stream: MediaStream | null): void => {
  if (stream) {
    stream.getTracks().forEach(track => {
      try {
        track.stop();
      } catch (e) {
        console.warn('Error stopping track:', e);
      }
    });
    console.log('Media stream stopped');
  }
};

/**
 * Toggle audio stream on/off
 */
export const toggleAudio = (stream: MediaStream | null, enabled: boolean): void => {
  if (stream) {
    stream.getAudioTracks().forEach(track => {
      track.enabled = enabled;
    });
    console.log('Audio tracks toggled to', enabled);
  }
};

/**
 * Toggle video stream on/off
 */
export const toggleVideo = (stream: MediaStream | null, enabled: boolean): void => {
  if (stream) {
    stream.getVideoTracks().forEach(track => {
      track.enabled = enabled;
    });
    console.log('Video tracks toggled to', enabled);
  }
};
