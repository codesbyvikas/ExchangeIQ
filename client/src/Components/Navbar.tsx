import { Link, useNavigate } from 'react-router-dom';
import Logo from '../assets/logopng.png';
import Avatar from '../assets/Avatar.png';
import { useEffect, useState } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';
import profileApiHelper from '../utils/api/profileApiHelper';
import authApiHelper from '../utils/api/authApiHelper';
import type { UserType } from '../utils/types/user';

const Navbar = () => {
  const [user, setUser] = useState<UserType | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    if (user) {
      navigate(`/profile`);
    } else {
      navigate('/auth');
    }
  };

  const handleLogout = async () => {
      try {
        await authApiHelper.logout(); 
        localStorage.removeItem('token');
        setUser(null);
        navigate('/auth');
      } catch (error) {
        console.error('Logout failed:', error);
      }
    };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await profileApiHelper.getSelfProfile();
        setUser(data);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };
    fetchUserData();
  }, []);

  return (
    <div className="w-full bg-[#E0F2FF] relative">
      {/* Top Section */}
      <div className="w-full pr-10 max-sm:pr-0 flex justify-between items-center">
        <div className="pl-4 max-sm:pl-2 flex flex-col">
          <img className="w-60 h-20 object-cover" src={Logo} alt="ExchangeIQ Logo" />
          <h2
            className="font-bold ml-10 max-sm:ml-4 text-xl text-[#3178C6] mb-2 cursor-pointer hover:underline transition"
            onClick={handleClick}
          >
            <span>{user ? `Hello, ${user.name}` : 'Please login'}</span>
          </h2>
        </div>

        {/* User Profile */}
        {user && (
          <div className="hidden sm:flex text-right flex-col items-end">
            <button onClick={() => navigate("/profile")}>
              <img
                className="w-14 h-14 rounded-full object-cover cursor-pointer"
                src={user.photo || Avatar}
                alt={user.name || 'Avatar'}
              />
            </button>
            <button
              onClick={handleLogout}
              className="mt-2 cursor-pointer px-4 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        )}

        {/* Mobile Menu Icon */}
        <div className="sm:hidden pr-4">
          <button onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
      </div>

      {/* Desktop Menu */}
      <div className="w-full hidden sm:flex justify-center absolute top-5">
        <ul className="overflow-hidden font-semibold bg-[#ffffffb0] rounded-lg flex">
          <Link className="px-6 py-2 hover:bg-[#3178C6] hover:text-white border-r-[1px]" to="/">
            <li>Home</li>
          </Link>
          <Link className="px-6 py-2 hover:bg-[#3178C6] hover:text-white border-r-[1px]" to="/invitations">
            <li>Invitations</li>
          </Link>
          <Link className="px-6 py-2 hover:bg-[#3178C6] hover:text-white border-r-[1px]" to="/chat">
            <li>Chats</li>
          </Link>
          <Link className="px-6 py-2 hover:bg-[#3178C6] hover:text-white" to="/skills">
            <li>Skills</li>
          </Link>
        </ul>
      </div>

      {/* Mobile Menu Items */}
      {menuOpen && (
        <div className="sm:hidden px-4 pb-4 pt-2">
          <ul className="flex flex-col gap-1 font-semibold bg-[#ffffffb0] rounded-lg">
            <Link to="/" onClick={() => setMenuOpen(false)} className="px-4 py-2 hover:bg-[#3178C6] hover:text-white">
              <li>Home</li>
            </Link>
            <Link to="/invitations" onClick={() => setMenuOpen(false)} className="px-4 py-2 hover:bg-[#3178C6] hover:text-white">
              <li>Invitations</li>
            </Link>
            <Link to="/chat" onClick={() => setMenuOpen(false)} className="px-4 py-2 hover:bg-[#3178C6] hover:text-white">
              <li>Chats</li>
            </Link>
            <Link to="/skills" onClick={() => setMenuOpen(false)} className="px-4 py-2 hover:bg-[#3178C6] hover:text-white">
              <li>Skills</li>
            </Link>
            {user && (
              <>
                <Link to="/profile" onClick={() => setMenuOpen(false)} className="px-4 py-2 hover:underline">
                  <li>Profile</li>
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMenuOpen(false);
                  }}
                  className="px-4 py-2 text-left text-red-600 hover:underline"
                >
                  Logout
                </button>
              </>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Navbar;
