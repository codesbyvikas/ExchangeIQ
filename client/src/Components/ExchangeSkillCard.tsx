import React from 'react';
import Avatar from '../assets/Avatar.png';
import { Link } from 'react-router-dom';
import type { JSX } from 'react';
import invitationApiHelper from '../utils/api/invitationApiHelper';

export interface Skill {
  name: string;
  icon: JSX.Element;
  tags: string[];
  _id: string;
  iconUrl?: string;
}

export interface User {
  _id: string;
  name: string;
  photo?: string;
}

interface ExchangeCardProps {
  skill: Skill;         
  exchangeFor: Skill;   
  user: User;
}



const ExchangeSkillCard: React.FC<ExchangeCardProps> = ({ skill, exchangeFor, user }) => {

  const sendRequest = async () =>{
    try{
      await invitationApiHelper.sendInvitation({
        toUser: user._id,
        reqType:"exchange",
        skillOffered: exchangeFor._id,
        skillRequested: skill._id,
        
      });
      console.log("sent");
    }catch (error) {
      console.log("error", error)
    }
  }
  return (
    <div className='relative w-40 min-w-80 p-3 bg-white flex flex-col gap-4 rounded-2xl shadow-lg transition-transform cursor-pointer hover:-translate-y-2'>
      <div className='flex flex-row items-center gap-2'>
        <Link to={`/profile/${user._id}`}>
          <img className='w-10 h-10 rounded-full' src={user.photo || Avatar} alt="Avatar" />
        </Link>
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
          onClick={sendRequest}
          className='w-40 p-2 absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#3178C6] text-white rounded-lg font-semibold shadow hover:bg-[#225a8c] transition cursor-pointer'>
          Request Exchange
        </button>
      </div>
    </div>
  );
};

export default ExchangeSkillCard;
