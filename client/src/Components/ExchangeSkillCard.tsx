import React from 'react';
import {  useNavigate } from 'react-router-dom';
import Avatar from '../assets/Avatar.png';
import { ClipLoader } from 'react-spinners';
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

interface Props {
  skill: Skill;
  exchangeFor: Skill;
  user: User;
  onSendInvite: (
    toUserId: string,
    reqType: 'exchange',
    skillOfferedId?: string,
    skillRequestedId?: string
  ) => void;
  isLoading?: boolean;
}

const ExchangeSkillCard: React.FC<Props> = ({
  skill,
  exchangeFor,
  user,
  onSendInvite,
  isLoading
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    onSendInvite(user._id, 'exchange', exchangeFor._id, skill._id);
  };

  return (
    <div className='relative w-40 min-w-80 p-3 bg-white flex flex-col gap-4 rounded-2xl shadow-lg transition-transform cursor-pointer hover:-translate-y-2'>
      <div onClick={() => navigate(`/profile/${user._id}`)} className='flex flex-row items-center gap-2'>
        <img className='w-10 h-10 rounded-full' src={user.photo || Avatar} alt='Avatar' />
        <h4 className='text-lg font-semibold'>{user.name}</h4>
      </div>

      <div className='flex flex-col items-center justify-center'>
        <div className='flex items-center justify-center w-16 h-16 rounded-full bg-[#e0f2ff] text-5xl mb-2'>
          {skill.icon}
        </div>
        <h2 className='text-xl font-semibold text-gray-800 mb-2'>{skill.name}</h2>
        <div className='flex flex-wrap gap-2 mb-14'>
          <h4>Exchange for:</h4>
          <span className='bg-[#f0f4f8] font-semibold text-[#3178C6] px-2 py-1 rounded'>
            {exchangeFor.name}
          </span>
        </div>
        <button
          onClick={handleClick}
          disabled={isLoading}
          className='w-40 p-2 absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#3178C6] text-white rounded-lg font-semibold shadow hover:bg-[#225a8c] transition cursor-pointer disabled:opacity-60'>
          {isLoading ? <ClipLoader size={20} color='white' /> : 'Request Exchange'}
        </button>
      </div>
    </div>
  );
};

export default ExchangeSkillCard;