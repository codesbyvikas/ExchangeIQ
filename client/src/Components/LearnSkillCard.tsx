import React from 'react';
import Avatar from '../assets/Avatar.png';
import { Link } from 'react-router-dom';
import type { JSX } from 'react';

export interface Skill {
  _id: string;
  name: string;
  tags: string[];
  iconUrl: string;
  icon?: JSX.Element;
}

export interface User {
  _id: string;
  name: string;
  photo?: string;
}

const LearnSkillCard: React.FC<{ skill: Skill; user: User }> = ({ skill, user }) => {
  return (
    <div className="relative w-40 min-w-80 p-6 bg-white flex flex-col gap-4 rounded-2xl shadow-lg transition-transform cursor-pointer hover:-translate-y-2">
      <div className="flex flex-row items-center gap-2">
        <Link to={`/profile/${user._id}`}>
          <img className="w-10 h-10 rounded-full" src={user.photo || Avatar} alt="Avatar" />
        </Link>
        <h4 className="text-xl font-bold">{user.name}</h4>
      </div>
      <div className="flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-[#e0f2ff] flex items-center justify-center mb-2">
          <img src={skill.iconUrl} alt="Skill Icon" className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">{skill.name}</h2>
        <div className="flex flex-wrap gap-2 mb-8"></div>
        <button className="w-40 p-2 absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#3178C6] text-white rounded-lg font-semibold shadow hover:bg-[#225a8c] transition cursor-pointer">
          Send Invite
        </button>
      </div>
    </div>
  );
};

export default LearnSkillCard;
