import Avatar from '../assets/Avatar.png'

const Profile = () => {
    return (
        <div className="w-full h-full flex justify-center items-center bg-gradient-to-br from-[#e0f2ff] to-[#f8fafc]">
            <form
                method="post"
                className="w-full max-w-xl h-dvh overflow-y-auto bg-white shadow-2xl px-10 py-8 flex flex-col items-center"
            >
                <label className="flex flex-col items-center justify-center mb-4 cursor-pointer group" htmlFor="photo">
                    <div className="relative">
                        <img
                            src={Avatar}
                            className="w-32 h-32 rounded-full border-4 border-[#3178C6] shadow group-hover:opacity-80 transition"
                            alt="Avatar"
                        />
                        <span className="absolute bottom-2 right-2 bg-[#3178C6] text-white text-xs px-2 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition">
                            Change
                        </span>
                    </div>
                    <input type="file" name="photo" id="photo" hidden />
                </label>
                <h4 className="mb-6 font-bold text-3xl text-[#3178C6]">Create Your Profile</h4>
                <div className="w-full flex gap-4 mb-4">
                    <div className="w-1/2">
                        <label className="font-semibold text-lg mb-1 block" htmlFor="fname">
                            First Name
                        </label>
                        <input
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3178C6] transition"
                            type="text"
                            placeholder="John"
                            id="fname"
                        />
                    </div>
                    <div className="w-1/2">
                        <label className="font-semibold text-lg mb-1 block" htmlFor="lname">
                            Last Name
                        </label>
                        <input
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3178C6] transition"
                            type="text"
                            placeholder="Doe"
                            id="lname"
                        />
                    </div>
                </div>
                <div className="w-full mb-4">
                    <label className="font-semibold text-lg mb-1 block" htmlFor="uname">
                        Username
                    </label>
                    <input
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3178C6] transition"
                        type="text"
                        placeholder="JohnDoe#123"
                        id="uname"
                    />
                </div>
                <div className="w-full mb-6">
                    <label className="font-semibold text-lg mb-1 block" htmlFor="bio">
                        Bio
                    </label>
                    <textarea
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3178C6] transition resize-none"
                        placeholder="I am the greatest Chess player alive"
                        id="bio"
                        rows={3}
                    />
                </div>
                <button
                    className="w-full py-3 bg-[#3178C6] text-white rounded-lg font-semibold shadow cursor-pointer hover:bg-[#225a8c] transition"
                    type="submit"
                >
                    Submit
                </button>
            </form>
        </div>
    )
}

export default Profile