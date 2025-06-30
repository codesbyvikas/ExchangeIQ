export interface UserMini {
  _id: string;
  name: string;
  photo?: string;
}

export interface SkillMini {
  _id: string;
  name: string;
  iconUrl?: string;
}

export type RequestType = 'exchange' | 'learn' | 'teach';
export type InvitationStatus = 'pending' | 'accepted' | 'declined';

export interface InvitationType {
  _id: string;
  fromUser: UserMini;
  toUser: UserMini;
  reqType: RequestType;
  skillOffered?: SkillMini;
  skillRequested?: SkillMini;
  status: InvitationStatus;
  createdAt: string;
}

export interface SendInvitationPayload {
  toUser: string;
  reqType: RequestType;
  skillOffered?: string;
  skillRequested?: string;
}
