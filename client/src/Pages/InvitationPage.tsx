import { useEffect, useState } from 'react';
import { RotateLoader } from 'react-spinners';
import Navbar from '../Components/Navbar';
import ExchangeInvitationCard from '../Components/ExchangeInvitationCard';
import InvitationCard from '../Components/InvitationCard';
import type { InvitationType } from '../utils/types/invitation';
import invitationApiHelper from '../utils/api/invitationApiHelper';
import profileApiHelper from '../utils/api/profileApi';

const InvitationPage = () => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [learnInvitations, setLearnInvitations] = useState<InvitationType[]>([]);
  const [teachInvitations, setTeachInvitations] = useState<InvitationType[]>([]);
  const [exchangeInvitations, setExchangeInvitations] = useState<InvitationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUser = await profileApiHelper.getSelfProfile();
        setCurrentUserId(currentUser._id);

        const invitations = await invitationApiHelper.getUserInvitations();
        const filtered = invitations.filter(inv => inv.fromUser._id !== currentUser._id);

        setLearnInvitations(filtered.filter(inv => inv.reqType === 'teach'));
        setTeachInvitations(filtered.filter(inv => inv.reqType === 'learn'));
        setExchangeInvitations(filtered.filter(inv => inv.reqType === 'exchange'));
      } catch (err) {
        setError('Failed to load invitations or user data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <RotateLoader color="#2563eb" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex justify-center items-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full overflow-y-auto">
      <div className="fixed top-0 left-0 w-full z-50 bg-white">
        <Navbar />
      </div>

      <div className="pt-[130px] h-full w-full flex justify-center">
        <div className="w-11/12 h-auto px-4 pb-10 flex flex-col gap-10">

          {/* Exchange Invitations */}
          <div className="bg-[#ffffffb0] rounded-lg px-6 py-4 shadow-md">
            <h4 className="font-semibold text-2xl mb-2 text-black">Exchange Skill Invitations</h4>
            <div className="w-full flex gap-6 overflow-x-auto py-4 px-1">
              {exchangeInvitations.length === 0 ? (
                <p>No invitations.</p>
              ) : (
                exchangeInvitations.map(inv => (
                  <ExchangeInvitationCard key={inv._id} invitation={inv} />
                ))
              )}
            </div>
          </div>

          {/* Learn Invitations */}
          <div className="bg-[#ffffffb0] rounded-lg px-6 py-4 shadow-md">
            <h4 className="font-semibold text-2xl mb-2 text-black">Learn Skill Invitations</h4>
            <div className="w-full flex gap-6 overflow-x-auto py-4 px-1">
              {learnInvitations.length === 0 ? (
                <p>No invitations.</p>
              ) : (
                learnInvitations.map(inv => (
                  <InvitationCard key={inv._id} invitation={inv} />
                ))
              )}
            </div>
          </div>

          {/* Teach Invitations */}
          <div className="bg-[#ffffffb0] rounded-lg px-6 py-4 shadow-md">
            <h4 className="font-semibold text-2xl mb-2 text-black">Teach Skill Invitations</h4>
            <div className="w-full flex gap-6 overflow-x-auto py-4 px-1">
              {teachInvitations.length === 0 ? (
                <p>No invitations.</p>
              ) : (
                teachInvitations.map(inv => (
                  <InvitationCard key={inv._id} invitation={inv} />
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default InvitationPage;
