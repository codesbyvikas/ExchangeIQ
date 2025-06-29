import React, { useState, useEffect } from 'react';
import type { Skill } from '../utils/types/skill';
import skillApiHelper from '../utils/api/skillApiHelper';
import profileApiHelper from '../utils/api/profileApi';
import postApiHelper from '../utils/api/postApiHelper'; // ✅ import teach post helper
import { useNavigate } from 'react-router-dom';
import SkillCard from '../Components/SkillCard';

const getAllTags = (skills: Skill[]): string[] => {
  const tags = new Set<string>();
  skills.forEach((skill) => skill.tags.forEach((tag) => tags.add(tag)));
  return Array.from(tags);
};

const TeachSkillSelectionPage = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [search, setSearch] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedTeachSkillIds, setSelectedTeachSkillIds] = useState<string[]>([]);
  const [disabledSkillIds, setDisabledSkillIds] = useState<string[]>([]);
  const [selectedTeachSkills, setTeachSelectedSkills] = useState<number>(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const data = await skillApiHelper.getAllSkills();
        setSkills(data);
        const userProfile = await profileApiHelper.getSelfProfile();
        const userSkills = userProfile.skillsToTeach;
        setSelectedTeachSkillIds(userSkills);
        setDisabledSkillIds(userSkills); // 👈 used to detect new additions
        setTeachSelectedSkills(userSkills.length);
      } catch (error) {
        console.error('Error loading skills:', error);
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

  const filteredSkills = skills.filter((skill) => {
    const matchesSearch = skill.name.toLowerCase().includes(search.toLowerCase());
    const matchesTags =
      selectedTags.length === 0 || skill.tags.some((tag) => selectedTags.includes(tag));
    return matchesSearch && matchesTags;
  });

  const handleSelectedSkills = (skillId: string | undefined) => {
    if (!skillId) return;

    setSelectedTeachSkillIds((prev) => {
      if (prev.includes(skillId)) {
        setTeachSelectedSkills((count) => count - 1);
        return prev.filter((id) => id !== skillId);
      } else {
        setTeachSelectedSkills((count) => count + 1);
        return [...prev, skillId];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await profileApiHelper.profileUpdate({
        teachSkills: selectedTeachSkillIds,
      });

      // 🆕 Create posts for new additions only
      const newTeachSkillIds = selectedTeachSkillIds.filter(
        (skillId) => !disabledSkillIds.includes(skillId)
      );

      for (const skillId of newTeachSkillIds) {
        await postApiHelper.createTeachPost(skillId); // ✅ use teach post creator
      }

      navigate('/');
    } catch (err: any) {
      console.error('Failed to update skills:', err);
      if (err?.error === 'Unauthorized') {
        navigate('/auth');
      }
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 md:px-10 h-full flex justify-center items-center bg-gradient-to-br from-[#e0f2ff] to-[#f8fafc]">
      <form
        method="post"
        className="w-full max-w-6xl mt-2 mb-10 rounded-3xl shadow-lg overflow-y-auto bg-white shadow-2xl px-4 sm:px-6 md:px-10 py-8 flex flex-col items-center"
      >
        <div className="w-full h-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-4">
            <h4 className="text-lg sm:text-2xl font-semibold text-[grey]">
              Please Select the skills you can teach.
            </h4>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                onClick={handleSubmit}
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
            Selected Skills: {selectedTeachSkills}
          </h4>

          <div className="skills grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 py-4 px-2">
            {filteredSkills.length === 0 ? (
              <div className="text-gray-400 text-center w-full p-39 m">No skills found.</div>
            ) : (
              filteredSkills.map((skill, idx) => (
                skill._id ? (
                  <div
                    key={idx}
                    onClick={() => handleSelectedSkills(skill._id)}
                    className="cursor-pointer"
                  >
                    <SkillCard
                      skill={{ ...skill }}
                      isSelected={selectedTeachSkillIds.includes(skill._id)}
                    />
                  </div>
                ) : null
              ))
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default TeachSkillSelectionPage;
