import { FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import LogoPng2 from '../assets/logopng2.png'

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="w-full mb-2  px-4">
      <div className="max-w-6xl mx-auto rounded-xl border border-[#fdecea66] bg-[#fdecea80] backdrop-blur-lg shadow-[0_8px_24px_0_rgba(31,38,135,0.1)] transition-all duration-300">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 px-6 py-6 text-sm text-gray-800">
          
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <img src={LogoPng2} alt="ExchangeIQ Logo" className="w-auto h-10 drop-shadow" />
          </div>

          {/* Navigation Links */}
          <div className="flex space-x-6 text-sm">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate('/documentation');
              }}
              className="hover:text-blue-500 font-medium transition"
            >
              Docs
            </a>
            <a href="#" className="hover:text-blue-500 font-medium transition">Features</a>
            <a href="#" className="hover:text-blue-500 font-medium transition">About</a>
          </div>

          {/* Contact Icons */}
          <div className="flex items-center space-x-5 text-lg text-gray-700">
            <a
              href="https://github.com/codesbyvikas/ExchangeIQ"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-500 transition"
            >
              <FaGithub />
            </a>
            <a
              href="https://linkedin.com/in/vikaskewat"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-500 transition"
            >
              <FaLinkedin />
            </a>
            <a
              href="mailto:vikaskewat025@gmail.com"
              className="hover:text-blue-500 transition"
            >
              <FaEnvelope />
            </a>
          </div>
        </div>

        <div className="text-center text-xs text-gray-600 pb-2">
          © {new Date().getFullYear()} <span className="text-[#3178C6] font-medium">ExchangeIQ</span>. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
