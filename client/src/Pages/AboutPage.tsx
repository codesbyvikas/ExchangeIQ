import { FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

const AboutPage = () => {
  return (
    <div className="flex flex-col min-h-dvh">
      {/* Sticky Navbar */}
      <div className="fixed top-0 left-0 w-full z-50 bg-white shadow">
        <Navbar />
      </div>

      {/* Main Content */}
      <div className="flex-1 mt-20 px-6 py-10 max-w-3xl mx-auto text-gray-800 space-y-10">
        {/* About Section */}
        <h1 className="text-4xl font-bold text-indigo-700 text-center">👨‍💻 About the Creator</h1>

        <div className="text-lg space-y-4">
          <p>
            Hi, I’m <strong>Vikas Kewat</strong> — a passionate software engineer and full-stack developer from India.
            I built <strong>ExchangeIQ</strong> to make skill-sharing more accessible, interactive, and meaningful.
          </p>

          <p>
            I specialize in full-stack development using the <strong>MERN stack & Flutter</strong>, and enjoy
            working on projects that blend real-time communication, collaborative learning, and scalable cloud
            infrastructure.
          </p>

          <p>Let’s connect and collaborate!</p>
        </div>

        {/* Social Links */}
        <div className="flex justify-center space-x-6 mt-6 text-2xl text-indigo-600">
          <a href="https://github.com/codesbyvikas" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
            <FaGithub />
          </a>
          <a href="https://linkedin.com/in/vikaskewat" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
            <FaLinkedin />
          </a>
          <a href="https://twitter.com/codesbyvikas" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
            <FaTwitter />
          </a>
        </div>

        {/* Connect With Me Section */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-center text-indigo-700 mb-6">📬 Connect with Me</h2>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 shadow space-y-4">
            <div className="flex items-center space-x-2 text-lg">
              <MdEmail className="text-indigo-600 text-2xl" />
              <span>Email: </span>
              <a
                href="mailto:vikaskewat.dev@gmail.com"
                className="text-indigo-600 underline hover:text-indigo-800"
              >
                vikaskewat025@gmail.com
              </a>
            </div>

            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex flex-col space-y-4 mt-4"
            >
              <label className="text-sm font-semibold">Your Message (optional)</label>
              <textarea
                rows={4}
                className="border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                placeholder="Write your message here..."
              />

              <button
                type="submit"
                className="self-start bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition"
              >
                Send Message
              </button>
            </form>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default AboutPage;
