import { useEffect, useState } from 'react';
import Avatar from '../assets/Avatar.png';
import Navbar from '../Components/Navbar';
import type { Skill } from '../utils/types/skill';
import type { UserType } from '../utils/types/user';
import profileApiHelper from '../utils/api/profileApi';
import skillApiHelper from '../utils/api/skillApiHelper';
import { useNavigate } from 'react-router-dom';

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
        <div className="w-full h-auto">
            <Navbar />
            <div className="w-full max-w-11/12 mx-auto my-6 flex flex-col">
                <div className='flex gap-4'>
                    <div className='px-4 py-4 flex justify-center flex-col rounded-xl items-center bg-white/90 shadow-lg gap-4'>
                        <img
                            src={Avatar}
                            className="w-18 h-18 rounded-full border-4 border-[#3178C6] shadow"
                            alt="Avatar"
                        />
                        <h2 className="text-xl text-nowrap font-bold text-[#3178C6]">
                            {/* {currentUser?.profession || ''} */}
                            Fullstack Developer
                        </h2>
                    </div>
                    <div className='w-full px-4 py-4 flex justify-end flex-col rounded-xl items-start bg-white/90 shadow-lg'>
                        <h2 className="text-4xl font-bold text-gray-600">
                            {currentUser?.name || 'Loading...'}
                        </h2>
                        <p className='text-2xl font-light'>useremail@gmail.com</p>
                    </div>
                </div>
                <div className="mt-4 w-full flex gap-4">
                    <div className="px-8 py-8  flex-1 bg-[#f1f8ff] rounded-xl shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-xl text-[#3178C6] flex items-center gap-2">
                                <span className="inline-block w-3 h-3 bg-[#3178C6] rounded-full"></span>
                                Skills to Learn
                            </h3>
                            <button
                                className="text-sm px-3 py-1 bg-[#3178C6] text-white rounded hover:bg-[#225a8c] transition"
                                onClick={() => navigate('/profile/skills/learn')}
                            >
                                Edit
                            </button>
                        </div>
                        {isLoading ? (
                            <div className="text-gray-400">Loading...</div>
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
                    <div className="px-8 py-8 flex-1 bg-[#f1f8ff] rounded-xl shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-xl text-[#3178C6] flex items-center gap-2">
                                <span className="inline-block w-3 h-3 bg-[#3178C6] rounded-full"></span>
                                Skills to Teach
                            </h3>
                            <button
                                className="text-sm px-3 py-1 bg-[#3178C6] text-white rounded hover:bg-[#225a8c] transition"
                                onClick={() => navigate('/profile/skills/teach')}
                            >
                                Edit
                            </button>
                        </div>
                        {isLoading ? (
                            <div className="text-gray-400">Loading...</div>
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
            </div>
        </div>
    );
};

export default Profile;