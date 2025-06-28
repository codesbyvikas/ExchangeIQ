import { Link, useNavigate } from 'react-router-dom'
import Logo from '../assets/logopng.png'
import Avatar from '../assets/Avatar.png'
import { useEffect, useState } from 'react'
import profileApiHelper from '../utils/api/profileApi'
import type { UserType } from '../utils/types/user'


const Navbar = () => {
  const [user, setUser] = useState<UserType | null>(null);
  const navigate = useNavigate();
  const handleClick = () => {
    if (user) {
      navigate('/profile');
    } else {
      navigate('/auth');
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
        try {
          const data = await profileApiHelper.getProfile();
          setUser(data);
        } catch (error) {
          console.error('Failed to fetch user:', error);
        }
      };

      fetchUserData();
    }, []);

  return (
    <div className='w-full bg-[#E0F2FF]'>
      {/* Top bar: Logo + Name | Avatar */}
      <div className='w-full pr-10 flex justify-between items-center'>
        {/* Logo and Name vertically stacked */}
        <div className='pl-4 flex flex-col'>
          <img className='w-60 h-20 object-cover' src={Logo} alt="ExchangeIQ Logo" />
           <h2
              className="font-bold ml-10 text-xl text-[#3178C6] mb-2 cursor-pointer hover:underline transition"
              onClick={handleClick}
            >
              <span>{user ? `Hello, ${user.name}` : 'Please login'}</span>
            </h2>
        </div>

        <div className="rounded-2xl shadow-lg  cursor-pointer ">
          {/* Avatar */}
          <Link to="/profile">
            <img
              className="w-14 h-14 rounded-full object-cover"
              src={user?.photo || Avatar}
              alt={user?.name || 'Avatar'}
            />
          </Link>
        </div>
        
      </div>

      {/* Navigation Menu */}
      <div className='w-full flex justify-center absolute top-5'>
        <ul className='overflow-hidden font-semibold bg-[#ffffffb0] rounded-lg flex'>
          <Link className='px-6 py-2 hover:bg-[#3178C6] hover:text-white border-r-[1px]' to="/"><li>Home</li></Link>
          <Link className='px-6 py-2 hover:bg-[#3178C6] hover:text-white border-r-[1px]' to="/explore"><li>Explore</li></Link>
          <Link className='px-6 py-2 hover:bg-[#3178C6] hover:text-white border-r-[1px]' to="/friends"><li>Friends</li></Link>
          <Link className='px-6 py-2 hover:bg-[#3178C6] hover:text-white' to="/skills"><li>Skills</li></Link>
        </ul>
      </div>
    </div>
  )
}

export default Navbar
