import { SiPython, SiHtml5, SiNodedotjs, SiGoogleanalytics, SiCanva, SiAdobephotoshop, SiFigma, SiGithub, SiJavascript,  } from 'react-icons/si';
import { FaGuitar, FaMicrophoneAlt, FaPaintBrush, FaPenFancy, FaCamera, FaUtensils, FaMoneyBillAlt, FaUserTie, FaTree, FaBrain, FaHandsHelping, FaLanguage, FaBookOpen, FaRegKeyboard, FaCode, FaChalkboardTeacher, FaRegLightbulb  } from 'react-icons/fa';
import { GiPublicSpeaker, GiTeacher, GiPerspectiveDiceSixFacesRandom } from 'react-icons/gi';
import { GiCookingPot, GiMeditation } from 'react-icons/gi';
import { MdOutlineDraw, MdFitnessCenter } from 'react-icons/md';
import { MdOutlineScience, MdOutlineTravelExplore } from 'react-icons/md';
import type { JSX } from 'react';

export interface Skill {
  name: string;
  tags: string[];
  icon: JSX.Element;
}

const Skills: Skill[] = [
  {
    name: "Python Programming",
    tags: ["Tech", "Coding", "Remote"],
    icon: <SiPython color="#3776AB" size={32} />, 
  },
  {
    name: "Web Development",
    tags: ["Tech", "Frontend", "Remote"],
    icon: <SiHtml5 color="#E34F26" size={32} />, 
  },
  {
    name: "NodeJs",
    tags: ["Tech", "Backend", "Remote"],
    icon: <SiNodedotjs color="#339933" size={32} />,
  },
  {
    name: "Data Analysis",
    tags: ["Tech", "Excel", "Python"],
    icon: <SiGoogleanalytics color="#4285F4" size={32} />,
  },
  {
    name: "Graphic Design",
    tags: ["Creative", "Design", "Remote"],
    icon: <SiCanva color="#00C4CC" size={32} />,
  },
  {
    name: "Photoshop",
    tags: ["Creative", "YouTube", "Remote"],
    icon: <SiAdobephotoshop color="#31A8FF" size={32} />,
  },
  {
    name: "UI/UX Design",
    tags: ["Design", "Tech", "Remote"],
    icon: <SiFigma color="#A259FF" size={32} />,
  },
  {
    name: "Cybersecurity Basics",
    tags: ["Tech", "Security", "Awareness"],
    icon: <SiGithub color="#181717" size={32} />,
  },
  {
    name: "Guitar",
    tags: ["Creative", "Music", "Non-Tech"],
    icon: <FaGuitar color="#DE6FA1" size={32} />,
  },
  {
    name: "Singing",
    tags: ["Creative", "Music", "Non-Tech"],
    icon: <FaMicrophoneAlt color="#FF4F4F" size={32} />,
  },
  {
    name: "Sketching",
    tags: ["Creative", "Art", "Beginner Friendly"],
    icon: <MdOutlineDraw color="#000000" size={32} />,
  },
  {
    name: "Painting",
    tags: ["Creative", "Art", "Non-Tech"],
    icon: <FaPaintBrush color="#B7410E" size={32} />,
  },
  {
    name: "Calligraphy",
    tags: ["Creative", "Handwriting", "Non-Tech"],
    icon: <FaPenFancy color="#4B0082" size={32} />,
  },
  {
    name: "Photography",
    tags: ["Creative", "Camera", "Mobile Friendly"],
    icon: <FaCamera color="#000000" size={32} />,
  },
  {
    name: "Cooking",
    tags: ["Home Skill", "Non-Tech", "Hands-On"],
    icon: <GiCookingPot color="#8B4513" size={32} />,
  },
  {
    name: "Baking",
    tags: ["Home Skill", "Non-Tech", "Sweet Treats"],
    icon: <FaUtensils color="#FFA07A" size={32} />,
  },
  {
    name: "Personal Finance",
    tags: ["Finance", "Life Skill", "Remote"],
    icon: <FaMoneyBillAlt color="#28A745" size={32} />,
  },
  {
    name: "Mindfulness",
    tags: ["Wellbeing", "Non-Tech", "Remote"],
    icon: <GiMeditation color="#7FFFD4" size={32} />,
  },
  {
    name: "Yoga",
    tags: ["Fitness", "Non-Tech", "Body & Mind"],
    icon: <MdFitnessCenter color="#DC143C" size={32} />,
  },
  {
    name: "Gardening",
    tags: ["Nature", "Non-Tech", "Hands-On"],
    icon: <FaTree color="#228B22" size={32} />,
  },
  {
    name: "Productivity",
    tags: ["Self-Improvement", "Remote", "Life Skill"],
    icon: <FaBrain color="#6A5ACD" size={32} />,
  },
  {
    name: "DIY Repairs",
    tags: ["Hands-On", "Home", "Non-Tech"],
    icon: <FaHandsHelping color="#FFA500" size={32} />,
  },
  {
    name: "Makeup & Skincare",
    tags: ["Beauty", "Non-Tech", "Self-Care"],
    icon: <FaUserTie color="#FF69B4" size={32} />,
  },
  {
    name: "Public Speaking",
    tags: ["Communication", "Confidence", "Remote"],
    icon: <GiPublicSpeaker color="#f59e0b" size={32} />,
  },
  {
    name: "Spoken English",
    tags: ["Language", "Communication", "Remote"],
    icon: <FaLanguage color="#0077b6" size={32} />,
  },
  // {
  //   name: "Presentation Skills",
  //   tags: ["Soft Skills", "Professional", "Remote"],
  //   icon: <SiMicrosoftpowerpoint color="#b7472a" size={32} />,
  // },
  // {
  //   name: "Microsoft Excel",
  //   tags: ["Productivity", "Office", "Remote"],
  //   icon: <SiMicrosoftexcel color="#217346" size={32} />,
  // },
  // {
  //   name: "Microsoft Word",
  //   tags: ["Productivity", "Office", "Remote"],
  //   icon: <SiMicrosoftword color="#2B579A" size={32} />,
  // },
  {
    name: "Typing Skills",
    tags: ["Basic Skill", "Remote", "Work Ready"],
    icon: <FaRegKeyboard color="#1e293b" size={32} />,
  },
  {
    name: "Mathematics Tutoring",
    tags: ["Academics", "Remote", "Study Help"],
    icon: <FaBookOpen color="#d97706" size={32} />,
  },
  {
    name: "Science Tutoring",
    tags: ["Academics", "Remote", "Study Help"],
    icon: <MdOutlineScience color="#7c3aed" size={32} />,
  },
  {
    name: "JavaScript Programming",
    tags: ["Tech", "Coding", "Frontend"],
    icon: <SiJavascript color="#f7df1e" size={32} />,
  },
  {
    name: "Debugging Help",
    tags: ["Coding", "Mentorship", "Remote"],
    icon: <FaCode color="#3b82f6" size={32} />,
  },
  {
    name: "Study Techniques",
    tags: ["Self-Improvement", "Academics", "Remote"],
    icon: <FaRegLightbulb color="#fde047" size={32} />,
  },
  {
    name: "Career Guidance",
    tags: ["Mentorship", "Career", "Remote"],
    icon: <GiTeacher color="#2563eb" size={32} />,
  },
  {
    name: "Travel Planning",
    tags: ["Hobby", "Logistics", "Remote"],
    icon: <MdOutlineTravelExplore color="#16a34a" size={32} />,
  },
  {
    name: "Creative Thinking",
    tags: ["Mindset", "Problem Solving", "Remote"],
    icon: <GiPerspectiveDiceSixFacesRandom color="#8b5cf6" size={32} />,
  },
  {
    name: "Teaching Kids",
    tags: ["Soft Skills", "Patience", "Home"],
    icon: <FaChalkboardTeacher color="#ec4899" size={32} />,
  },
  {
  name: "AI/ML Basics",
  tags: ["Tech", "AI", "Machine Learning"],
  icon: <FaBrain color="#0f766e" size={32} />,
},
{
  name: "Git & GitHub",
  tags: ["Tech", "Version Control", "Remote"],
  icon: <SiGithub color="#181717" size={32} />,
},
{
  name: "Cloud Basics",
  tags: ["Tech", "Cloud", "Remote"],
  icon: <SiGoogleanalytics color="#2f80ed" size={32} />,
},
{
  name: "APIs & Postman",
  tags: ["Tech", "Integration", "Remote"],
  icon: <SiNodedotjs color="#ff6b6b" size={32} />,
},
{
  name: "Time Management",
  tags: ["Life Skill", "Productivity", "Remote"],
  icon: <FaRegLightbulb color="#ef4444" size={32} />,
},
{
  name: "Resume Building",
  tags: ["Career", "Job Prep", "Remote"],
  icon: <FaUserTie color="#8b5cf6" size={32} />,
},
{
  name: "Self-Care Routines",
  tags: ["Lifestyle", "Non-Tech", "Wellbeing"],
  icon: <FaHandsHelping color="#10b981" size={32} />,
},
{
  name: "Chess",
  tags: ["Strategy", "Mind Game", "Non-Tech"],
  icon: <FaBrain color="#334155" size={32} />,
},
{
  name: "Fantasy Football",
  tags: ["Hobby", "Sports", "Community"],
  icon: <FaUtensils color="#14b8a6" size={32} />,
},
{
  name: "Card Tricks",
  tags: ["Entertainment", "Fun", "Skill"],
  icon: <GiPerspectiveDiceSixFacesRandom color="#c026d3" size={32} />,
},
{
  name: "Origami",
  tags: ["Craft", "Art", "Hands-On"],
  icon: <FaPaintBrush color="#7c3aed" size={32} />,
},
{
  name: "Prompt Engineering",
  tags: ["AI", "ChatGPT", "Tech"],
  icon: <FaBrain color="#10b981" size={32} />,
},
{
  name: "Firebase Basics",
  tags: ["Tech", "Backend", "Cloud"],
  icon: <SiNodedotjs color="#ffa000" size={32} />,
},
{
  name: "Blockchain Basics",
  tags: ["Tech", "Web3", "Remote"],
  icon: <SiGoogleanalytics color="#4ade80" size={32} />,
},
{
  name: "Linux Commands",
  tags: ["Tech", "CLI", "Productivity"],
  icon: <FaCode color="#6366f1" size={32} />,
},
{
  name: "VS Code Shortcuts",
  tags: ["Productivity", "Coding", "Remote"],
  icon: <FaRegKeyboard color="#0ea5e9" size={32} />,
},

];

export default Skills;