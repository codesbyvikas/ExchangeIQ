export interface UserType {
  _id: string;
  name: string;
  email: string;
  photo?: string;
  profession: string;
  skillsToTeach: string[];
  skillsToLearn: string[];
  createdAt: string;
}