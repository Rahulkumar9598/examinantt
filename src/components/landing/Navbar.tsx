import { useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useState } from 'react';
import logo from '../../assets/logo.png';

const Navbar = () => {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navItems = [
        { label: 'Home', path: '/' },
        { label: 'Test Series', path: '/test-series' },
        { label: 'Free Resources', path: '/resources' },
        { label: 'Result', path: '/results' },
        { label: 'About', path: '/about' },
    ];

    return (
        <nav className="fixed top-0 w-full z-50 glass-nav shadow-sm transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                        <img src={logo} alt="Examinantt Logo" className="h-10 w-auto rounded-lg" />
                        <span className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500 tracking-tight">
                            Examinantt
                        </span>
                    </div>

                    {/* Desktop Links */}
                    <div className="hidden md:flex items-center gap-8">
                        {navItems.map((item) => (
                            <button
                                key={item.label}
                                onClick={() => navigate(item.path)}
                                className="text-gray-600 font-medium hover:text-blue-600 transition-colors relative group"
                            >
                                {item.label}
                                <span className="absolute bottom-[-4px] left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
                            </button>
                        ))}
                    </div>

                    {/* Auth Button */}
                    <div className="hidden md:block">
                        <button
                            onClick={() => navigate('/login')}
                            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-2.5 rounded-full font-bold shadow-lg shadow-orange-500/30 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
                        >
                            Login / Register
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-700 hover:text-blue-600">
                            <Menu size={28} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            <div className={`md:hidden absolute top-16 left-0 w-full bg-white border-t border-gray-100 shadow-lg transition-all duration-300 ease-in-out transform origin-top ${mobileMenuOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 pointer-events-none'}`}>
                <div className="px-4 pt-2 pb-6 space-y-2">
                    {navItems.map((item) => (
                        <button
                            key={item.label}
                            onClick={() => {
                                navigate(item.path);
                                setMobileMenuOpen(false);
                            }}
                            className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                        >
                            {item.label}
                        </button>
                    ))}
                    <button
                        onClick={() => navigate('/login')}
                        className="w-full mt-4 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-3 rounded-lg font-bold shadow-md hover:shadow-lg transition-all"
                    >
                        Login / Register
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
