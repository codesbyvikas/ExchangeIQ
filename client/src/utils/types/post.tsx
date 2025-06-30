export interface PostType {
  _id: string;
  fromUser: {
    _id: string;
    name: string;
    photo?: string; 
  };
  learnSkill: {
    _id: string;
    name: string;
    iconUrl?: string; 
  };
  createdAt: string;
  updatedAt: string;
}
