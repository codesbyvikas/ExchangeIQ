import { useEffect, useState } from 'react';
import { RotateLoader } from 'react-spinners';
import Navbar from '../Components/Navbar';
import ExchangeInvitationCard from '../Components/ExchangeInvitationCard';
import InvitationCard from '../Components/InvitationCard';
import type { InvitationType } from '../utils/types/invitation';
import invitationApiHelper from '../utils/api/invitationApiHelper';
import profileApiHelper from '../utils/api/profileApiHelper';
import Footer from '../Components/Footer';

interface AlertProps {
  alert: { show: boolean; type: 'success' | 'error'; message: string };
  onClose: () => void;
}

const Alert = ({ alert, onClose }: AlertProps) => {
  useEffect(() => {
    if (alert.show) {
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [alert.show, onClose]);

  if (!alert.show) return null;

  return (
    <div className="fixed top-[130px] left-1/2 transform -translate-x-1/2 z-50 w-11/12 max-w-md">
      <div className={`p-4 text-sm rounded-lg shadow-lg border transition-all duration-300
        ${alert.type === 'success' 
          ? 'text-green-800 bg-green-50 border-green-200'
          : 'text-red-800 bg-red-50 border-red-200'
        }`}>
        <div className="flex items-center justify-between">
          <div>
            <span className="font-medium">{alert.type === 'success' ? 'Success!' : 'Error!'}</span> {alert.message}
          </div>
          <button onClick={onClose}>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

const InvitationPage = () => {
  const [learnInvitations, setLearnInvitations] = useState<InvitationType[]>([]);
  const [teachInvitations, setTeachInvitations] = useState<InvitationType[]>([]);
  const [exchangeInvitations, setExchangeInvitations] = useState<InvitationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [alert, setAlert] = useState({ show: false, type: 'success' as 'success' | 'error', message: '' });

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ show: true, type, message });
  };

  const hideAlert = () => {
    setAlert({ show: false, type: 'success', message: '' });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUser = await profileApiHelper.getSelfProfile();
        const invitations = await invitationApiHelper.getUserInvitations();
        const filtered = invitations.filter(inv => inv.fromUser._id !== currentUser._id);

        setLearnInvitations(filtered.filter(inv => inv.reqType === 'teach' && inv.status=='pending'));
        setTeachInvitations(filtered.filter(inv => inv.reqType === 'learn' && inv.status=='pending'));
        setExchangeInvitations(filtered.filter(inv => inv.reqType === 'exchange' && inv.status=='pending'));
      } catch (err) {
        setError('Failed to load invitations or user data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleStatusChange = async (id: string, status: 'accepted' | 'declined') => {
    try {
      await invitationApiHelper.updateInvitationStatus(id, status);

      // Filter out the updated invitation from all 3 arrays
      setLearnInvitations(prev => prev.filter(inv => inv._id !== id));
      setTeachInvitations(prev => prev.filter(inv => inv._id !== id));
      setExchangeInvitations(prev => prev.filter(inv => inv._id !== id));

      showAlert('success', `Invitation ${status}.`);
    } catch (err) {
      console.error(err);
      showAlert('error', `Failed to ${status} invitation.`);
    }
  };

  if (loading) {
    return (
      <div className="h-dvh flex justify-center items-center">
        <RotateLoader color="#2563eb" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-dvh flex justify-center items-center text-red-500">{error}</div>
    );
  }

  return (
  <div className="flex flex-col min-h-dvh">
    <div className="fixed top-0 left-0 w-full z-50 bg-white">
      <Navbar />
    </div>

    <Alert alert={alert} onClose={hideAlert} />

    <main className="flex-grow pt-[130px] w-full flex justify-center">
      <div className="w-11/12 h-auto px-4 pb-10 flex flex-col gap-10">

        {/* Exchange */}
        <div className="bg-[#ffffffb0] rounded-lg px-6 py-4 shadow-md">
          <h4 className="font-semibold text-2xl mb-2 text-black">Exchange Skill Invitations</h4>
          <div className="w-full flex gap-6 overflow-x-auto py-4 px-1">
            {exchangeInvitations.length === 0 ? (
              <p>No invitations.</p>
            ) : (
              exchangeInvitations.map(inv => (
                <ExchangeInvitationCard key={inv._id} invitation={inv} onStatusChange={handleStatusChange} />
              ))
            )}
          </div>
        </div>

        <div className="bg-[#ffffffb0] rounded-lg px-6 py-4 shadow-md">
          <h4 className="font-semibold text-2xl mb-2 text-black">Invitations to learn from you</h4>
          <div className="w-full flex gap-6 overflow-x-auto py-4 px-1">
            {learnInvitations.length === 0 ? (
              <p>No invitations.</p>
            ) : (
              learnInvitations.map(inv => (
                <InvitationCard key={inv._id} invitation={inv} onStatusChange={handleStatusChange} />
              ))
            )}
          </div>
        </div>

        <div className="bg-[#ffffffb0] rounded-lg px-6 py-4 shadow-md">
          <h4 className="font-semibold text-2xl mb-2 text-black">Invitations to teach you</h4>
          <div className="w-full flex gap-6 overflow-x-auto py-4 px-1">
            {teachInvitations.length === 0 ? (
              <p>No invitations.</p>
            ) : (
              teachInvitations.map(inv => (
                <InvitationCard key={inv._id} invitation={inv} onStatusChange={handleStatusChange} />
              ))
            )}
          </div>
        </div>

      </div>
    </main>

    <Footer />
  </div>
);
};

export default InvitationPage;