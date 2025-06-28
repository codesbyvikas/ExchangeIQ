// utils/types/Skill.ts
export interface Skill {
  _id?: string; // MongoDB adds this automatically
  name: string;
  tags: string[];
  iconUrl: string;
}
