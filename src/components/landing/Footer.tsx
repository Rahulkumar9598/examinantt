import logo from '../../assets/logo.png';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <img src={logo} alt="Examinantt Logo" className="w-10 h-10 rounded-lg" />
                            <span className="text-2xl font-bold text-white">Examinantt</span>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            The Future of Exam Prep. An AI-driven platform designed to help you succeed with precision and confidence.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Quick links</h3>
                        <ul className="space-y-3">
                            {['Test series security', 'Home', 'Test series', 'Free resources'].map(item => (
                                <li key={item}><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">{item}</a></li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Company</h3>
                        <ul className="space-y-3">
                            {['About Us', 'Public Notice', 'Management', 'Careers'].map(item => (
                                <li key={item}><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">{item}</a></li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Contact Us</h3>
                        <ul className="space-y-3 text-sm text-gray-400">
                            <li className="flex items-center gap-2">✉️ support@examinantt.com</li>
                            <li className="flex items-center gap-2">📞 +91 800-1108-670</li>
                            <li>📍 Examinantt office, New Delhi, India</li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-8 text-center">
                    <p className="text-xs text-gray-500">
                        © 2024 Examinantt (OPC) PVT. LTD. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
