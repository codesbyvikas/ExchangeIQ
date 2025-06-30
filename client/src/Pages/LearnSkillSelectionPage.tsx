import React, { useState, useEffect } from 'react';
import type { Skill } from '../utils/types/skill';
import skillApiHelper from '../utils/api/skillApiHelper';
import profileApiHelper from '../utils/api/profileApi';
import postApiHelper from '../utils/api/postApiHelper';
import { useNavigate } from 'react-router-dom';
import SkillCard from '../Components/SkillCard';
import { RotateLoader } from 'react-spinners';

const getAllTags = (skills: Skill[]): string[] => {
  const tags = new Set<string>();
  skills.forEach((skill) => skill.tags.forEach((tag) => tags.add(tag)));
  return Array.from(tags);
};

interface LearnSkillSelectPageProps {
  selectedSkillIds: string[];
  setSelectedSkillIds: React.Dispatch<React.SetStateAction<string[]>>;
  excludeSkillIds: string[];
}

const LearnSkillSelectPage: React.FC<LearnSkillSelectPageProps> = ({
  selectedSkillIds,
  setSelectedSkillIds,
  excludeSkillIds,
}) => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [disabledSkillIds, setDisabledSkillIds] = useState<string[]>([]);
  const [initialLearnSkills, setInitialLearnSkills] = useState<string[]>([]);
  const [userId, setUserId] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSkills = async () => {
      setIsLoading(true);
      try {
        const data = await skillApiHelper.getAllSkills();
        setSkills(data);

        const userProfile = await profileApiHelper.getSelfProfile();
        const userSkillsToLearn = userProfile.skillsToLearn || [];
        const userSkillsToTeach = userProfile.skillsToTeach || [];

        const filteredSkillToLearn = userSkillsToLearn.filter(
          (skillId) => !userSkillsToTeach.includes(skillId)
        );

        setSelectedSkillIds(filteredSkillToLearn);
        setDisabledSkillIds(userSkillsToTeach);
        setInitialLearnSkills(filteredSkillToLearn);
        setUserId(userProfile._id);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading skills:', error);
        setIsLoading(false);
      }
    };
    fetchSkills();
  }, []);

  const allTags = getAllTags(skills);

  const handleTagClick = (tag: string): void => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedTags([]);
  };

  const handleSelectedSkills = (skillId: string) => {
    setSelectedSkillIds((prev) =>
      prev.includes(skillId) ? prev.filter((id) => id !== skillId) : [...prev, skillId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);

      const validSkillIds = selectedSkillIds.filter(
        (skillId) => !disabledSkillIds.includes(skillId)
      );

      await profileApiHelper.profileUpdate({
        learnSkills: validSkillIds,
      });

      const newSkills = validSkillIds.filter(
        (id) => !initialLearnSkills.includes(id)
      );
      const removedSkills = initialLearnSkills.filter(
        (id) => !validSkillIds.includes(id)
      );

      for (const skillId of newSkills) {
        await postApiHelper.createLearnPost(skillId);
      }

      if (removedSkills.length > 0) {
        const posts = await postApiHelper.getLearnPost();
        for (const skillId of removedSkills) {
          const postToDelete = posts.find(
            (post) => post.learnSkill._id === skillId && post.fromUser._id === userId
          );
          if (postToDelete) {
            await postApiHelper.deleteLearnPost(postToDelete._id);
          }
        }
      }

      setIsLoading(false);
      navigate('/profile/skills/teach');
    } catch (err: any) {
      console.error('Failed to update skills:', err);
      if (err?.error === 'Unauthorized') {
        navigate('/auth');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-[#e0f2ff] to-[#f8fafc]">
        <RotateLoader color="#3178C6" size={18} />
      </div>
    );
  }

  const visibleSkills = skills.filter((skill) => {
    const isExcluded =
      excludeSkillIds.includes(skill._id) || disabledSkillIds.includes(skill._id);
    const matchesSearch = skill.name.toLowerCase().includes(search.toLowerCase());
    const matchesTags =
      selectedTags.length === 0 || skill.tags.some((tag) => selectedTags.includes(tag));
    return !isExcluded && matchesSearch && matchesTags;
  });

  return (
    <div className="w-full px-4 sm:px-6 md:px-10 h-full flex justify-center items-center bg-gradient-to-br from-[#e0f2ff] to-[#f8fafc]">
      <form
        method="post"
        onSubmit={handleSubmit}
        className="w-full max-w-6xl mt-2 mb-10 rounded-3xl overflow-y-auto bg-white shadow-2xl px-4 sm:px-6 md:px-10 py-8 flex flex-col items-center"
      >
        <div className="w-full h-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-4">
            <h4 className="text-lg sm:text-2xl font-semibold text-[grey]">
              Please Select the skills you want to learn.
            </h4>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                className="w-full sm:w-32 px-4 py-2 bg-green-600 text-white rounded-lg cursor-pointer font-medium hover:bg-green-700 transition"
              >
                Next
              </button>
            </div>
          </div>

          <input
            className="w-full p-2 text-sm sm:text-base mt-2 border border-[grey] outline-[#3178C6] rounded-lg"
            type="text"
            placeholder="Eg: Web Development, Video Editing, etc..."
            value={search}
            onChange={handleSearchChange}
          />

          <div className="flex flex-wrap gap-2 mt-2">
            {allTags.map((tag, idx) => (
              <span
                key={idx}
                onClick={() => handleTagClick(tag)}
                className={`cursor-pointer px-3 py-1 rounded-full border text-xs transition 
                  ${selectedTags.includes(tag)
                    ? 'bg-[#3178C6] text-white border-[#3178C6]'
                    : 'bg-[#f0f4f8] text-[#3178C6] border-[#e0f2ff] hover:bg-[#3178C6] hover:text-white'}`}
              >
                {tag}
              </span>
            ))}
            {(selectedTags.length > 0 || search) && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="ml-2 px-3 py-1 rounded-full border text-xs bg-red-100 text-red-600 border-red-200 hover:bg-red-200 transition"
              >
                Clear Filters
              </button>
            )}
          </div>

          <h4 className="w-full flex justify-end mt-3 text-sm sm:text-base">
            Selected Skills: {selectedSkillIds.length}
          </h4>

          <div className="skills grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 py-4 px-2">
            {visibleSkills.length === 0 ? (
              <div className="text-gray-400 text-center w-full p-4">
                No matching skills available.
              </div>
            ) : (
              visibleSkills.map((skill) => (
                <div
                  key={skill._id}
                  onClick={() => handleSelectedSkills(skill._id)}
                  className="cursor-pointer"
                >
                  <SkillCard
                    skill={skill}
                    isSelected={selectedSkillIds.includes(skill._id)}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default LearnSkillSelectPage;
