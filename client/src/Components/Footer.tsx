import { FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="w-full mt-16 px-4">
      <div className="max-w-6xl mx-auto rounded-xl border border-[#a0c4ff50] bg-[#FDECEA] backdrop-blur-lg shadow-[0_8px_32px_0_rgba(31,38,135,0.2)] transition-all duration-300">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 px-6 py-6 text-sm text-gray-800">
          
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <img src="src/assets/logopng2.png" alt="ExchangeIQ Logo" className="w-auto h-10 drop-shadow" />
          </div>

          {/* Navigation Links */}
          <div className="flex space-x-6 text-sm">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate('/documentation');
              }}
              className="hover:text-purple-600 font-medium transition"
            >
              Docs
            </a>
            <a href="#" className="hover:text-purple-600 font-medium transition">Features</a>
            <a href="#" className="hover:text-purple-600 font-medium transition">About</a>
          </div>

          {/* Contact Icons */}
          <div className="flex items-center space-x-5 text-lg text-gray-700">
            <a
              href="https://github.com/codesbyvikas/GitChat"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-purple-600 transition"
            >
              <FaGithub />
            </a>
            <a
              href="https://linkedin.com/in/vikaskewat"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-purple-600 transition"
            >
              <FaLinkedin />
            </a>
            <a
              href="mailto:vikaskewat025@gmail.com"
              className="hover:text-purple-600 transition"
            >
              <FaEnvelope />
            </a>
          </div>
        </div>

        <div className="text-center text-xs text-gray-600 pb-4">
          © {new Date().getFullYear()} <span className="text-[#3178C6] font-medium">ExchangeIQ</span>. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
