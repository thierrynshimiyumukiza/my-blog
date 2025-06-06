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
import { useAdminAuth } from './hooks/useAdminAuth';

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
      <div className="min-h-screen bg-matrix-bg text-matrix-green transition-colors duration-300 font-cyber">
        <div className="scanline"></div>
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
        <footer className="bg-black/50 text-matrix-green text-center p-3 mt-8 border-t border-matrix-green">
          <p className="typing">© 2025 Thierry Nshimiyumukiza. All rights reserved.</p>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;