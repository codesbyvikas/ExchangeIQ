import { Link } from 'react-router-dom';
import { FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa';
import Logo from '../assets/logopng.png';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-10 px-6 md:px-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">

        {/* Logo and Description */}
        <div className="col-span-1">
          <img src={Logo} alt="ExchangeIQ Logo" className="h-10 mb-4" />
          <p className="text-sm text-gray-400">
            ExchangeIQ is your platform to learn, teach, and grow — one skill at a time.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><Link to="/" className="hover:text-white">Home</Link></li>
            <li><Link to="/about" className="hover:text-white">About</Link></li>
            <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
          </ul>
        </div>

        {/* Skill Categories */}
        <div>
          <h3 className="font-semibold mb-4">Skill Categories</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>Technical</li>
            <li>Creative</li>
            <li>Career & Life</li>
            <li>Remote-friendly</li>
          </ul>
        </div>

        {/* Social & Legal */}
        <div>
          <h3 className="font-semibold mb-4">Follow Us</h3>
          <div className="flex space-x-4 text-gray-400">
            <a href="#" aria-label="GitHub" className="hover:text-white"><FaGithub /></a>
            <a href="#" aria-label="LinkedIn" className="hover:text-white"><FaLinkedin /></a>
            <a href="#" aria-label="Twitter" className="hover:text-white"><FaTwitter /></a>
          </div>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} ExchangeIQ. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
