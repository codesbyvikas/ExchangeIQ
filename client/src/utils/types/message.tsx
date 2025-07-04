// src/utils/types/message.ts
export type MessageType = {
  _id: string;
  sender: string;
  receiver: string;
  text: string;
  media?: string;
  createdAt: string;
  invitationId?: string;
  invitationType?: 'learn' | 'teach' | 'exchange';
  skillOffered?: string;
  skillRequested?: string;
};

export type ChatUserType = {
  _id: string;
  name: string;
  teachSkills?: string[];
  learnSkills?: string[];
};
