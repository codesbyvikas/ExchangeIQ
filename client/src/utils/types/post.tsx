export interface PostType {
  _id: string;
  fromUser: {
    _id: string;
    name: string;
    photo?: string; // Optional user avatar
  };
  learnSkill: {
    _id: string;
    name: string;
    iconUrl?: string; // Optional skill icon (add this for frontend)
  };
  createdAt: string;
  updatedAt: string;
}
