import type { Skill } from './skill';
import type { UserType } from './user';

export interface MessageType {
  id?: string; // for rendering optimization
  sender: 'you' | 'them';
  text?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'audio' | 'document';
  publicId?: string;
  timestamp: string;         // "10:30 PM"
  fullTimestamp?: string;    // ISO string
  isRead: boolean;
}

export interface ChatType {
  id: string;
  participants: UserType[];      // required for find() logic
  name: string;                  // other user's name
  photo: string;                 // other user's photo
  skill: string;                 // e.g., "Learn: React"
  messages: MessageType[];
  lastMessage?: string;
  chatType: 'exchange' | 'learn' | 'teach';
  skillInvolved: Skill;
  unreadCount?: number;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalMessages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
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
