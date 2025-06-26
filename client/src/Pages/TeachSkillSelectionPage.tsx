import React, { useState } from 'react'
import Skills from '../utils/data/Skills.tsx';
import type { Skill } from '../utils/data/Skills.tsx';
import apiHelper from '../utils/api/profile/profileApi.tsx';
import { useNavigate } from 'react-router-dom';

const getAllTags = (skills: Skill[]): string[] => {
  const tags = new Set<string>();
  skills.forEach(skill => skill.tags.forEach(tag => tags.add(tag)));
  return Array.from(tags);
};
const TeachSkillSelectionPage = () => {
  const [search, setSearch] = useState<string>('')
    const [selectedTags, setSelectedTags] = useState<string[]>([])
    const [selectedTeachSkillNames, setSelectedTeachSkillNames] = useState<string[]>([]);
    const [selectedTeachSkills, setTeachSelectedSkills] = useState<number>(0);

    const allTags = getAllTags(Skills)
    const navigate = useNavigate();

    const handleTagClick = (tag: string): void => {
            setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
            );
        };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    }


    const handleClearFilters = () => {
        setSearch('')
        setSelectedTags([])
    }

    const filteredSkills = Skills.filter(skill => {
        const matchesSearch = skill.name.toLowerCase().includes(search.toLowerCase())
        const matchesTags = selectedTags.length === 0 || skill.tags.some(tag => selectedTags.includes(tag))
        return matchesSearch && matchesTags
    })

    // Add/remove skill from selectedSkills
    const handleSelectedSkills = (skillName:string) => {
        setSelectedTeachSkillNames(prev => {
            if (prev.includes(skillName)) {
                setTeachSelectedSkills(count => count - 1)
                return prev.filter(name => name !== skillName)
            } else {
                setTeachSelectedSkills(count => count + 1)
                return [...prev, skillName]
            }
        })
    }

     const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            console.log("clicked handle")

            try {
            await apiHelper.profileUpdate({
                teachSkills: selectedTeachSkillNames,
            });

            // 👇 Redirect to next step: skill learn page
            navigate('/profile/skills/learn');
            } catch (err) {
            console.error("Failed to update skills:", err);
            // TODO: show error toast or message
            }
        };

   

    return (
            <div className="w-full h-full flex justify-center items-center bg-gradient-to-br from-[#e0f2ff] to-[#f8fafc]">
                <form
                    method="post"
                    className="w-full max-w-6xl mt-10 h-dvh rounded-3xl shadow-lg overflow-y-auto bg-white shadow-2xl px-10 py-8 flex flex-col items-center"
                >
                    <div className='w-full h-auto'>
                        <h4 className='font-semibold text-2xl mb-2 text-[grey]'>Please Select the skills you can teach.</h4>
                        <input
                            className='w-full p-2 mt-2 border border-[grey] outline-[#3178C6] rounded-lg'
                            type="text"
                            placeholder='Eg: Web Development, Video Editing, etc...'
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
                                            : 'bg-[#f0f4f8] text-[#3178C6] border-[#e0f2ff] hover:bg-[#3178C6] hover:text-white'}
                                `}
                                >
                                    {tag}
                                </span>
                            ))}
                            {selectedTags.length > 0 || search ? (
                                <button
                                    type="button"
                                    onClick={handleClearFilters}
                                    className="ml-2 px-3 py-1 rounded-full border text-xs bg-red-100 text-red-600 border-red-200 hover:bg-red-200 transition"
                                >
                                    Clear Filters
                                </button>
                            ) : null}
                        </div>
                        <h4 className='w-full flex justify-end mt-3'>
                            Selected Skills: {selectedTeachSkills}
                        </h4>
                        <div className='skills w-full grid gap-2 grid-cols-2 md:grid-cols-3 py-4 px-2'>
                            {filteredSkills.length === 0 ? (
                                <div className="text-gray-400 text-center w-full p-39 m">No skills found.</div>
                            ) : (
                                filteredSkills.map((skill, idx) => (
                                    <div
                                        key={idx}
                                        className='relative p-6 bg-white flex flex-col items-center gap-4 rounded-2xl shadow-lg transition-transform cursor-pointer hover:-translate-y-1'
                                    >
                                        <div className='flex items-center justify-center w-16 h-16 rounded-full bg-[#e0f2ff] text-5xl mb-2'>
                                            {skill.icon}
                                        </div>
                                        <h2 className='text-sm font-semibold text-gray-800'>{skill.name}</h2>
                                        <div className='flex flex-wrap gap-2 mb-10'>
                                            {skill.tags.map((tag, i) => (
                                                <span
                                                    key={i}
                                                    onClick={() => handleTagClick(tag)}
                                                    className={`cursor-pointer bg-[#f0f4f8] text-xs px-2 py-1 rounded-sm
                                                    ${selectedTags.includes(tag) ? 'bg-[#3178C6] text-white' : 'text-[#3178C6] hover:bg-[#3178C6] hover:text-white'}
                                                `}
                                                >
                                                    {tag.trim()}
                                                </span>
                                            ))}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleSelectedSkills(skill.name)}
                                            className={`w-10/12 p-2 absolute bottom-4 left-1/2 -translate-x-1/2 rounded-lg font-semibold shadow transition cursor-pointer
                                            ${selectedTeachSkillNames.includes(skill.name)
                                                    ? 'bg-green-500 text-white hover:bg-green-600'
                                                    : 'bg-[#3178C6] text-white hover:bg-[#225a8c]'}
                                        `}
                                        >
                                            {selectedTeachSkillNames.includes(skill.name) ? 'Selected' : 'Select'}
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                        
                    </div>

                    <button
                        onClick={handleSubmit}
                        className="w-80 py-3 fixed bottom-4 bg-[#3178C6] text-white rounded-lg font-semibold shadow cursor-pointer hover:bg-[#225a8c] transition"
                        type="submit"
                    >
                        Next
                    </button>
                    
                </form>
               
            </div>
        )
    }

export default TeachSkillSelectionPage