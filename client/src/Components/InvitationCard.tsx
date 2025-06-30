import { FaCheckCircle, FaExchangeAlt, FaTimesCircle } from "react-icons/fa";
import { Link } from "react-router-dom";
import Avatar from '../assets/Avatar.png';

const InvitationCard = () => {

    const date = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  return (
     <div className="relative w-auto p-4 bg-white flex flex-row justify-center items-center gap-4 rounded-2xl shadow-lg transition-transform cursor-pointer hover:-translate-y-2">
      
      {/*Date*/}
      <span className="absolute top-2 right-3 text-gray-400 text-xs">
        {date}
      </span>

    
      <div className="flex flex-col items-center justify-center">
        <Link to={`profile/`}>
          <img className="rounded-full" src={Avatar} alt="Avatar" />
        </Link>
        <h4 className="font-bold text-sm w-20">Vikas Kewat</h4>
        <h4 className="font-semibold text-xs">Student</h4>
      </div>

      {/* Skill */}
      <div className="flex flex-col items-center justify-center">
        <img className="h-16 w-auto" src="https://www.svgrepo.com/show/452091/python.svg" alt="Python" />
        <span className="bg-[#f0f4f8] text-sm font-semibold text-[#3178C6] px-2 py-1 rounded">
          Python
        </span>
      </div>

      {/* <FaExchangeAlt size={80} color="blue" />

   
      <div className="flex flex-col items-center justify-center">
        <img className="h-16 w-auto" src="https://www.svgrepo.com/show/374032/reactjs.svg" alt="React" />
        <span className="bg-[#f0f4f8] text-sm font-semibold text-[#3178C6] px-2 py-1 rounded">
          React
        </span>
      </div> */}

      {/*Buttons */}
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
}

export default InvitationCard
