import Navbar from '../Components/Navbar';
import Skills from '../utils/data/Skills.tsx';
import ExchangeSkillCard from '../Components/ExchangeSkillCard.tsx';
import LearnSkillCard from '../Components/LearnSkillCard.tsx';

const Home = () => {
  return (
    <div className="relative h-screen w-full overflow-hidden">
      <div className="fixed top-0 left-0 w-full z-50 bg-white">
        <Navbar />
      </div>
      

      <div className="pt-[130px] overflow-y-auto h-full w-full flex justify-center">
        <div className="w-11/12 h-auto px-4 pb-10 flex flex-col gap-10">
          {/* Exchange Section */}
          <div className="bg-[#ffffffb0] rounded-lg px-6 py-4 shadow-md">
            <h4 className="font-semibold text-3xl mb-2">Skills You Can Exchange</h4>
            <div className="skills w-full flex gap-6 overflow-x-auto py-4">
              {Skills.map((skill, idx) => (
                <ExchangeSkillCard key={idx} skill={skill} />
              ))}
            </div>
          </div>

          {/* Learn Section */}
          <div className="bg-[#ffffffb0] rounded-lg px-6 py-4 shadow-md">
            <h4 className="font-semibold text-3xl mb-2">Skills You Can Learn</h4>
            <div className="skills w-full flex gap-6 overflow-x-auto py-4">
              {Skills.map((skill, idx) => (
                <LearnSkillCard key={idx} skill={skill} />
              ))}
            </div>
          </div>

          {/* Teach Section */}
         <div className="bg-[#ffffffb0] rounded-lg px-6 py-4 shadow-md">
            <h4 className="font-semibold text-3xl mb-2">Skills You Can Teach</h4>
            <div className="skills w-full flex gap-6 overflow-x-auto py-4">
              {Skills.map((skill, idx) => (
                <LearnSkillCard key={idx} skill={skill} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
