import { SiPython, SiHtml5, SiNodedotjs, SiGoogleanalytics, SiCanva, SiAdobephotoshop, SiFigma, SiGithub } from 'react-icons/si';
import { FaGuitar, FaMicrophoneAlt, FaPaintBrush, FaPenFancy, FaCamera, FaUtensils, FaMoneyBillAlt, FaUserTie, FaTree, FaBrain, FaHandsHelping } from 'react-icons/fa';
import { GiCookingPot, GiMeditation } from 'react-icons/gi';
import { MdOutlineDraw, MdFitnessCenter } from 'react-icons/md';
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
    name: "Video Editing",
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
];

export default Skills;