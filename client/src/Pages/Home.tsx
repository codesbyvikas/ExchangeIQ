import Navbar from '../Components/Navbar'
import Skills from '../Components/Skills.tsx'
import SkillCard from '../Components/SkillCard' 

const Home = () => {
    return (
        <>
            <Navbar />
            <div className='w-full flex justify-center'>
                <div className='w-11/12 h-dvh px-8 py-4 bg-[#ffffffb0] rounded-lg'>
                    <h2 className='mb-4 font-bold text-4xl'>Hello, John</h2>
                    <div className='w-full h-auto'>
                        <h4 className='font-semibold text-3xl mb-2'>Skills You Can Learn</h4>
                        <div className='skills w-full flex gap-6 overflow-x-auto py-4 px-2'>
                            {Skills.map((skill, idx) => (
                                <SkillCard key={idx} skill={skill} /> 
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Home
