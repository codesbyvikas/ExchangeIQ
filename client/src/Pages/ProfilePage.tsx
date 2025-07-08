import { useEffect, useState } from 'react';
import Avatar from '../assets/Avatar.png';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import type { Skill } from '../utils/types/skill';
import type { UserType } from '../utils/types/user';
import profileApiHelper from '../utils/api/profileApiHelper';
import skillApiHelper from '../utils/api/skillApiHelper';
import { useNavigate, useParams } from 'react-router-dom';
import { FaCheck, FaEdit, FaSave } from 'react-icons/fa';
import { RotateLoader } from 'react-spinners';
import { IoPersonAdd } from 'react-icons/io5';

const Profile = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isFollowBtnActive, setIsFollowBtnActive] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserType>();
  const [loggedInUserId, setLoggedInUserId] = useState<string | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editBtnActive, setEditBtnActive] = useState(false);
  const [professionInput, setProfessionInput] = useState('');
  const [characterLength, setCharacterLength] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        let profileRes: UserType;
        let selfProfile: UserType;

          if (id) {
            profileRes = await profileApiHelper.getUserById(id);
            selfProfile = await profileApiHelper.getSelfProfile();
            setLoggedInUserId(selfProfile._id);
          } else {
            selfProfile = await profileApiHelper.getSelfProfile();
            profileRes = selfProfile;
            setLoggedInUserId(selfProfile._id);
          }

        const skillsRes = await skillApiHelper.getAllSkills();
        setCurrentUser(profileRes);
        setSkills(skillsRes);
        setProfessionInput(profileRes.profession || '');
        setCharacterLength((profileRes.profession || '').length);

        if (id && profileRes.followers && selfProfile) {
          setIsFollowBtnActive(profileRes.followers.includes(selfProfile._id));
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  const getSkillDetails = (ids: string[]) =>
    skills.filter(skill => ids.includes(skill._id));

  const handleEditBtn = () => setEditBtnActive(true);

  const handleProfessionInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfessionInput(e.target.value);
    setCharacterLength(e.target.value.length);
  };

  const handleSaveProfession = async () => {
    if (!currentUser) return;
    setSaving(true);
    try {
      await profileApiHelper.profileUpdate({ profession: professionInput });
      setCurrentUser({ ...currentUser, profession: professionInput });
      setEditBtnActive(false);
    } catch (error) {
      console.error('Failed to update profession', error);
    } finally {
      setSaving(false);
    }
  };

  const handleFollowBtn = async () => {
    if (!currentUser || !loggedInUserId) return;
    try {
      if (isFollowBtnActive) {
        await profileApiHelper.unfollowUser(currentUser._id);
        setCurrentUser({
          ...currentUser,
          followers: currentUser.followers.filter(f => f !== loggedInUserId)
        });
      } else {
        await profileApiHelper.followUser(currentUser._id);
        setCurrentUser({
          ...currentUser,
          followers: [...currentUser.followers, loggedInUserId]
        });
      }
      setIsFollowBtnActive(!isFollowBtnActive);
    } catch (error) {
      console.error('Failed to follow/unfollow:', error);
    }
  };

  return (
    <div className="w-full min-h-dvh flex flex-col">
      <Navbar />

      <main className="flex-grow w-full max-w-6xl mx-auto px-4 my-8 flex flex-col gap-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left Column */}
          <div className="w-full md:w-1/3 p-4 flex flex-col items-center bg-white/90 shadow-lg rounded-xl">
            <img
              src={currentUser?.photo || Avatar}
              className="w-24 h-24 rounded-full border-4 border-[#3178C6] shadow"
              alt="Avatar"
            />
            <div className="mt-2 relative w-full">
              {!id && (
                <div className={`w-full px-1 absolute top-0 flex items-center ${!editBtnActive ? 'justify-end' : 'justify-between'}`}>
                  {editBtnActive && (
                    <span className="text-xs text-gray-600 font-extralight">
                      max {characterLength}/20
                    </span>
                  )}
                  {editBtnActive ? (
                    <button
                      className="text-sm cursor-pointer text-[#3178C6] flex items-center gap-0.5"
                      onClick={handleSaveProfession}
                      disabled={saving}
                    >
                      {saving ? <RotateLoader color="#3178C6" size={8} /> : <><FaSave /> Save</>}
                    </button>
                  ) : (
                    <button
                      className="text-sm cursor-pointer text-[#3178C6] flex items-center gap-1"
                      onClick={handleEditBtn}
                    >
                      <FaEdit /> Edit
                    </button>
                  )}
                </div>
              )}
              <input
                type="text"
                maxLength={20}
                className={`h-auto p-2 text-xl text-center font-bold text-[#3178C6] capitalize mt-2 w-full bg-transparent border-[#3178C6] focus:outline-none transition ${editBtnActive ? 'bg-white border-b-2' : 'bg-gray-100 cursor-default border-none'}`}
                placeholder={!id ? "Your Profession..." : "Student"}
                onChange={handleProfessionInput}
                value={professionInput}
                disabled={!editBtnActive}
              />
            </div>
          </div>

          {/* Right Column */}
          <div className={`w-full md:w-2/3 p-4 bg-white/90 shadow-lg rounded-xl flex flex-col gap-2 ${id ? 'justify-between' : 'justify-center'}`}>
            {id && (
              <div className="w-full mr-4 flex justify-end">
                <button
                  onClick={handleFollowBtn}
                  className={`text-xl px-3 py-1 flex gap-1 items-center border-2 rounded-xl transition ${!isFollowBtnActive ? "bg-[#3178C6] text-white hover:bg-[#225a8c]" : "bg-transparent border-[#3178C6] text-[#3178C6]"}`}
                >
                  {!isFollowBtnActive ? <IoPersonAdd /> : <FaCheck />}
                  {!isFollowBtnActive ? "Follow" : "Following"}
                </button>
              </div>
            )}
            <div>
              <h2 className="text-3xl font-bold text-gray-700">
                {currentUser?.name || (
                  <div className="h-12 flex justify-start items-center">
                    <RotateLoader color="#2563eb" />
                  </div>
                )}
              </h2>
              <p className="text-lg text-gray-500">{currentUser?.email}</p>
            </div>
            <div className="mt-4 font-semibold">
              Followers {currentUser?.followers?.length ?? 0} | Following {currentUser?.following?.length ?? 0}
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Skills to Learn */}
          <div className="flex-1 px-6 py-6 bg-[#f1f8ff] rounded-xl shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-xl text-[#3178C6] flex items-center gap-2">
                <span className="inline-block w-3 h-3 bg-[#3178C6] rounded-full"></span>
                Wish to Learn
              </h3>
              {!id && (
                <button
                  onClick={() => navigate('/profile/skills/learn')}
                  className="text-sm px-3 py-1 bg-[#3178C6] text-white rounded hover:bg-[#225a8c] transition"
                >
                  Edit
                </button>
              )}
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

          {/* Skills to Teach */}
          <div className="flex-1 px-6 py-6 bg-[#f1f8ff] rounded-xl shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-xl text-[#3178C6] flex items-center gap-2">
                <span className="inline-block w-3 h-3 bg-[#3178C6] rounded-full"></span>
                Wish to Teach
              </h3>
              {!id && (
                <button
                  onClick={() => navigate('/profile/skills/teach')}
                  className="text-sm px-3 py-1 bg-[#3178C6] text-white rounded hover:bg-[#225a8c] transition"
                >
                  Edit
                </button>
              )}
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
