import Navbar from '../Components/Navbar';
import LearnSkillCard from '../Components/LearnSkillCard.tsx';
import ExchangeSkillCard from '../Components/ExchangeSkillCard.tsx';
import { useEffect, useState } from 'react';
import postApiHelper from '../utils/api/postApiHelper';
import profileApiHelper from '../utils/api/profileApi';
import skillApiHelper from '../utils/api/skillApiHelper';
import type { Skill } from '../utils/types/skill';
import type { PostType } from '../utils/types/post';
import { RotateLoader } from 'react-spinners';

interface ExchangePostType extends PostType {
  exchangeForSkillId: string;
}

const Home = () => {
  const [learnPosts, setLearnPosts] = useState<PostType[]>([]);
  const [isLoadingLearn, setIsLoadingLearn] = useState<boolean>(false);
  const [isLoadingTeach, setIsLoadingTeach] = useState<boolean>(false);
  const [isLoadingExchange, setIsLoadingExchange] = useState<boolean>(false);
  const [teachPosts, setTeachPosts] = useState<PostType[]>([]);
  const [exchangePosts, setExchangePosts] = useState<ExchangePostType[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingLearn(true);
        setIsLoadingTeach(true);
        setIsLoadingExchange(true);

        const [learnPostsRes, teachPostsRes, profileRes, skillsRes] = await Promise.all([
          postApiHelper.getLearnPost(),
          postApiHelper.getTeachPost(),
          profileApiHelper.getSelfProfile(),
          skillApiHelper.getAllSkills()
        ]);

        setSkills(skillsRes);

        const myId = profileRes._id;
        const myLearnSkills = profileRes.skillsToLearn;
        const myTeachSkills = profileRes.skillsToTeach;

        const otherUsersLearnPosts = learnPostsRes.filter(post => post.fromUser._id !== myId);
        const otherUsersTeachPosts = teachPostsRes.filter(post => post.fromUser._id !== myId);

        const filteredLearnPosts = otherUsersLearnPosts.filter(post =>
          myTeachSkills.includes(post.learnSkill._id)
        );

        const filteredTeachPosts = otherUsersTeachPosts.filter(post =>
          myLearnSkills.includes(post.learnSkill._id)
        );

        setLearnPosts(filteredLearnPosts);
        setTeachPosts(filteredTeachPosts);
        setIsLoadingLearn(false);
        setIsLoadingTeach(false);

        // 🔁 Create m × n exchange posts
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

            const now = new Date().toISOString();

            exchangeMatches.push({
              _id: `${theirTeachPost._id}-${theirLearnPost._id}`,
              fromUser: theirTeachPost.fromUser,
              learnSkill: theirTeachPost.learnSkill,
              exchangeForSkillId: theirLearnPost.learnSkill._id,
              createdAt: now,
              updatedAt: now,
            });
          }
        }

        setExchangePosts(exchangeMatches);
        setIsLoadingExchange(false);
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

  return (
    <div className="relative h-screen w-full overflow-y-auto">
      <div className="fixed top-0 left-0 w-full z-50 bg-white">
        <Navbar />
      </div>

      <div className="pt-[130px] overflow-y-auto h-full w-full flex justify-center">
        <div className="w-11/12 h-auto px-4 pb-10 flex flex-col gap-10">

          {/* 🔁 Mutual Skill Exchanges */}
          <div className="bg-[#ffffffb0] rounded-lg px-6 py-4 shadow-md">
            <h4 className="font-semibold text-3xl mb-2">Mutual Skill Exchanges</h4>
            <div className="skills w-full flex gap-6 overflow-x-auto py-4">
              {isLoadingExchange ? (
                <div className="flex items-center justify-center h-40 w-full">
                  <RotateLoader color="#3178C6" size={18} />
                </div>
              ) : exchangePosts.length === 0 ? (
                <p className="text-gray-500">No mutual exchanges found yet.</p>
              ) : (
                exchangePosts.map((post, idx) => {
                  const theirSkill = skills.find(s => s._id === post.learnSkill._id);
                  const yourSkill = skills.find(s => s._id === post.exchangeForSkillId);
                  return (
                    theirSkill &&
                    yourSkill && (
                      <ExchangeSkillCard
                        key={idx}
                        skill={attachIcon(theirSkill)}
                        exchangeFor={attachIcon(yourSkill)}
                        user={post.fromUser}
                      />
                    )
                  );
                })
              )}
            </div>
          </div>

          {/* 📘 Learn Section */}
          <div className="bg-[#ffffffb0] rounded-lg px-6 py-4 shadow-md">
            <h4 className="font-semibold text-3xl mb-2">Skills You Can Learn</h4>
            <div className="skills w-full flex gap-6 overflow-x-auto py-4">
              {isLoadingLearn ? (
                <div className="flex items-center justify-center h-40 w-full">
                  <RotateLoader color="#3178C6" size={18} />
                </div>
              ) : learnPosts.length === 0 ? (
                <p className="text-gray-500">No learning posts found.</p>
              ) : (
                learnPosts.map((post, idx) => {
                  const skill = skills.find(s => s._id === post.learnSkill._id);
                  return (
                    skill && (
                      <LearnSkillCard
                        key={idx}
                        skill={attachIcon(skill)}
                        user={post.fromUser}
                      />
                    )
                  );
                })
              )}
            </div>
          </div>

          {/* 📗 Teach Section */}
          <div className="bg-[#ffffffb0] rounded-lg px-6 py-4 shadow-md">
            <h4 className="font-semibold text-3xl mb-2">Skills You Can Teach</h4>
            <div className="skills w-full flex gap-6 overflow-x-auto py-4">
              {isLoadingTeach ? (
                <div className="flex items-center justify-center h-40 w-full">
                  <RotateLoader color="#3178C6" size={18} />
                </div>
              ) : teachPosts.length === 0 ? (
                <p className="text-gray-500">No teaching posts found.</p>
              ) : (
                teachPosts.map((post, idx) => {
                  const skill = skills.find(s => s._id === post.learnSkill._id);
                  return (
                    skill && (
                      <LearnSkillCard
                        key={idx}
                        skill={attachIcon(skill)}
                        user={post.fromUser}
                      />
                    )
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
