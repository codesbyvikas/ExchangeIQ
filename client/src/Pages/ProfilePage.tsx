import { useEffect, useState } from 'react';
import Avatar from '../assets/Avatar.png';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import type { Skill } from '../utils/types/skill';
import type { UserType } from '../utils/types/user';
import profileApiHelper from '../utils/api/profileApi';
import skillApiHelper from '../utils/api/skillApiHelper';
import { useNavigate } from 'react-router-dom';
import { RotateLoader } from 'react-spinners';

const Profile = () => {
  const [currentUser, setCurrentUser] = useState<UserType>();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const [profileRes, skillsRes] = await Promise.all([
          profileApiHelper.getSelfProfile(),
          skillApiHelper.getAllSkills(),
        ]);
        setCurrentUser(profileRes);
        setSkills(skillsRes);
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const getSkillDetails = (ids: string[]) =>
    skills.filter(skill => ids.includes(skill._id));

  return (
    <div className="w-full min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow w-full max-w-6xl mx-auto px-4 my-8 flex flex-col gap-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/3 px-4 py-6 flex flex-col items-center bg-white/90 shadow-lg rounded-xl">
            <img
              src={currentUser?.photo|| Avatar}
              className="w-24 h-24 rounded-full border-4 border-[#3178C6] shadow"
              alt="Avatar"
            />
            <h2 className="text-xl font-bold text-[#3178C6] mt-2">
              Fullstack Developer
            </h2>
          </div>
          <div className="w-full md:w-2/3 px-4 py-6 bg-white/90 shadow-lg rounded-xl flex flex-col justify-center">
            <h2 className="text-3xl font-bold text-gray-700">
              {currentUser?.name || (
                <div className="h-12 ml-90 flex justify-start items-center">
                    <RotateLoader color="#2563eb" />
                </div>
                )}
            </h2>
            <p className="text-lg text-gray-600">{currentUser?.email}</p>
          </div>
        </div>

        {/* Skills Section */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Learn Skills */}
          <div className="flex-1 px-6 py-6 bg-[#f1f8ff] rounded-xl shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-xl text-[#3178C6] flex items-center gap-2">
                <span className="inline-block w-3 h-3 bg-[#3178C6] rounded-full"></span>
                Wish to Learn
              </h3>
              <button
                onClick={() => navigate('/profile/skills/learn')}
                className="text-sm px-3 py-1 bg-[#3178C6] text-white rounded hover:bg-[#225a8c] transition"
              >
                Edit
              </button>
            </div>
            {isLoading ? (
              <div className="flex justify-center items-center h-24">
                <RotateLoader color="#2563eb" />
              </div>
            ) : (
              <ul className="flex flex-col gap-3">
                {getSkillDetails(currentUser?.skillsToLearn || []).length === 0 ? (
                  <li className="text-gray-400">No skills added</li>
                ) : (
                  getSkillDetails(currentUser?.skillsToLearn || []).map(skill => (
                    <li key={skill._id} className="flex items-center gap-3 bg-white rounded p-2 shadow-sm">
                      <img src={skill.iconUrl} alt={skill.name} className="w-7 h-7" />
                      <span className="font-medium">{skill.name}</span>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>

          {/* Teach Skills */}
          <div className="flex-1 px-6 py-6 bg-[#f1f8ff] rounded-xl shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-xl text-[#3178C6] flex items-center gap-2">
                <span className="inline-block w-3 h-3 bg-[#3178C6] rounded-full"></span>
                Wish to Teach
              </h3>
              <button
                onClick={() => navigate('/profile/skills/teach')}
                className="text-sm px-3 py-1 bg-[#3178C6] text-white rounded hover:bg-[#225a8c] transition"
              >
                Edit
              </button>
            </div>
            {isLoading ? (
              <div className="flex justify-center items-center h-24">
                <RotateLoader color="#2563eb" />
              </div>
            ) : (
              <ul className="flex flex-col gap-3">
                {getSkillDetails(currentUser?.skillsToTeach || []).length === 0 ? (
                  <li className="text-gray-400">No skills added</li>
                ) : (
                  getSkillDetails(currentUser?.skillsToTeach || []).map(skill => (
                    <li key={skill._id} className="flex items-center gap-3 bg-white rounded p-2 shadow-sm">
                      <img src={skill.iconUrl} alt={skill.name} className="w-7 h-7" />
                      <span className="font-medium">{skill.name}</span>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
