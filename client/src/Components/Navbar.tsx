import { Link } from 'react-router-dom'
import Logo from '../assets/logopng.png'
import Avatar from '../assets/Avatar.png'

const Navbar = () => {
    return (
        <div className='w-full'>
            <div className='w-full pr-10 flex justify-between items-center'>
                <img className='w-60 h-20 object-cover' src={Logo} alt="" />
                <Link to="/profile"><img className='w-14 h-14' src={Avatar} alt="" /></Link>
            </div>
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