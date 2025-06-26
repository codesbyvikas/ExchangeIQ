import React from 'react'

// Define the Skill interface
export interface Skill {
  name: string;
  icon: string;
  tags: string[];
}

// Destructure the `skill` prop and type it
const SkillCard: React.FC<{ skill: Skill }> = ({ skill }) => {
  return (
    <div
      className='relative w-80 min-w-80 h-64 p-6 bg-white flex flex-col items-center gap-4 rounded-2xl shadow-lg transition-transform cursor-pointer hover:-translate-y-2'
    >
      <div className='flex items-center justify-center w-16 h-16 rounded-full bg-[#e0f2ff] text-5xl mb-2'>
        {skill.icon}
      </div>
      <h2 className='text-2xl font-semibold text-gray-800'>{skill.name}</h2>
      <div className='flex flex-wrap gap-2 mb-8'>
        {skill.tags.map((tag, i) => (
          <span
            key={i}
            className='bg-[#f0f4f8] text-xs text-[#3178C6] px-2 py-1 rounded hover:bg-[#3178C6] hover:text-white'
          >
            {tag.trim()}
          </span>
        ))}
      </div>
      <button className='w-40 p-2 absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#3178C6] text-white rounded-lg font-semibold shadow hover:bg-[#225a8c] transition cursor-pointer'>
        Request Exchange
      </button>
    </div>
  )
}

export default SkillCard
