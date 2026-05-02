import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, AlertCircle, Loader2, User, Mail, Lock, MapPin, Star, CheckCircle } from 'lucide-react';
const logo = "/logo.png";
import studentBanner from '../assets/student_banner.png';

const STATES = [
    { name: 'Delhi', districts: ['Central Delhi', 'East Delhi', 'New Delhi', 'North Delhi', 'South Delhi'] },
    { name: 'Maharashtra', districts: ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik'] },
    { name: 'Karnataka', districts: ['Bangalore', 'Mysore', 'Hubli', 'Mangalore', 'Belgaum'] },
    { name: 'Tamil Nadu', districts: ['Chennai', 'Coimbatore', 'Madurai', 'Trichy', 'Salem'] },
    { name: 'Uttar Pradesh', districts: ['Lucknow', 'Kanpur', 'Ghaziabad', 'Agra', 'Varanasi'] },
];

const SignupPage = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [state, setState] = useState('');
    const [district, setDistrict] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const districts = STATES.find(s => s.name === state)?.districts || [];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            return setError('Passwords do not match');
        }

        if (!state || !district) {
            return setError('Please select your state and district');
        }

        if (!auth || !db) {
            setError('Firebase is not configured. Please check your .env file for valid keys.');
            setLoading(false);
            return;
        }

        setLoading(true);

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            // Profile write can fail (e.g., Firestore locked rules). Don't block account creation on it.
            try {
                await setDoc(doc(db, 'users', userCredential.user.uid), {
                    fullName,
                    email,
                    state: state,
                    district: district,
                    role: 'student',
                    createdAt: new Date()
                });
            } catch (profileErr) {
                console.warn('Profile creation failed; check Firestore rules for users collection.', profileErr);
            }

            const returnTo = location.state?.returnTo || '/dashboard';
            navigate(returnTo, { replace: true });
        } catch (err: any) {
            console.error(err);
            const code = typeof err?.code === 'string' ? err.code : '';
            if (code === 'auth/configuration-not-found') {
                setError('Failed to create an account. Firebase Auth is not configured for this project (enable Authentication providers in Firebase Console).');
            } else {
                setError(code ? `Failed to create an account (${code}).` : `Failed to create an account. ${err?.message ?? ''}`.trim());
            }
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-indigo-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="bg-white w-full max-w-[1100px] rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col md:flex-row min-h-[650px]"
            >
                {/* Left Side - Graphics */}
                <div className="hidden md:flex flex-col w-5/12 bg-teal-600 relative overflow-hidden text-white">
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-600/90 to-teal-800/90 z-10" />
                    <img
                        src={studentBanner}
                        alt="Student learning"
                        className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay scale-110"
                    />

                    {/* Floating Decorative Elements */}
                    <div className="absolute top-10 left-10 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 z-20 animate-bounce-slow shadow-lg">
                        <Star className="text-yellow-400 fill-yellow-400" size={24} />
                    </div>

                    <div className="absolute bottom-20 right-10 bg-white/10 backdrop-blur-md px-6 py-4 rounded-xl border border-white/20 z-20 shadow-xl translate-x-4 hover:translate-x-2 transition-transform duration-500">
                        <div className="flex items-center gap-3">
                            <div className="bg-green-500 rounded-full p-1.5 shadow-lg shadow-green-500/40"><CheckCircle size={18} className="text-white" /></div>
                            <div>
                                <p className="text-xs text-teal-100 font-medium uppercase tracking-wide">Success Rate</p>
                                <p className="font-bold text-xl">98.5%</p>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-20 flex flex-col justify-center h-full p-12 lg:p-14">
                        <div className="mb-8">
                            <div className="inline-block bg-teal-500/30 backdrop-blur-md border border-teal-400/30 rounded-full px-4 py-1.5 text-xs font-bold text-teal-50 mb-6 shadow-sm">
                                🚀 Start your journey today
                            </div>
                            <h2 className="text-4xl font-extrabold leading-tight mb-6">
                                Master Your Exams<br />with Confidence
                            </h2>
                            <p className="text-teal-100/90 text-lg leading-relaxed">
                                Join thousands of students who are acing their JEE, NEET, and SSC exams.
                            </p>
                        </div>

                        <div className="space-y-4">
                            {['Real-time Analytics', 'Chapter-wise Mocks', 'Expert Material'].map((feature, i) => (
                                <div key={i} className="flex items-center gap-3 text-teal-50 font-medium group">
                                    <div className="p-1 rounded-full bg-teal-500/20 group-hover:bg-teal-500/40 transition-colors">
                                        <CheckCircle size={16} className="text-green-300" />
                                    </div>
                                    <span>{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="w-full md:w-7/12 p-8 md:p-10 lg:p-12 overflow-y-auto max-h-[90vh] md:max-h-none bg-white">
                    <div className="max-w-md mx-auto">
                        <div className="text-center mb-8">
                            <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
                                <span className="p-2 bg-teal-50 rounded-full group-hover:bg-teal-100 transition-colors">
                                    <img src={logo} alt="DHItantra" className="h-8 w-8 rounded-full" />
                                </span>
                                <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                                    DHItantra
                                </span>
                            </Link>
                            <h2 className="text-3xl font-bold text-slate-800 mb-2">Create Account</h2>
                            <p className="text-slate-500">Begin your preparation journey with us.</p>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-600 text-sm"
                            >
                                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 block ml-1">Full Name</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-600 transition-colors">
                                        <User size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="John Doe"
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 block ml-1">Email Address</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-600 transition-colors">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 block ml-1">State</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-600 transition-colors">
                                            <MapPin size={18} />
                                        </div>
                                        <select
                                            required
                                            value={state}
                                            onChange={(e) => {
                                                setState(e.target.value);
                                                setDistrict('');
                                            }}
                                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white transition-all text-slate-800 appearance-none cursor-pointer"
                                        >
                                            <option value="">State</option>
                                            {STATES.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 block ml-1">District</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-600 transition-colors">
                                            <MapPin size={18} />
                                        </div>
                                        <select
                                            required
                                            value={district}
                                            disabled={!state}
                                            onChange={(e) => setDistrict(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white transition-all text-slate-800 appearance-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                        >
                                            <option value="">District</option>
                                            {districts.map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 block ml-1">Password</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-600 transition-colors">
                                            <Lock size={18} />
                                        </div>
                                        <input
                                            type="password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 block ml-1">Confirm</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-600 transition-colors">
                                            <Lock size={18} />
                                        </div>
                                        <input
                                            type="password"
                                            required
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                disabled={loading}
                                type="submit"
                                className="w-full bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-700 hover:to-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-teal-500/30 hover:shadow-teal-500/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 mt-6"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Create Account'}
                                {!loading && <ChevronRight size={20} />}
                            </button>
                        </form>

                        <div className="mt-8 text-center text-sm font-medium">
                            <p className="text-slate-600">
                                Already have an account?{' '}
                                <Link to="/login" className="text-teal-600 font-bold hover:text-teal-700 transition-colors">
                                    Sign In
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default SignupPage;

