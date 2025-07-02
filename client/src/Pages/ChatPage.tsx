import { FaFolder } from "react-icons/fa"
import Navbar from "../Components/Navbar"

const ChatPage = () => {
  return (
    <div className="relative h-screen w-full overflow-y-auto">
      <div className="fixed top-0 left-0 w-full z-50 bg-white">
        <Navbar />
      </div>
      <aside className="w-64 border-r border-grey-800 p-4 bg-[#d1117">
        <div className="flex items-center justify-between mb-6">
            <FaFolder className="w-5 h-5 texy-grey-400" />
            <h2 className="text-lg font semibold"> VIkas</h2>
        </div>
      </aside>
    </div>
  )
}

export default ChatPage
