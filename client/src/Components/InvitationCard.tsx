import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useState } from 'react';
import Avatar from '../assets/Avatar.png';
import type { InvitationType } from '../utils/types/invitation';

interface Props {
  invitation: InvitationType;
  onStatusChange: (id: string, status: 'accepted' | 'declined') => void;
}

const InvitationCard = ({ invitation, onStatusChange }: Props) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const date = new Date(invitation.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const skill =
    invitation.reqType === 'learn'
      ? invitation.skillRequested
      : invitation.skillOffered;

  const handleClick = async (status: 'accepted' | 'declined') => {
    setIsProcessing(true);
    await onStatusChange(invitation._id, status);
    setIsProcessing(false);
  };

  return (
    <div className="relative w-auto p-4 bg-white flex flex-row justify-center items-center gap-4 rounded-2xl shadow-lg transition-transform cursor-pointer hover:-translate-y-2">
      <span className="absolute top-2 right-3 text-gray-400 text-xs">{date}</span>

      <div className="flex flex-col items-center justify-center">
        <Link to={`/profile/${invitation.fromUser._id}`}>
          <img className="rounded-full w-16 h-16" src={invitation.fromUser.photo || Avatar} alt="Avatar" />
        </Link>
        <h4 className="font-bold text-sm text-center whitespace-nowrap overflow-hidden text-ellipsis max-w-[80px]">
          {invitation.fromUser.name}
        </h4>
        <h4 className="font-semibold text-xs">Student</h4>
      </div>

      {/* Skill Info */}
      {skill && (
        <div className="flex flex-col items-center justify-center">
          <img className="h-16 w-auto" src={skill.iconUrl} alt={skill.name} />
          <span className="bg-[#f0f4f8] text-xs font-semibold text-[#3178C6] px-2 py-1 rounded whitespace-nowrap overflow-hidden text-ellipsis max-w-[100px]">
            {skill.name}
          </span>
        </div>
      )}

      {/* Buttons */}
      <div className="flex flex-col gap-2 w-[110px]">
        <button onClick={() => handleClick('accepted')} disabled={isProcessing}>
          <div className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-full shadow-sm transition">
            <FaCheckCircle className="text-white text-base" />
            <span>Accept</span>
          </div>
        </button>
        <button onClick={() => handleClick('declined')} disabled={isProcessing}>
          <div className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-full shadow-sm transition">
            <FaTimesCircle className="text-white text-base" />
            <span>Decline</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default InvitationCard;
