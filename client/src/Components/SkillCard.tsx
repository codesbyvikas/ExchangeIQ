import React from 'react';

export interface Skill {
  name: string;
  iconUrl: string;
  tags: string[];
}

interface SkillCardProps {
  skill: Skill;
  isSelected?: boolean;
  // showSelectButton?: boolean;
}

const SkillCard: React.FC<SkillCardProps> = ({ skill, isSelected,  }) => {
  return (
    <div className='relative w-full sm:w-80 h-64 p-6 bg-white flex flex-col items-center gap-4 rounded-2xl shadow-lg transition-transform cursor-pointer hover:-translate-y-2'>
      <div className='flex items-center justify-center w-16 h-16 rounded-full bg-[#e0f2ff]'>
        <img
          src={skill.iconUrl}
          className='w-full h-full object-cover rounded-full'
          alt={`${skill.name} icon`}
        />
      </div>
      <h2 className='text-xl sm:text-2xl font-semibold text-gray-800 text-center'>{skill.name}</h2>
      <div className='flex flex-wrap gap-2 justify-center'>
        {skill.tags.map((tag, i) => (
          <span
            key={i}
            className='bg-[#f0f4f8] text-xs text-[#3178C6] px-2 py-1 rounded hover:bg-[#3178C6] hover:text-white'
          >
            {tag.trim()}
          </span>
        ))}
      </div>
     
        <button type='button'
          className={`w-40 p-2 absolute bottom-4 left-1/2 -translate-x-1/2 rounded-lg font-semibold shadow transition cursor-pointer
            ${isSelected
              ? 'bg-green-500 text-white hover:bg-green-600'
              : 'bg-[#3178C6] text-white hover:bg-[#225a8c]'}
          `}
        >
          {isSelected ? 'Selected' : 'Select'}
        </button>
   
    </div>
  );
};

export default SkillCard;
