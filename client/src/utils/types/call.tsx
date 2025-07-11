// src/utils/types/ccall.ts

export type CallType = 'video' | 'audio';

export interface IncomingCall {
  from: string;                // caller user ID
  fromUser: {
    _id: string;
    name: string;
    email?: string;
    avatar?: string;
  };
  callType: CallType;
  offer: RTCSessionDescriptionInit;
}

export interface OutgoingCallPayload {
  to: string;
  callType: CallType;
  offer: RTCSessionDescriptionInit;
}

export interface AcceptCallPayload {
  to: string;
  answer: RTCSessionDescriptionInit;
}

export interface RejectCallPayload {
  to: string;
}

export interface EndCallPayload {
  to: string;
}

export interface WebRTCSignalPayload {
  to: string;
  signal: any;
}

export interface IceCandidatePayload {
  to: string;
  candidate: RTCIceCandidate;
}

export type CallStatusType = 'connecting' | 'connected' | 'reconnecting' | 'ended';

export interface CallStatusPayload {
  to: string;
  status: CallStatusType;
}

export type MediaToggleType = 'audio' | 'video';

export interface ToggleMediaPayload {
  to: string;
  type: MediaToggleType;
  enabled: boolean;
}

export interface ScreenSharePayload {
  to: string;
  sharing: boolean;
}
