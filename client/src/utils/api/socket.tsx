import { io, Socket } from 'socket.io-client';

// Define the structure of a chat message
type ChatMessage = {
  id: string;
  text?: string;
  sender: 'you' | 'them';
  timestamp: string;
  mediaUrl?: string;
  mediaType?: string;
  publicId?: string;
  isRead: boolean;
};

// Define the payload sent when emitting a message
type MessagePayload = {
  roomId: string;
  message: ChatMessage;
};

// WebRTC signaling types
type CallPayload = {
  userToCall: string;
  signalData: any;
  from: string;
};

type AnswerPayload = {
  to: string;
  signal: any;
};

type EndCallPayload = {
  to: string;
};

class SocketService {
  private socket: Socket | null = null;
  public isConnected: boolean = false;

  connect(): Socket {
    if (!this.socket) {
      this.socket = io('http://localhost:3000', {
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        timeout: 20000,
        forceNew: true,
      });

      this.socket.on('connect', () => {
        console.log('📡 Socket connected:', this.socket?.id);
        this.isConnected = true;
      });

      this.socket.on('disconnect', () => {
        console.log('❌ Socket disconnected');
        this.isConnected = false;
      });

      this.socket.on('connect_error', (error: Error) => {
        console.error('Socket connection error:', error);
      });
    }

    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  joinRoom(roomId: string): void {
    this.socket?.emit('joinRoom', roomId);
  }

  // ✅ Updated to support full message object
  sendMessage(roomId: string, message: ChatMessage): void {
    const payload: MessagePayload = { roomId, message };
    this.socket?.emit('chatMessage', payload);
  }

  onMessage(callback: (message: ChatMessage) => void): void {
    this.socket?.on('chatMessage', callback);
  }

  offMessage(): void {
    this.socket?.off('chatMessage');
  }

  // ✅ CALLING METHODS (WebRTC Signaling)
  callUser(userToCall: string, signalData: any, from: string): void {
    const payload: CallPayload = { userToCall, signalData, from };
    this.socket?.emit('callUser', payload);
  }

  answerCall(to: string, signal: any): void {
    const payload: AnswerPayload = { to, signal };
    this.socket?.emit('answerCall', payload);
  }

  endCall(to: string): void {
    const payload: EndCallPayload = { to };
    this.socket?.emit('endCall', payload);
  }

  onCallIncoming(callback: (data: any) => void): void {
    this.socket?.on('callIncoming', callback);
  }

  onCallAccepted(callback: (data: any) => void): void {
    this.socket?.on('callAccepted', callback);
  }

  onCallEnded(callback: (data: any) => void): void {
    this.socket?.on('callEnded', callback);
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

export default new SocketService();
