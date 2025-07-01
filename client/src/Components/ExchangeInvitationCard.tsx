import { Link } from 'react-router-dom';
import Avatar from '../assets/Avatar.png';
import { FaExchangeAlt, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import type { InvitationType } from '../utils/types/invitation';

interface Props {
  invitation: InvitationType;
}

const ExchangeInvitationCard = ({ invitation }: Props) => {
  const date = new Date(invitation.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const { fromUser, skillOffered, skillRequested } = invitation;

  return (
    <div className="relative w-auto p-4 bg-white flex flex-row justify-center items-center gap-4 rounded-2xl shadow-lg transition-transform cursor-pointer hover:-translate-y-2">
      <span className="absolute top-2 right-3 text-gray-400 text-xs">{date}</span>

      {/* Sender */}
      <div className="flex flex-col items-center justify-center">
        <Link to={`/profile/${fromUser._id}`}>
          <img className="w-16 h-16 rounded-full" src={fromUser.photo || Avatar} alt="Avatar" />
        </Link>
        <h4 className="font-bold text-sm">{fromUser.name}</h4>
        <h4 className="font-semibold text-xs">Student</h4>
      </div>

      {/* Skill Offered */}
      {skillOffered && (
        <div className="flex flex-col items-center justify-center">
          <img className="h-16 w-auto" src={skillOffered.iconUrl} alt={skillOffered.name} />
          <span className="bg-[#f0f4f8] text-sm font-semibold text-[#3178C6] px-2 py-1 rounded">
            {skillOffered.name}
          </span>
        </div>
      )}

      <FaExchangeAlt size={80} color="blue" />

      {/* Skill Requested */}
      {skillRequested && (
        <div className="flex flex-col items-center justify-center">
          <img className="h-16 w-auto" src={skillRequested.iconUrl} alt={skillRequested.name} />
          <span className="bg-[#f0f4f8] text-sm font-semibold text-[#3178C6] px-2 py-1 rounded">
            {skillRequested.name}
          </span>
        </div>
      )}

      {/* Buttons */}
      <div className="flex flex-col gap-2 w-[110px]">
        <button>
          <div className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-full shadow-sm cursor-pointer transition">
            <FaCheckCircle className="text-white text-base" />
            <span>Accept</span>
          </div>
        </button>
        <button>
          <div className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-full shadow-sm cursor-pointer transition">
            <FaTimesCircle className="text-white text-base" />
            <span>Reject</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default ExchangeInvitationCard;
