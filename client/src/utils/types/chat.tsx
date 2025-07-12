import type { Skill } from './skill';

export interface MessageType {
  sender: 'you' | 'them';
  text?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'audio' | 'document';
  timestamp: string;
  isRead: boolean;
}

export interface ChatType {
  id: string;
  name: string;
  photo: string;
  skill: string;
  messages: MessageType[];
  lastMessage?: string;
  chatType: 'exchange' | 'learn' | 'teach';
  skillInvolved: Skill;
}

export interface UploadMediaResponse {
  url: string;
  publicId: string;
  mediaType: 'image' | 'video' | 'audio' | 'document';
  originalName: string;
  size: number;
  duration?: number;
  width?: number;
  height?: number;
  format?: string;
}