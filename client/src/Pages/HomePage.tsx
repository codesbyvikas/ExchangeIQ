import Navbar from '../Components/Navbar';
import LearnSkillCard from '../Components/LearnSkillCard.tsx';
import ExchangeSkillCard from '../Components/ExchangeSkillCard.tsx';
import { useEffect, useState, useCallback } from 'react';
import postApiHelper from '../utils/api/postApiHelper';
import profileApiHelper from '../utils/api/profileApiHelper.tsx';
import skillApiHelper from '../utils/api/skillApiHelper';
import invitationApiHelper from '../utils/api/invitationApiHelper';
import type { Skill } from '../utils/types/skill';
import type { PostType } from '../utils/types/post';
import type { InvitationType, RequestType } from '../utils/types/invitation';
import type { UserType } from '../utils/types/user.tsx';
import { RotateLoader } from 'react-spinners';
import Footer from '../Components/Footer.tsx';

interface ExchangePostType extends PostType {
  exchangeForSkillId: string;
}

interface AlertState {
  show: boolean;
  type: 'success' | 'error';
  message: string;
}

const PostLoader = () => (
  <div className="flex items-center justify-center h-40 w-full">
    <RotateLoader color="#3178C6" size={18} />
  </div>
);

const Alert = ({ alert, onClose }: { alert: AlertState; onClose: () => void }) => {
  useEffect(() => {
    if (alert.show) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alert.show, onClose]);

  if (!alert.show) return null;

  return (
    <div className="fixed top-[130px] left-1/2 transform -translate-x-1/2 z-50 w-11/12 max-w-md">
      <div 
        className={`p-4 text-sm rounded-lg shadow-lg border transition-all duration-300 ${
          alert.type === 'success' 
            ? 'text-green-800 bg-green-50 border-green-200 dark:bg-gray-800 dark:text-green-400 dark:border-green-600' 
            : 'text-red-800 bg-red-50 border-red-200 dark:bg-gray-800 dark:text-red-400 dark:border-red-600'
        }`} 
        role="alert"
      >
        <div className="flex items-center justify-between">
          <div>
            <span className="font-medium">
              {alert.type === 'success' ? 'Success!' : 'Error!'}
            </span> {alert.message}
          </div>
          <button
            onClick={onClose}
            className="ml-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

const Home = () => {
  const [learnPosts, setLearnPosts] = useState<PostType[]>([]);
  const [teachPosts, setTeachPosts] = useState<PostType[]>([]);
  const [exchangePosts, setExchangePosts] = useState<ExchangePostType[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [currentUser, setCurrentUser] = useState<UserType>();
  const [sentInvitations, setSentInvitations] = useState<InvitationType[]>([]);

  const [isLoadingLearn, setIsLoadingLearn] = useState(false);
  const [isLoadingTeach, setIsLoadingTeach] = useState(false);
  const [isLoadingExchange, setIsLoadingExchange] = useState(false);

  const [sendingInviteId, setSendingInviteId] = useState<string | null>(null);
  const [alert, setAlert] = useState<AlertState>({ show: false, type: 'success', message: '' });

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ show: true, type, message });
  };

  const hideAlert = () => {
    setAlert({ show: false, type: 'success', message: '' });
  };

  const fetchData = useCallback(async () => {
    try {
      setIsLoadingLearn(true);
      setIsLoadingTeach(true);
      setIsLoadingExchange(true);

      const [invitationsRes, learnPostsRes, teachPostsRes, profileRes, skillsRes] = await Promise.all([
        invitationApiHelper.getUserInvitations(),
        postApiHelper.getLearnPost(),
        postApiHelper.getTeachPost(),
        profileApiHelper.getSelfProfile(),
        skillApiHelper.getAllSkills(),
      ]);

      setSkills(skillsRes);
      setCurrentUser(profileRes);

      const myId = profileRes._id;
      const myLearnSkills = profileRes.skillsToLearn;
      const myTeachSkills = profileRes.skillsToTeach;

      const sent = invitationsRes.filter(i => i.fromUser._id === myId);
      setSentInvitations(sent);

      const otherUsersLearnPosts = learnPostsRes.filter(post => post.fromUser._id !== myId);
      const otherUsersTeachPosts = teachPostsRes.filter(post => post.fromUser._id !== myId);

      const filteredLearnPosts = otherUsersLearnPosts.filter(post =>
        myTeachSkills.includes(post.learnSkill._id) &&
        !sent.some(inv =>
          inv.toUser._id === post.fromUser._id &&
          inv.reqType === 'learn' &&
          inv.skillRequested?._id === post.learnSkill._id
        )
      );

      const filteredTeachPosts = otherUsersTeachPosts.filter(post =>
        myLearnSkills.includes(post.learnSkill._id) &&
        !sent.some(inv =>
          inv.toUser._id === post.fromUser._id &&
          inv.reqType === 'teach' &&
          inv.skillOffered?._id === post.learnSkill._id
        )
      );

      const exchangeMatches: ExchangePostType[] = [];

      for (const theirLearnPost of otherUsersLearnPosts) {
        const userId = theirLearnPost.fromUser._id;
        const theyWantToLearn = theirLearnPost.learnSkill._id;

        if (!myTeachSkills.includes(theyWantToLearn)) continue;

        const theirTeachPosts = otherUsersTeachPosts.filter(
          post => post.fromUser._id === userId
        );

        for (const theirTeachPost of theirTeachPosts) {
          const theyCanTeach = theirTeachPost.learnSkill._id;

          if (!myLearnSkills.includes(theyCanTeach)) continue;

          exchangeMatches.push({
            _id: `${theirTeachPost._id}-${theirLearnPost._id}`,
            fromUser: theirTeachPost.fromUser,
            learnSkill: theirTeachPost.learnSkill,
            exchangeForSkillId: theirLearnPost.learnSkill._id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      }

      const filteredExchangeMatches = exchangeMatches.filter(match =>
        !sent.some(inv =>
          inv.toUser._id === match.fromUser._id &&
          inv.reqType === 'exchange' &&
          inv.skillOffered?._id === match.exchangeForSkillId &&
          inv.skillRequested?._id === match.learnSkill._id
        )
      );

      setLearnPosts(filteredLearnPosts);
      setTeachPosts(filteredTeachPosts);
      setExchangePosts(filteredExchangeMatches);
    } catch (error) {
      console.error('Error loading posts or profile:', error);
    } finally {
      setIsLoadingLearn(false);
      setIsLoadingTeach(false);
      setIsLoadingExchange(false);
    }
  }, []);

  // Specific refresh functions for each section
  const refreshExchangeSection = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      setIsLoadingExchange(true);
      const [invitationsRes, learnPostsRes, teachPostsRes] = await Promise.all([
        invitationApiHelper.getUserInvitations(),
        postApiHelper.getLearnPost(),
        postApiHelper.getTeachPost(),
      ]);

      const myId = currentUser._id;
      const myLearnSkills = currentUser.skillsToLearn;
      const myTeachSkills = currentUser.skillsToTeach;

      const sent = invitationsRes.filter(i => i.fromUser._id === myId);
      setSentInvitations(sent);

      const otherUsersLearnPosts = learnPostsRes.filter(post => post.fromUser._id !== myId);
      const otherUsersTeachPosts = teachPostsRes.filter(post => post.fromUser._id !== myId);

      const exchangeMatches: ExchangePostType[] = [];

      for (const theirLearnPost of otherUsersLearnPosts) {
        const userId = theirLearnPost.fromUser._id;
        const theyWantToLearn = theirLearnPost.learnSkill._id;

        if (!myTeachSkills.includes(theyWantToLearn)) continue;

        const theirTeachPosts = otherUsersTeachPosts.filter(
          post => post.fromUser._id === userId
        );

        for (const theirTeachPost of theirTeachPosts) {
          const theyCanTeach = theirTeachPost.learnSkill._id;

          if (!myLearnSkills.includes(theyCanTeach)) continue;

          exchangeMatches.push({
            _id: `${theirTeachPost._id}-${theirLearnPost._id}`,
            fromUser: theirTeachPost.fromUser,
            learnSkill: theirTeachPost.learnSkill,
            exchangeForSkillId: theirLearnPost.learnSkill._id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      }

      const filteredExchangeMatches = exchangeMatches.filter(match =>
        !sent.some(inv =>
          inv.toUser._id === match.fromUser._id &&
          inv.reqType === 'exchange' &&
          inv.skillOffered?._id === match.exchangeForSkillId &&
          inv.skillRequested?._id === match.learnSkill._id
        )
      );

      setExchangePosts(filteredExchangeMatches);
    } catch (error) {
      console.error('Error refreshing exchange section:', error);
    } finally {
      setIsLoadingExchange(false);
    }
  }, [currentUser]);

  const refreshLearnSection = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      setIsLoadingLearn(true);
      const [invitationsRes, learnPostsRes] = await Promise.all([
        invitationApiHelper.getUserInvitations(),
        postApiHelper.getLearnPost(),
      ]);

      const myId = currentUser._id;
      const myTeachSkills = currentUser.skillsToTeach;

      const sent = invitationsRes.filter(i => i.fromUser._id === myId);
      setSentInvitations(sent);

      const otherUsersLearnPosts = learnPostsRes.filter(post => post.fromUser._id !== myId);

      const filteredLearnPosts = otherUsersLearnPosts.filter(post =>
        myTeachSkills.includes(post.learnSkill._id) &&
        !sent.some(inv =>
          inv.toUser._id === post.fromUser._id &&
          inv.reqType === 'learn' &&
          inv.skillRequested?._id === post.learnSkill._id
        )
      );

      setLearnPosts(filteredLearnPosts);
    } catch (error) {
      console.error('Error refreshing learn section:', error);
    } finally {
      setIsLoadingLearn(false);
    }
  }, [currentUser]);

  const refreshTeachSection = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      setIsLoadingTeach(true);
      const [invitationsRes, teachPostsRes] = await Promise.all([
        invitationApiHelper.getUserInvitations(),
        postApiHelper.getTeachPost(),
      ]);

      const myId = currentUser._id;
      const myLearnSkills = currentUser.skillsToLearn;

      const sent = invitationsRes.filter(i => i.fromUser._id === myId);
      setSentInvitations(sent);

      const otherUsersTeachPosts = teachPostsRes.filter(post => post.fromUser._id !== myId);

      const filteredTeachPosts = otherUsersTeachPosts.filter(post =>
        myLearnSkills.includes(post.learnSkill._id) &&
        !sent.some(inv =>
          inv.toUser._id === post.fromUser._id &&
          inv.reqType === 'teach' &&
          inv.skillOffered?._id === post.learnSkill._id
        )
      );

      setTeachPosts(filteredTeachPosts);
    } catch (error) {
      console.error('Error refreshing teach section:', error);
    } finally {
      setIsLoadingTeach(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSendInvite = async (
    toUserId: string,
    reqType: RequestType,
    skillOfferedId?: string,
    skillRequestedId?: string
  ) => {
    try {
      const inviteKey = `${toUserId}-${reqType}-${skillRequestedId ?? ''}-${skillOfferedId ?? ''}`;
      setSendingInviteId(inviteKey);
      
      await invitationApiHelper.sendInvitation({
        toUser: toUserId,
        reqType,
        skillOffered: skillOfferedId,
        skillRequested: skillRequestedId,
      });
      
      showAlert('success', 'Invitation sent successfully!');
      
      // Refresh only the relevant section
      if (reqType === 'exchange') {
        await refreshExchangeSection();
      } else if (reqType === 'learn') {
        await refreshLearnSection();
      } else if (reqType === 'teach') {
        await refreshTeachSection();
      }
    } catch (error) {
      console.error('Invitation failed:', error);
      showAlert('error', 'Failed to send invitation. Please try again.');
    } finally {
      setSendingInviteId(null);
    }
  };

  const attachIcon = useCallback(
    (skill: Skill) => ({
      ...skill,
      icon: <img src={skill.iconUrl} alt={skill.name} className="w-10 h-10" />,
    }),
    []
  );

  return (
  <div className="flex flex-col min-h-screen">
    {/* Navbar */}
    <div className="fixed top-0 left-0 w-full z-50 bg-white">
      <Navbar />
    </div>

    {/* Main Scrollable Content */}
    <main className="flex-grow pt-[130px] w-full flex justify-center">
      {/* Fixed Alert Component */}
      <Alert alert={alert} onClose={hideAlert} />

      <div className="w-11/12 h-auto px-4 pb-10 flex flex-col gap-10">
        {/* Mutual Skill Exchanges */}
        {currentUser && (
          <div className="bg-[#ffffffb0] rounded-lg px-6 py-4 shadow-md">
            <h4 className="font-semibold text-2xl mb-2">Mutual Skill Exchanges</h4>
            <div className="w-full flex gap-6 overflow-x-auto py-4 px-1">
              {isLoadingExchange ? (
                <PostLoader />
              ) : exchangePosts.length === 0 ? (
                <p className="text-gray-500">No mutual exchanges found yet.</p>
              ) : (
                exchangePosts.map(({ learnSkill, exchangeForSkillId, fromUser, _id }) => {
                  const theirSkill = skills.find(s => s._id === learnSkill._id);
                  const yourSkill = skills.find(s => s._id === exchangeForSkillId);
                  return (
                    theirSkill && yourSkill && (
                      <ExchangeSkillCard
                        key={_id}
                        skill={attachIcon(theirSkill)}
                        exchangeFor={attachIcon(yourSkill)}
                        user={fromUser}
                        onSendInvite={handleSendInvite}
                        isLoading={sendingInviteId === `${fromUser._id}-exchange-${exchangeForSkillId}-${learnSkill._id}`}
                      />
                    )
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Skills You Can Learn */}
        {currentUser && (
          <div className="bg-[#ffffffb0] rounded-lg px-6 py-4 shadow-md">
            <h4 className="font-semibold text-2xl mb-2">Skills You Can Learn</h4>
            <div className="w-full flex gap-6 overflow-x-auto py-4 px-1">
              {isLoadingLearn ? (
                <PostLoader />
              ) : learnPosts.length === 0 ? (
                <p className="text-gray-500">No learning posts found.</p>
              ) : (
                learnPosts.map(({ learnSkill, fromUser, _id }) => {
                  const skill = skills.find(s => s._id === learnSkill._id);
                  return (
                    skill && (
                      <LearnSkillCard
                        key={_id}
                        skill={attachIcon(skill)}
                        user={fromUser}
                        reqType="learn"
                        onSendInvite={handleSendInvite}
                        isLoading={sendingInviteId === `${fromUser._id}-learn-${learnSkill._id}-`}
                      />
                    )
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Skills You Can Teach */}
        {currentUser && (
          <div className="bg-[#ffffffb0] rounded-lg px-6 py-4 shadow-md">
            <h4 className="font-semibold text-3xl mb-2">Skills You Can Teach</h4>
            <div className="w-full flex gap-6 overflow-x-auto py-4 px-1">
              {isLoadingTeach ? (
                <PostLoader />
              ) : teachPosts.length === 0 ? (
                <p className="text-gray-500">No teaching posts found.</p>
              ) : (
                teachPosts.map(({ learnSkill, fromUser, _id }) => {
                  const skill = skills.find(s => s._id === learnSkill._id);
                  return (
                    skill && (
                      <LearnSkillCard
                        key={_id}
                        skill={attachIcon(skill)}
                        user={fromUser}
                        reqType="teach"
                        onSendInvite={handleSendInvite}
                        isLoading={sendingInviteId === `${fromUser._id}-teach--${learnSkill._id}`}
                      />
                    )
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </main>

    {/* Footer sits at the bottom if content is short, otherwise scrolls normally */}
    <Footer />
  </div>
);

};

export default Home;