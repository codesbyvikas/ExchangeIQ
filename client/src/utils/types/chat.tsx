import type { Skill } from './skill';

export interface MessageType {
  sender: 'you' | 'them';       
  text: string;
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
