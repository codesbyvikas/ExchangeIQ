import Navbar from '../Components/Navbar';
import ExchangeSkillCard from '../Components/ExchangeSkillCard.tsx';
import LearnSkillCard from '../Components/LearnSkillCard.tsx';
import { useEffect, useState } from 'react';
import postApiHelper from '../utils/api/postApiHelper';
import profileApiHelper from '../utils/api/profileApi';
import skillApiHelper from '../utils/api/skillApiHelper';
import type { Skill } from '../utils/types/skill';
import type { PostType } from '../utils/types/post';
import type { UserType } from '../utils/types/user';

const Home = () => {
  const [learnPosts, setLearnPosts] = useState<PostType[]>([]);
  const [teachPosts, setTeachPosts] = useState<PostType[]>([]);
  const [exchangePosts, setExchangePosts] = useState<PostType[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [learnPostsRes, teachPostsRes, profileRes, skillsRes] = await Promise.all([
          postApiHelper.getLearnPost(),
          postApiHelper.getTeachPost(),
          profileApiHelper.getSelfProfile(),
          skillApiHelper.getAllSkills()
        ]);

        setSkills(skillsRes);

        const otherUsersLearnPosts = learnPostsRes.filter(
          post => post.fromUser._id !== profileRes._id
        );

        const otherUsersTeachPosts = teachPostsRes.filter(
          post => post.fromUser._id !== profileRes._id
        );

        const filteredLearnPosts = otherUsersLearnPosts.filter(
          post => profileRes.skillsToTeach.includes(post.learnSkill._id)
        );

        const filteredTeachPosts = otherUsersTeachPosts.filter(
          post => profileRes.skillsToLearn.includes(post.learnSkill._id)
        );

        const unmatchedLearnPosts = otherUsersLearnPosts.filter(
          post => !profileRes.skillsToTeach.includes(post.learnSkill._id)
        );

        setLearnPosts(filteredLearnPosts);
        setTeachPosts(filteredTeachPosts);
        setExchangePosts(unmatchedLearnPosts);

        // Sample: auto-select first match to show in matchedPosts
        if (filteredLearnPosts.length > 0) {
          const first = filteredLearnPosts[0];
          setSelectedSkillId(first.learnSkill._id);
          setSelectedUserId(first.fromUser._id);

          
        }
      } catch (error) {
        console.error('Error loading posts or profile:', error);
      }
    };

    fetchData();
  }, []);

  const attachIcon = (skill: Skill) => ({
    ...skill,
    icon: <img src={skill.iconUrl} alt={skill.name} className="w-10 h-10" />,
  });

  const selectedSkillName =
    skills.find(skill => skill._id === selectedSkillId)?.name || 'Unknown Skill';

  const selectedUserName =
    learnPosts.find(post => post.fromUser._id === selectedUserId)?.fromUser.name || 'Unknown User';

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <div className="fixed top-0 left-0 w-full z-50 bg-white">
        <Navbar />
      </div>

      <div className="pt-[130px] overflow-y-auto h-full w-full flex justify-center">
        <div className="w-11/12 h-auto px-4 pb-10 flex flex-col gap-10">
          {/* Exchange Section */}
          {/* <div className="bg-[#ffffffb0] rounded-lg px-6 py-4 shadow-md">
            <h4 className="font-semibold text-3xl mb-2">Skills You Can Exchange</h4>
            <div className="skills w-full flex gap-6 overflow-x-auto py-4">
              {exchangePosts.map((post, idx) => {
                const skill = skills.find(s => s._id === post.learnSkill._id);
                return (
                  skill && (
                    <ExchangeSkillCard
                      key={idx}
                      skill={attachIcon(skill)}
                      user={post.fromUser}
                      exchangeFor={teachSkills[0] || ''}
                    />
                  )
                );
              })}
            </div>
          </div> */}

          {/* Learn Section */}
          <div className="bg-[#ffffffb0] rounded-lg px-6 py-4 shadow-md">
            <h4 className="font-semibold text-3xl mb-2">Skills You Can Learn</h4>
            <div className="skills w-full flex gap-6 overflow-x-auto py-4">
              {learnPosts.map((post, idx) => {
                const skill = skills.find(s => s._id === post.learnSkill._id);
                return (
                  skill && (
                    <LearnSkillCard key={idx} skill={attachIcon(skill)} user={post.fromUser} />
                  )
                );
              })}
            </div>
          </div>

          {/* Teach Section */}
          <div className="bg-[#ffffffb0] rounded-lg px-6 py-4 shadow-md">
            <h4 className="font-semibold text-3xl mb-2">Skills You Can Teach</h4>
            <div className="skills w-full flex gap-6 overflow-x-auto py-4">
              {teachPosts.map((post, idx) => {
                const skill = skills.find(s => s._id === post.learnSkill._id);
                return (
                  skill && (
                    <LearnSkillCard key={idx} skill={attachIcon(skill)} user={post.fromUser} />
                  )
                );
              })}
            </div>
          </div>

          {/* Matched Posts Section
          {matchedPosts.length > 0 && (
            <div className="bg-[#ffffffb0] rounded-lg px-6 py-4 shadow-md">
              <h4 className="font-semibold text-3xl mb-2">
                Matched Posts — Learn "{selectedSkillName}" from {selectedUserName}
              </h4>
              <div className="skills w-full flex gap-6 overflow-x-auto py-4">
                {matchedPosts.map((post, idx) => {
                  const skill = skills.find(s => s._id === post.learnSkill._id);
                  return (
                    skill && (
                      <LearnSkillCard key={idx} skill={attachIcon(skill)} user={post.fromUser} />
                    )
                  );
                })}
              </div>
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
};

export default Home;
