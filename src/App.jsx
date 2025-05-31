import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Link, useParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from './Editor';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';
import './index.css';
import blogLogo from './assets/resources/pictures/hacker.png';
import profilePicture from './assets/resources/pictures/hacker.png';
import lyceeLogo from './assets/resources/pictures/lycee.jpeg';
import bracuLogo from './assets/resources/pictures/bracu.png';
import { Sun, Moon, Search, Menu, X, Linkedin, Facebook, Github, Instagram } from 'lucide-react';
import PostDoorLockSystem from './PostDoorLockSystem';
import picoImg from './assets/resources/pictures/pico.jpg';
import thierryImg from './assets/resources/pictures/thierry.jpg';
import esp32Img from './assets/resources/pictures/esp32.jpg';
import erwiniatorImg from './assets/resources/pictures/erwiniator.jpg';

// --- Simple Auth State (for demonstration) ---
const ADMIN_PASSWORD = "thierry"; // Change this to your own password

function useAdminAuth() {
  const [isAdmin, setIsAdmin] = useState(() => typeof window !== "undefined" && localStorage.getItem('isAdmin') === 'true');
  const login = (password) => {
    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      if (typeof window !== "undefined") localStorage.setItem('isAdmin', 'true');
      return true;
    }
    return false;
  };
  const logout = () => {
    setIsAdmin(false);
    if (typeof window !== "undefined") localStorage.removeItem('isAdmin');
  };
  return { isAdmin, login, logout };
}

// --- Matrix Rain Canvas Component with Gradient Overlay ---
const MatrixRain = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = 320;
    canvas.width = width;
    canvas.height = height;

    const fontSize = 18;
    const columns = Math.floor(width / fontSize);
    const drops = Array(columns).fill(1);

    const chars = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズヅブプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッンABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    function draw() {
      ctx.fillStyle = 'rgba(10, 15, 20, 0.5)';
      ctx.fillRect(0, 0, width, height);
      ctx.font = fontSize + "px monospace";
      ctx.fillStyle = "#00ff41";
      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
      // Gradient overlay
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, 'rgba(0,255,64,0.25)');
      gradient.addColorStop(1, 'rgba(0,0,0,0.85)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    }

    let animationId;
    function animate() {
      draw();
      animationId = requestAnimationFrame(animate);
    }
    animate();

    function handleResize() {
      width = window.innerWidth;
      canvas.width = width;
    }
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-80 pointer-events-none z-0"
      style={{ opacity: 0.7 }}
    />
  );
};

// --- Navigation ---
const Nav = ({ toggleDarkMode, isDarkMode, isAdmin, logout }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About' },
    { to: '/writings', label: 'Writings' },
    { to: '/projects', label: 'Projects' },
    { to: '/contact', label: 'Contact' },
    ...(isAdmin ? [{ to: '/editor', label: 'Write Post' }] : []),
    { to: '/writings/door-lock-system', label: 'Door Lock System' },
  ];

  return (
    <nav
      className="bg-gray-800 dark:bg-gray-900 text-white py-2 px-2 sticky top-0 z-50 shadow-lg"
      style={{ fontFamily: 'Times New Roman, Times, serif', fontSize: '0.92rem', minHeight: '40px' }}
    >
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex flex-col">
          <Link to="/" className="flex items-center" onClick={() => setMenuOpen(false)}>
            <img src={blogLogo} alt="Thierry Mukiza Logo" className="h-6 w-6 mr-2 rounded-full" />
            <span className="font-bold text-base hidden sm:inline">Thierry Mukiza</span>
          </Link>
          <span
            className="text-green-400 font-mono text-xs sm:text-sm tracking-wide mt-0.5"
            style={{
              minHeight: '1.2em',
              letterSpacing: '0.04em',
              whiteSpace: 'nowrap',
              textShadow: '0 0 6px #00ff41, 0 0 2px #00ff41'
            }}
          >
            DataFuel | AI x Cybersecurity x Hacking
            <span className="animate-pulse">|</span>
          </span>
        </div>
        <ul className="hidden md:flex space-x-3">
          {navLinks.map(link => (
            <li key={link.to}>
              <Link
                to={link.to}
                className={`transition-colors hover:text-blue-300 ${location.pathname === link.to ? 'text-blue-400 font-semibold' : ''}`}
                style={{ fontFamily: 'Times New Roman, Times, serif', fontSize: '0.97rem' }}
              >
                {link.label}
              </Link>
            </li>
          ))}
          {isAdmin && (
            <li>
              <button onClick={logout} className="ml-2 px-2 py-1 bg-red-600 rounded text-xs hover:bg-red-700">Logout</button>
            </li>
          )}
        </ul>
        <div className="flex items-center space-x-1">
          <button
            onClick={toggleDarkMode}
            className="p-1 rounded-full hover:bg-gray-700 transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            className="md:hidden p-1 rounded-full hover:bg-gray-700 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
      {menuOpen && (
        <ul className="md:hidden flex flex-col space-y-1 mt-2 px-2 pb-2 animate-fade-in-down">
          {navLinks.map(link => (
            <li key={link.to}>
              <Link
                to={link.to}
                className={`block py-1 px-2 rounded hover:bg-gray-700 transition-colors ${location.pathname === link.to ? 'bg-blue-700 font-semibold' : ''}`}
                style={{ fontFamily: 'Times New Roman, Times, serif', fontSize: '0.97rem' }}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            </li>
          ))}
          {isAdmin && (
            <li>
              <button onClick={logout} className="ml-2 px-2 py-1 bg-red-600 rounded text-xs hover:bg-red-700 w-full">Logout</button>
            </li>
          )}
        </ul>
      )}
    </nav>
  );
};

// --- Admin Login Page ---
const AdminLogin = ({ login }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!login(password)) {
      setError('Incorrect password.');
    }
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="bg-gray-900 text-green-400 p-6 rounded-lg shadow-lg w-full max-w-xs">
        <h2 className="text-xl font-bold mb-3 text-center">Admin Login</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            className="w-full mb-3 px-3 py-2 rounded bg-black border border-green-400 text-green-200"
            placeholder="Enter admin password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          {error && <div className="text-red-400 text-xs mb-2">{error}</div>}
          <button type="submit" className="w-full bg-green-700 hover:bg-green-600 text-white py-2 rounded">Login</button>
        </form>
      </div>
    </div>
  );
};

// --- Home Page ---
const Home = ({ posts }) => {
  const featuredPosts = posts ? posts.slice(0, 2) : [];
  return (
    <div style={{ fontFamily: 'Times New Roman, Times, serif', fontSize: '0.97rem', position: 'relative' }}>
      <div className="relative h-80 flex items-center justify-center bg-black overflow-hidden">
        <MatrixRain />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/60 to-black/90 pointer-events-none z-10" />
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
          <img src={profilePicture} alt="Thierry" className="w-20 h-20 rounded-full mx-auto mb-2 border-4 border-green-400 shadow-lg" />
          <h1 className="text-3xl font-bold mb-1 text-green-400 drop-shadow-lg" style={{ textShadow: '0 0 8px #00ff41' }}>
            Thierry Mukiza
          </h1>
          <div className="text-green-300 font-mono text-base sm:text-lg mb-2 min-h-[2.5em]" style={{ textShadow: '0 0 8px #00ff41' }}>
            I’m deeply obsessed with hacking and computer science.<br />
            
          </div>
          <div className="flex gap-4 mt-2">
            <a href="https://github.com/thierrynshimiyumukiza" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="hover:text-gray-800 dark:hover:text-gray-200 transition-colors hover:scale-125 duration-200">
              <Github size={28} />
            </a>
            <a href="https://www.linkedin.com/in/nshimiyumukiza-thierry-61976a290" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:text-blue-700 transition-colors hover:scale-125 duration-200">
              <Linkedin size={28} />
            </a>
            <a href="https://x.com/datafuel" target="_blank" rel="noopener noreferrer" aria-label="X" className="hover:text-black dark:hover:text-white transition-colors hover:scale-125 duration-200">
              <svg width="28" height="28" fill="currentColor" viewBox="0 0 32 32"><path d="M19.5 13.6L28 4h-2.1l-7.4 8.3L12 4H4l9.1 13.1L4 28h2.1l7.9-8.9L20 28h8l-8.5-14.4zm-2.8 3.1l-1.1-1.6-7.3-10.3h4.7l5.8 8.2 1.1 1.6 7.6 10.7h-4.7l-6.1-8.6z"/></svg>
            </a>
            <a href="https://www.instagram.com/occupy_gateways/?hl=en" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-pink-600 transition-colors hover:scale-125 duration-200">
              <Instagram size={28} />
            </a>
          </div>
        </div>
      </div>
      <div className="container mx-auto p-4 mt-4">
        <section className="rounded-lg bg-white/70 dark:bg-gray-900/70 shadow-lg p-4 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">Featured Posts</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {featuredPosts.map(post => (
              <motion.div
                key={post.id}
                whileHover={{ scale: 1.05 }}
                className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg"
              >
                <h3 className="text-lg font-semibold mb-1 text-gray-800 dark:text-gray-100">{post.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-2">{post.excerpt}</p>
                <Link to={`/writings/${post.id}`} className="text-blue-500 hover:underline">Read More</Link>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
// Timeline Section
const Timeline = () => (
  <div className="my-8">
    <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">My Journey</h3>
    <ol className="relative border-l border-green-400 dark:border-green-600 ml-4">
      <li className="mb-8 ml-6">
        <span className="absolute -left-3 flex items-center justify-center w-6 h-6 bg-green-400 rounded-full ring-8 ring-white dark:ring-gray-900 dark:bg-green-600">
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10"/></svg>
        </span>
        <h4 className="font-bold text-green-700 dark:text-green-300">2019-2022: High School</h4>
        <p className="text-gray-700 dark:text-gray-300">Graduated from Lycée de Kigali with top marks in Math, Physics, and Geography.</p>
      </li>
      <li className="mb-8 ml-6">
        <span className="absolute -left-3 flex items-center justify-center w-6 h-6 bg-green-400 rounded-full ring-8 ring-white dark:ring-gray-900 dark:bg-green-600">
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10"/></svg>
        </span>
        <h4 className="font-bold text-green-700 dark:text-green-300">2023-2027: Brac University</h4>
        <p className="text-gray-700 dark:text-gray-300">Pursuing Computer Science and Engineering.</p>
      </li>
      <li className="ml-6">
        <span className="absolute -left-3 flex items-center justify-center w-6 h-6 bg-green-400 rounded-full ring-8 ring-white dark:ring-gray-900 dark:bg-green-600">
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10"/></svg>
        </span>
        <h4 className="font-bold text-green-700 dark:text-green-300">Future</h4>
        <p className="text-gray-700 dark:text-gray-300">Building, hacking, and sharing knowledge with the world.</p>
      </li>
    </ol>
  </div>
);

// Gallery Section
const Gallery = () => (
  <div className="my-8">
    <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Gallery</h3>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="rounded-lg overflow-hidden shadow-lg">
        <img src={picoImg} alt="Pico Project" className="object-cover w-full h-32" />
        <div className="p-2 text-xs text-center text-gray-700 dark:text-gray-300">Pico Project</div>
      </div>
      <div className="rounded-lg overflow-hidden shadow-lg">
        <img src={thierryImg} alt="Thierry" className="object-cover w-full h-32" />
        <div className="p-2 text-xs text-center text-gray-700 dark:text-gray-300">Thierry</div>
      </div>
      <div className="rounded-lg overflow-hidden shadow-lg">
        <img src={esp32Img} alt="ESP32" className="object-cover w-full h-32" />
        <div className="p-2 text-xs text-center text-gray-700 dark:text-gray-300">ESP32</div>
      </div>
      <div className="rounded-lg overflow-hidden shadow-lg">
        <img src={erwiniatorImg} alt="Erwiniator" className="object-cover w-full h-32" />
        <div className="p-2 text-xs text-center text-gray-700 dark:text-gray-300">Erwiniator</div>
      </div>
    </div>
  </div>
);

// Resume Download Section
const ResumeSection = () => (
  <div className="my-8 flex justify-center">
    <a
      href="/affi.pdf"
      download="Thierry_Nshimiyumukiza_Resume.pdf"
      className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded shadow transition-colors"
      target="_blank"
      rel="noopener noreferrer"
    >
      Download My Resume (PDF)
    </a>
  </div>
);
// Quote/Motto Section
const Motto = () => (
  <div className="my-8 max-w-xl mx-auto">
    <blockquote className="border-l-4 border-green-500 pl-4 italic text-lg text-gray-700 dark:text-gray-200">
      "There are no limits for someone who refuses to stop. I live to create, break, and understand."
    </blockquote>
    <div className="text-right text-green-600 dark:text-green-300 mt-2 font-mono">— Thierry Mukiza</div>
  </div>
);

// Add this TerminalIntro component above About
const TerminalIntro = () => (
  <div className="bg-black text-green-400 font-mono p-4 rounded-lg shadow-lg mb-6 relative overflow-hidden" style={{ minHeight: '80px' }}>
    <span>thierry@matrix:~$ whoami</span>
    <br />
    <span>thierry@matrix:~$ echo "Obsessed with hacking, AI, and building cool stuff."</span>
  </div>
);

// Corrected About component
const About = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
    className="container mx-auto p-4 text-center"
    style={{ fontFamily: 'Times New Roman, Times, serif', fontSize: '0.97rem' }}
  >
    <TerminalIntro />
    <img src={profilePicture} alt="Thierry" className="w-28 h-28 rounded-full mx-auto my-3 border-4 border-blue-400 shadow-lg hover:scale-105 transition-transform duration-300" />
    <p className="text-base text-gray-700 dark:text-gray-300 mb-6 leading-relaxed max-w-2xl mx-auto">
      Hi, I’m <span className="font-bold">Thierry Nshimiyumukiza</span>, a Computer Science student at Brac University with an unshakable obsession for security and hacking in all its forms.
      As a child, I tore apart dozens of my dad’s radios, driven by a single question: <span className="italic">how do people speak from inside a box?</span> That raw curiosity never faded—it sharpened. Over time, it became something deeper: hacking.
      I dove into an ocean of unknowns, overwhelmed but relentless. I started small—mastering the Linux CLI—and kept going, sinking deeper into networking, where I discovered the power of network programming.
      What defines me is obsession turned into action. I build wild things—hacking gadgets you'll find on my site—from signal jammers and custom routing tools to cipher generators, Windows kernel exploits, Active Directory attacks, and wireless vulnerability testing.
      I believe there are no limits for someone who refuses to stop. I live to create, break, and understand. <span className="font-bold">Stay hard.</span>
    </p>
    <Motto />
    <Timeline />
    <Gallery />
    <ResumeSection />
    <div className="flex flex-col md:flex-row justify-center items-center gap-6 mb-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 flex flex-col items-center w-full md:w-1/2 mb-4 md:mb-0 hover:scale-105 transition-transform duration-300">
        <img src={lyceeLogo} alt="Lycee de Kigali" className="h-12 w-12 rounded-full mb-1 border-2 border-gray-300 dark:border-gray-600" />
        <h2 className="text-lg font-semibold mb-1 text-blue-700 dark:text-blue-300">High School</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-1 text-sm">2019 - 2022</p>
        <p className="text-gray-700 dark:text-gray-300 mb-1 text-sm">
          I studied at <a href="https://rw.wikipedia.org/wiki/Lyc%C3%A9e_de_Kigali" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline hover:text-blue-700">Lycée de Kigali</a> where I secured a Highschool Diploma with a weighted aggregate of <span className="font-bold">60/60</span> in Mathematics, Physics, Geography.
        </p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 flex flex-col items-center w-full md:w-1/2 hover:scale-105 transition-transform duration-300">
        <img src={bracuLogo} alt="Brac University" className="h-12 w-12 rounded-full mb-1 border-2 border-gray-300 dark:border-gray-600" />
        <h2 className="text-lg font-semibold mb-1 text-green-700 dark:text-green-300">Undergraduate</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-1 text-sm">2023 - 2027</p>
        <p className="text-gray-700 dark:text-gray-300 mb-1 text-sm">
          I study at <a href="https://www.bracu.ac.bd/" target="_blank" rel="noopener noreferrer" className="text-green-600 underline hover:text-green-800">Brac University</a>in the department of computer science and engineering with a current CGPA of  <span className="font-bold">3+</span>.
        </p>
      </div>
    </div>
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">Fun Facts</h3>
      <ul className="flex flex-wrap justify-center gap-3 text-sm">
        <li className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded shadow">Built my first radio at age 10</li>
        <li className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded shadow">I like exploiting Wi-Fi vulnerabilities</li>
        <li className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-3 py-1 rounded shadow">Linux CLI is my world</li>
        <li className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-3 py-1 rounded shadow">I am obsessed with cool stuff</li>
      </ul>
    </div>
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-1 text-gray-800 dark:text-gray-100">Languages & Skills</h3>
      <div className="flex flex-wrap justify-center gap-2 text-base">
        <span className="bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">Bash</span>
        <span className="bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">Python</span>
        <span className="bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">C</span>
        <span className="bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">XSS</span>
        <span className="bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">JavaScript</span>
        <span className="bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">Networking</span>
        <span className="bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">Reverse Engineering</span>
      </div>
      <div className="mt-4 space-y-2 max-w-md mx-auto">
        <div>
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300">
            <span>Python</span><span>95%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded h-2">
            <div className="bg-green-400 h-2 rounded" style={{ width: '95%', transition: 'width 1s' }}></div>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300">
            <span>Bash</span><span>90%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded h-2">
            <div className="bg-blue-400 h-2 rounded" style={{ width: '90%', transition: 'width 1s' }}></div>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300">
            <span>C</span><span>80%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded h-2">
            <div className="bg-yellow-400 h-2 rounded" style={{ width: '80%', transition: 'width 1s' }}></div>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300">
            <span>JavaScript</span><span>75%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded h-2">
            <div className="bg-purple-400 h-2 rounded" style={{ width: '75%', transition: 'width 1s' }}></div>
          </div>
        </div>
      </div>
    </div>
    <div className="flex justify-center gap-5 mb-6">
      <a href="https://www.linkedin.com/in/nshimiyumukiza-thierry-61976a290" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:text-blue-700 transition-colors hover:scale-125 duration-200">
        <Linkedin size={28} />
      </a>
      <a href="https://www.facebook.com/thierry054" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-blue-600 transition-colors hover:scale-125 duration-200">
        <Facebook size={28} />
      </a>
      <a href="https://x.com/datafuel" target="_blank" rel="noopener noreferrer" aria-label="X" className="hover:text-black dark:hover:text-white transition-colors hover:scale-125 duration-200">
        <svg width="28" height="28" fill="currentColor" viewBox="0 0 32 32"><path d="M19.5 13.6L28 4h-2.1l-7.4 8.3L12 4H4l9.1 13.1L4 28h2.1l7.9-8.9L20 28h8l-8.5-14.4zm-2.8 3.1l-1.1-1.6-7.3-10.3h4.7l5.8 8.2 1.1 1.6 7.6 10.7h-4.7l-6.1-8.6z"/></svg>
      </a>
      <a href="https://github.com/thierrynshimiyumukiza" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="hover:text-gray-800 dark:hover:text-gray-200 transition-colors hover:scale-125 duration-200">
        <Github size={28} />
      </a>
      <a href="https://www.instagram.com/occupy_gateways/?hl=en" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-pink-600 transition-colors hover:scale-125 duration-200">
        <Instagram size={28} />
      </a>
    </div>
    <div className="mt-4 text-xs text-gray-400 dark:text-gray-600">
      <span title="You found the secret!">Pssst... Click my profile pic for a surprise.</span>
    </div>
  </motion.div>
);

// Contact Page - Outstanding Version
const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Fake submit handler for demo
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.message) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setSent(true);
      setLoading(false);
      setForm({ name: '', email: '', message: '' });
    }, 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-4 flex flex-col items-center"
      style={{ fontFamily: 'Times New Roman, Times, serif', fontSize: '0.97rem' }}
    >
      <h1 className="text-2xl font-bold mb-3 text-gray-800 dark:text-gray-100">Contact Me</h1>
      <div className="bg-black text-green-400 font-mono p-6 rounded-lg shadow-lg max-w-lg w-full mb-6">
        <div className="mb-2">thierry@matrix:~$ <span className="text-green-300">contact --to "occupy.fuel.thendata@gmail.com"</span></div>
        {sent ? (
          <div className="flex flex-col items-center py-6">
            <span className="text-green-300 text-lg mb-2">Message sent successfully!</span>
            <span className="text-2xl animate-bounce">✔️</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} autoComplete="off">
            <div className="mb-2 flex items-center">
              <label className="w-20">Name:</label>
              <input
                className="bg-black border-b border-green-400 text-green-200 outline-none flex-1 px-2 py-1"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                autoComplete="off"
              />
            </div>
            <div className="mb-2 flex items-center">
              <label className="w-20">Email:</label>
              <input
                className="bg-black border-b border-green-400 text-green-200 outline-none flex-1 px-2 py-1"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                autoComplete="off"
              />
            </div>
            <div className="mb-2 flex items-start">
              <label className="w-20 pt-1">Message:</label>
              <textarea
                className="bg-black border-b border-green-400 text-green-200 outline-none flex-1 px-2 py-1"
                rows={3}
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
              />
            </div>
            {error && <div className="text-red-400 text-xs mb-2">{error}</div>}
            <button
              className="bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded mt-2 w-full transition-colors"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send'}
            </button>
          </form>
        )}
      </div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">Or reach me directly:</h2>
        <div className="flex flex-wrap justify-center gap-4">
          <a href="mailto:occupy.fuel.thendata@gmail.com" target="_blank" rel="noopener noreferrer" aria-label="Email" className="hover:text-red-600 transition-colors hover:scale-125 duration-200 flex items-center gap-2">
            <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 4.999c-.006.057-.01.115-.01.173v13.655c0 1.104.896 2 2 2h16c1.104 0 2-.896 2-2V5.172c0-.058-.004-.116-.01-.173L12 13.414 2.01 4.999zM22 4c0-1.104-.896-2-2-2H4C2.896 2 2 2.896 2 4v.217l10 8.999 10-8.999V4z"/></svg>
            <span className="hidden sm:inline">occupy.fuel.thendata@gmail.com</span>
          </a>
          <a href="https://www.linkedin.com/in/nshimiyumukiza-thierry-61976a290" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:text-blue-700 transition-colors hover:scale-125 duration-200 flex items-center gap-2">
            <Linkedin size={28} />
            <span className="hidden sm:inline">LinkedIn</span>
          </a>
          <a href="https://www.facebook.com/thierry054" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-blue-600 transition-colors hover:scale-125 duration-200 flex items-center gap-2">
            <Facebook size={28} />
            <span className="hidden sm:inline">Facebook</span>
          </a>
          <a href="https://x.com/datafuel" target="_blank" rel="noopener noreferrer" aria-label="X" className="hover:text-black dark:hover:text-white transition-colors hover:scale-125 duration-200 flex items-center gap-2">
            <svg width="28" height="28" fill="currentColor" viewBox="0 0 32 32"><path d="M19.5 13.6L28 4h-2.1l-7.4 8.3L12 4H4l9.1 13.1L4 28h2.1l7.9-8.9L20 28h8l-8.5-14.4zm-2.8 3.1l-1.1-1.6-7.3-10.3h4.7l5.8 8.2 1.1 1.6 7.6 10.7h-4.7l-6.1-8.6z"/></svg>
            <span className="hidden sm:inline">X</span>
          </a>
          <a href="https://github.com/thierrynshimiyumukiza" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="hover:text-gray-800 dark:hover:text-gray-200 transition-colors hover:scale-125 duration-200 flex items-center gap-2">
            <Github size={28} />
            <span className="hidden sm:inline">GitHub</span>
          </a>
          <a href="https://www.instagram.com/occupy_gateways/?hl=en" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-pink-600 transition-colors hover:scale-125 duration-200 flex items-center gap-2">
            <Instagram size={28} />
            <span className="hidden sm:inline">Instagram</span>
          </a>
        </div>
      </div>
      <div className="mt-4 text-xs text-gray-400 dark:text-gray-600">
        <span title="You found the secret!">Pssst... Try typing "hacker" in the message box for a surprise.</span>
      </div>
    </motion.div>
  );
};

// Writings Page (Blog List) with Search and Categories
const Writings = ({ posts, setFilteredPosts }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    let filtered = posts;
    if (searchQuery) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }
    setFilteredPosts(filtered);
  }, [searchQuery, selectedCategory, posts, setFilteredPosts]);

  const categories = ['All', ...new Set(posts.map(post => post.category).filter(Boolean))];

  return (
    <div className="container mx-auto p-4" style={{ fontFamily: 'Times New Roman, Times, serif', fontSize: '0.97rem' }}>
      <h1 className="text-2xl font-bold mb-3 text-gray-800 dark:text-gray-100">Writings</h1>
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 p-1.5 border rounded-lg dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 text-base"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="p-1.5 border rounded-lg dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 text-base"
        >
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>
      <AnimatePresence>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {posts.map(post => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg"
            >
              {post.imageUrl && (
                <img src={post.imageUrl} alt={post.title} className="w-full h-36 object-cover rounded-lg mb-3" />
              )}
              <h2 className="text-lg font-semibold mb-1 text-gray-800 dark:text-gray-100">{post.title}</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-1">{post.excerpt}</p>
              {post.category && (
                <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-0.5 rounded mb-1">
                  {post.category}
                </span>
              )}
              <Link to={`/writings/${post.id}`} className="text-blue-500 hover:underline text-sm">Read More</Link>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>
    </div>
  );
};

// Individual Post Page
const Post = ({ posts }) => {
  const { id } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      const querySnapshot = await getDocs(collection(db, 'posts'));
      const foundPost = querySnapshot.docs.find(doc => doc.id === id);
      if (foundPost) setPost({ id: foundPost.id, ...foundPost.data() });
    };
    fetchPost();
  }, [id]);

  if (!post) return <div className="text-center text-gray-600 dark:text-gray-400" style={{ fontFamily: 'Times New Roman, Times, serif', fontSize: '0.97rem' }}>Loading...</div>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-4"
      style={{ fontFamily: 'Times New Roman, Times, serif', fontSize: '0.97rem' }}
    >
      {post.imageUrl && (
        <img src={post.imageUrl} alt={post.title} className="w-full h-52 object-cover rounded-lg mb-4" />
      )}
      <h1 className="text-2xl font-bold mb-3 text-gray-800 dark:text-gray-100">{post.title}</h1>
      <div className="prose dark:prose-invert max-w-none" style={{ fontSize: '1rem' }} dangerouslySetInnerHTML={{ __html: post.content }}></div>
      <Link to="/writings" className="text-blue-500 hover:underline mt-4 inline-block text-sm">Back to Writings</Link>
    </motion.div>
  );
};

// Projects Page
const Projects = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
    className="container mx-auto p-4"
    style={{ fontFamily: 'Times New Roman, Times, serif', fontSize: '0.97rem' }}
  >
    <h1 className="text-2xl font-bold mb-3 text-gray-800 dark:text-gray-100">Projects</h1>
    <p className="text-base text-gray-700 dark:text-gray-300 mb-4">
      Here are some projects I've worked on:
    </p>
    <div className="grid gap-4 md:grid-cols-2">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
        <h2 className="text-lg font-semibold mb-1 text-gray-800 dark:text-gray-100">Project 1: Blog Platform</h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm">A modern blog platform built with React, Vite, and Firebase.</p>
      </div>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
        <h2 className="text-lg font-semibold mb-1 text-gray-800 dark:text-gray-100">Project 2: Portfolio Site</h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm">A personal portfolio showcasing my work and skills.</p>
      </div>
    </div>
  </motion.div>
);

// Main App Component
function App() {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(() => typeof window !== "undefined" && localStorage.getItem('darkMode') === 'true');
  const { isAdmin, login, logout } = useAdminAuth();

  useEffect(() => {
    const fetchPosts = async () => {
      const querySnapshot = await getDocs(collection(db, 'posts'));
      const fetchedPosts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPosts(fetchedPosts);
      setFilteredPosts(fetchedPosts);
    };
    fetchPosts();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('darkMode', 'true');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('darkMode', 'false');
      }
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300" style={{ fontFamily: 'Times New Roman, Times, serif', fontSize: '0.97rem' }}>
        <Nav toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} isAdmin={isAdmin} logout={logout} />
        <Routes>
          <Route path="/" element={<Home posts={filteredPosts} />} />
          <Route path="/about" element={<About />} />
          <Route path="/writings" element={<Writings posts={filteredPosts} setFilteredPosts={setFilteredPosts} />} />
          <Route path="/writings/:id" element={<Post posts={filteredPosts} />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/contact" element={<Contact />} />
          <Route
            path="/editor"
            element={
              isAdmin
                ? <Editor />
                : <AdminLogin login={login} />
            }
          />
          <Route path="/writings/door-lock-system" element={<PostDoorLockSystem />} />
        </Routes>
        <footer className="bg-gray-800 dark:bg-gray-900 text-white text-center p-3 mt-8" style={{ fontFamily: 'Times New Roman, Times, serif', fontSize: '0.97rem' }}>
          <p>© 2025 Thierry Nshimiyumukiza. All rights reserved.</p>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;