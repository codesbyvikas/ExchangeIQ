import React from 'react'
import type { JSX } from 'react';
import Avatar from '../assets/Avatar.png'
import { Link } from 'react-router-dom';

// Skill type with icon as JSX.Element
export interface Skill {
  name: string;
  icon: JSX.Element;
  tags: string[];
}

export interface UserData{
    name:string;
    skill:Skill;
    avatar:string;
    exchange:string;
}

// const ExchangeSkillCard: React.FC<UserData> = ({ name, skill,avatar }) => {
// }

const LearnSkillCard: React.FC<{ skill: Skill }> = ({ skill }) => {
  return (
    <div className='relative w-40 min-w-80  p-6 bg-white flex flex-col  gap-4 rounded-2xl shadow-lg transition-transform cursor-pointer hover:-translate-y-2'>
       <div className='flex flex-row items-center gap-2'>
         <Link to="/profile">
          <img className='w-10' src={Avatar} alt="Avatar" />
        </Link>
        <h4 className='flex flex-end text-xl font-bold'>Vikas kewat</h4>
        </div> 
        <div className='flex flex-col items-center justify-center '>
            <div className='flex items-center  justify-center w-16 h-16 rounded-full bg-[#e0f2ff] text-5xl mb-2'>
        {skill.icon}
      </div>
      <h2 className='text-2xl font-semibold text-gray-800 mb-2'>{skill.name}</h2>
      <div className='flex flex-wrap gap-2 mb-8'>
      </div>
      <button className='w-40 p-2 absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#3178C6] text-white rounded-lg font-semibold shadow hover:bg-[#225a8c] transition cursor-pointer'>
        Send Invite
      </button>
        </div>
    </div>
  )
}

export default LearnSkillCard;


