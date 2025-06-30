import { RotateLoader } from 'react-spinners';
import Navbar from '../Components/Navbar';
import ExchangeInvitationCard from '../Components/ExchangeInvitationCard';

const InvitationPage = () => {
  return (
    <div className="relative h-screen w-full overflow-y-auto">
      {/* 🔝 Navbar */}
      <div className="fixed top-0 left-0 w-full z-50 bg-white">
        <Navbar />
      </div>

      {/* 📬 Exchange Invitations */}
      <div className="pt-[130px] overflow-y-auto h-full w-full flex justify-center">
        <div className="w-11/12 h-auto px-4 pb-10 flex flex-col gap-10">
          <div className="bg-[#ffffffb0] rounded-lg px-6 py-4 shadow-md">
            <h4 className="font-semibold text-3xl mb-2 text-black">Exchange Skill Invitations</h4>

            {/* 🔁 Horizontal Scroll + Padding */}
            <div className="w-full flex gap-6 overflow-x-auto py-4 px-1">
              {/* Replace with .map() for multiple cards */}
              <ExchangeInvitationCard />
              <ExchangeInvitationCard />
              <ExchangeInvitationCard />
              <ExchangeInvitationCard />
              <ExchangeInvitationCard />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvitationPage;
