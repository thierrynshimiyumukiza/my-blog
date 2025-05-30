import React from 'react';
import demo1 from './assets/resources/pictures/demo1.png';
import demo2 from './assets/resources/pictures/demo2.png';
import { motion } from 'framer-motion';
import { Github, Linkedin } from 'lucide-react';

const coolBox = (children, color = 'blue') => (
  <div className={`border-l-4 border-${color}-400 bg-${color}-50 dark:bg-${color}-900/30 p-4 my-4 rounded shadow`}>
    {children}
  </div>
);

const highlight = (text) => (
  <span className="bg-yellow-200 dark:bg-yellow-700 px-1 rounded">{text}</span>
);

const PostDoorLockSystem = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    className="container mx-auto max-w-3xl p-4 prose dark:prose-invert"
    style={{ fontFamily: 'Times New Roman, Times, serif', fontSize: '1.05rem' }}
  >
    {/* Hero Section */}
    <div className="relative flex flex-col items-center mb-8">
      <div className="w-full h-48 bg-gradient-to-r from-blue-900 via-black to-green-900 rounded-lg shadow-lg flex items-center justify-center mb-4 relative overflow-hidden">
        <span className="text-3xl md:text-4xl font-bold text-green-300 drop-shadow-lg z-10 text-center" style={{ textShadow: '0 0 12px #00ff41' }}>
          Door Lock System<br />Documentation
        </span>
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          {/* Matrix Rain Effect */}
          <MatrixRainStatic />
        </div>
      </div>
      <div className="flex gap-4 mt-2">
        <a href="https://github.com/thierrynshimiyumukiza" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="hover:text-gray-800 dark:hover:text-gray-200 transition-colors hover:scale-125 duration-200">
          <Github size={28} />
        </a>
        <a href="https://www.linkedin.com/in/nshimiyumukiza-thierry-61976a290" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:text-blue-700 transition-colors hover:scale-125 duration-200">
          <Linkedin size={28} />
        </a>
      </div>
    </div>

    {/* Demo Images */}
    <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-center">
      <img src={demo1} alt="Door Lock System Demo 1" className="rounded-lg shadow-lg w-full md:w-1/2 border-4 border-blue-300 hover:scale-105 transition-transform duration-300" />
      <img src={demo2} alt="Door Lock System Demo 2" className="rounded-lg shadow-lg w-full md:w-1/2 border-4 border-green-300 hover:scale-105 transition-transform duration-300" />
    </div>

    {/* Outstanding Info Box */}
    {coolBox(
      <>
        <b>Project:</b> <span className="text-blue-700 dark:text-blue-300">Door Lock System</span> &mdash; <span className="italic">A secure, hacker-resistant embedded access control solution with real-world attack simulation.</span>
      </>,
      'blue'
    )}

    <h2>1. Project Overview</h2>
    <p>
      The Door Lock System is an embedded security solution designed to provide secure access control through a keypad-based interface. The system integrates hardware and software components to authenticate users via a 4-character password, employing advanced security features such as password hashing, typing pattern analysis, and lockout mechanisms. Additionally, a Python-based attack simulation script is included to test the system's resilience against timing and hybrid attacks.
      This report provides a comprehensive documentation of the system's design, functionality, technologies used, and materials employed.
    </p>

    <h2>2. System Architecture</h2>
    <h3>2.1 Hardware Components</h3>
    <ul>
      <li><b>Arduino Microcontroller:</b> Serves as the central processing unit, executing the embedded code and interfacing with peripherals.</li>
      <li><b>4x4 Keypad:</b> Allows users to input a 4-character password using digits (0-9) and letters (A-D, *, #).</li>
      <li><b>16x2 LCD Display (I2C):</b> Displays system status, prompts, and feedback (e.g., "Enter Password:", "Access GRANTED").</li>
      <li><b>RGB LED:</b> Provides visual feedback through color changes (Blue: Standby, Green: Access Granted, Red: Access Denied or Locked).</li>
      <li><b>Relay Module:</b> Controls the physical lock mechanism, toggling between locked (HIGH) and unlocked (LOW) states.</li>
      <li><b>EEPROM:</b> Stores persistent data, including a cryptographic salt and an intrusion flag.</li>
    </ul>

    <h3>2.2 Software Components</h3>
    <ul>
      <li><b>Arduino Firmware (C++):</b> Manages user input, password verification, security features, and hardware control.</li>
      <li><b>Python Attack Simulation:</b> A testing script that attempts to crack the password using timing and hybrid attack strategies.</li>
    </ul>

    <h3>2.3 System Workflow</h3>
    <ul>
      <li><b>Initialization:</b> The Arduino initializes the keypad, LCD, RGB LED, and relay. It loads or generates a cryptographic salt from EEPROM.</li>
      <li><b>User Interaction:</b> Users input a 4-character password via the keypad. The LCD displays asterisks (*) for each character to mask input.</li>
      <li><b>Password Verification:</b>
        <ul>
          <li>The input password is hashed using SHA-256 with a stored salt.</li>
          <li>Typing intervals between key presses are analyzed to validate the user's typing pattern.</li>
          <li>The system enforces a uniform response time to mitigate timing attacks.</li>
        </ul>
      </li>
      <li><b>Access Control:</b>
        <ul>
          <li>If the hash and typing pattern match, the relay unlocks for 3 seconds, and the LCD displays "Access GRANTED."</li>
          <li>If verification fails, the system increments a failed attempt counter. After 3 failed attempts, it enters a 5-minute lockout mode and activates a decoy mode to mislead attackers.</li>
        </ul>
      </li>
      <li><b>Attack Simulation:</b> The Python script tests the system's security by attempting common passwords and performing timing attacks to deduce the correct password based on response times.</li>
    </ul>

    {coolBox(
      <>
        <b>Security Highlight:</b> <span className="text-green-700 dark:text-green-300">Uniform response time, decoy mode, and typing pattern analysis</span> make this system resilient to both brute-force and timing attacks!
      </>,
      'green'
    )}

    <h2>3. Technologies Used</h2>
    <h3>3.1 Arduino Firmware (C++)</h3>
    <b>Libraries:</b>
    <ul>
      <li>Keypad.h: Manages the 4x4 keypad matrix for user input.</li>
      <li>LiquidCrystal_I2C.h: Interfaces with the I2C-based LCD for display output.</li>
      <li>EEPROM.h: Handles persistent storage for salt and intrusion flags.</li>
      <li>Crypto.h and SHA256.h: Implements SHA-256 hashing for secure password verification.</li>
    </ul>
    <b>Key Features:</b>
    <ul>
      <li>Password Hashing: Uses SHA-256 with a 2-byte salt stored in EEPROM to prevent precomputed attacks.</li>
      <li>Typing Pattern Analysis: Validates user input by comparing key press intervals to a learned profile, with a ±30% tolerance.</li>
      <li>Lockout Mechanism: Locks the system for 5 minutes after 3 failed attempts, displaying a countdown on the LCD.</li>
      <li>Decoy Mode: After 3 failed attempts, displays a fake "Access GRANTED" message to mislead attackers and logs an intrusion flag.</li>
      <li>RGB Feedback: Changes LED colors to indicate system status (Blue: Standby, Green: Success, Red: Failure/Lockout).</li>
      <li>Uniform Response Time: Delays responses to 1 second to prevent timing attacks.</li>
    </ul>

    <h3>3.2 Python Attack Simulation</h3>
    <b>Libraries:</b>
    <ul>
      <li>time: Manages delays and timing measurements.</li>
      <li>serial: Communicates with the Arduino over a serial port (e.g., COM4 at 9600 baud).</li>
      <li>random: Introduces random delays to mimic human typing.</li>
      <li>collections.defaultdict: Stores timing data for each character during attacks.</li>
      <li>matplotlib.pyplot: Visualizes timing attack results with bar plots.</li>
      <li>numpy: Computes average response times.</li>
      <li>scipy.stats.ttest_ind: Available for statistical analysis (not used in the provided code).</li>
    </ul>
    <b>Key Features:</b>
    <ul>
      <li>Timing Attack: Measures response times for each character in a 4-position password, exploiting potential timing differences.</li>
      <li>Hybrid Attack: Combines a dictionary attack (testing common passwords like "1234", "0000") with timing attacks to deduce the password.</li>
      <li>Serial Communication: Sends test passwords to the Arduino and reads responses ("GRANTED" or "DENIED").</li>
      <li>Visualization: Plots average response times per character to identify the slowest (likely correct) character for each position.</li>
    </ul>

    <h2>4. Materials Used</h2>
    <h3>4.1 Hardware Materials</h3>
    <ul>
      <li>Arduino Board: Typically an Arduino Uno or compatible microcontroller.</li>
      <li>4x4 Matrix Keypad: 16 keys (0-9, A-D, *, #) connected to digital pins 2-9.</li>
      <li>16x2 LCD with I2C Interface: Connected to the I2C bus (address 0x27).</li>
      <li>RGB LED: Common cathode/anode, connected to PWM pins 11 (Red), 12 (Green), and 13 (Blue).</li>
      <li>Relay Module: Single-channel, connected to digital pin 10, controlling a physical lock.</li>
      <li>Jumper Wires and Breadboard: For prototyping and connecting components.</li>
      <li>Power Supply: 5V USB or external power source for the Arduino.</li>
      <li>Resistors: Appropriate resistors for the RGB LED to limit current.</li>
    </ul>
    <h3>4.2 Software Tools</h3>
    <ul>
      <li>Arduino IDE: For compiling and uploading the C++ firmware to the Arduino.</li>
      <li>Python Environment: Python 3.x with libraries installed via pip (pyserial, matplotlib, numpy, scipy).</li>
      <li>Serial Monitor: For debugging serial communication between the Python script and Arduino.</li>
    </ul>

    <h2>5. Security Features</h2>
    <h3>5.1 Password Security</h3>
    <ul>
      <li>SHA-256 Hashing: The password is hashed with a 2-byte salt to prevent rainbow table attacks.</li>
      <li>EEPROM Storage: The salt is stored persistently, generated randomly if not already present.</li>
    </ul>
    <h3>5.2 Anti-Tampering Mechanisms</h3>
    <ul>
      <li>Typing Pattern Analysis: Validates user identity by analyzing key press intervals, updating a moving average after successful entries.</li>
      <li>Lockout System: Enforces a 5-minute lockout after 3 failed attempts, with a countdown displayed on the LCD.</li>
      <li>Decoy Mode: Misleads attackers by displaying a fake "Access GRANTED" message after 3 failed attempts, while logging an intrusion flag in EEPROM.</li>
    </ul>
    <h3>5.3 Timing Attack Mitigation</h3>
    <ul>
      <li>Uniform Response Time: The checkPassword function enforces a 1-second delay to mask processing time differences.</li>
      <li>Random Delays in Python Script: The attack simulation introduces random delays (0.1-0.3 seconds) to mimic human typing, testing the system's resilience.</li>
    </ul>

    <h2>6. Attack Simulation Analysis</h2>
    <p>
      The Python script simulates two types of attacks:
      <ul>
        <li><b>Dictionary Attack:</b> Tests common passwords (e.g., "1234", "0000") to quickly identify weak passwords.</li>
        <li><b>Timing Attack:</b> For each password position, sends test passwords (e.g., "AXXX", "BXXX") and measures response times. The slowest character is assumed to be correct due to potential processing delays in the Arduino.</li>
      </ul>
    </p>
    <h3>6.1 Limitations</h3>
    <ul>
      <li>The Arduino's uniform delay mitigates timing attacks, but subtle differences may still exist due to hardware constraints.</li>
      <li>The attack script assumes a serial connection, which may not reflect real-world attack vectors (e.g., physical keypad tampering).</li>
    </ul>
    <h3>6.2 Results Visualization</h3>
    <ul>
      <li>Bar plots display average response times for each character at each position, aiding in identifying the correct character.</li>
      <li>The hybrid attack combines dictionary and timing results to guess the full 4-character password.</li>
    </ul>

    <h2>7. Implementation Details</h2>
    <h3>7.1 Arduino Code Workflow</h3>
    <ul>
      <li>Setup: Initializes hardware, loads/generates salt, and displays the system version ("Secure Lock v5.0").</li>
      <li>Main Loop: Handles system lockout and keypad input, processing one key at a time.</li>
      <li>Password Check: Combines hash comparison and typing pattern validation, with a 1-second delay.</li>
      <li>Feedback: Updates the LCD and RGB LED based on access status, controls the relay for unlocking.</li>
    </ul>
    <h3>7.2 Python Attack Workflow</h3>
    <ul>
      <li>Initialization: Establishes a serial connection with the Arduino.</li>
      <li>Hybrid Attack:
        <ul>
          <li>Tests common passwords.</li>
          <li>Performs timing attacks for each position, selecting the slowest character.</li>
          <li>Tests the final candidate password.</li>
        </ul>
      </li>
      <li>Cleanup: Closes the serial connection when complete or interrupted.</li>
    </ul>

    <h2>8. Challenges and Considerations</h2>
    <ul>
      <li>Hardware Constraints: The Arduino's processing power limits the complexity of cryptographic operations.</li>
      <li>Timing Attack Vulnerability: Despite mitigation efforts, microsecond-level timing differences may still be exploitable with advanced equipment.</li>
      <li>EEPROM Wear: Frequent writes to EEPROM (e.g., intrusion flags) may degrade the memory over time.</li>
      <li>Attack Simulation Realism: The Python script assumes serial access, which may not be available in a deployed system.</li>
    </ul>

    <h2>9. Conclusion</h2>
    <p>
      The Door Lock System is a robust access control solution that integrates secure password verification, typing pattern analysis, and anti-tampering mechanisms. The use of SHA-256 hashing, lockout systems, and decoy modes enhances security, while the Python attack simulation provides a valuable tool for testing vulnerabilities. The system is built with accessible hardware and open-source software, making it suitable for educational and prototyping purposes. Future improvements could include advanced cryptographic algorithms, additional sensors (e.g., biometrics), and enhanced timing attack defenses.
    </p>

    {/* Callout */}
    {coolBox(
      <>
        <b>Want to see the code or contribute?</b> <br />
        Check out the project on{' '}
        <a href="https://github.com/thierrynshimiyumukiza" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-300 underline hover:text-blue-800">GitHub</a>
        {' '}or connect with me on{' '}
        <a href="https://www.linkedin.com/in/nshimiyumukiza-thierry-61976a290" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-300 underline hover:text-blue-800">LinkedIn</a>
        !
      </>,
      'blue'
    )}
  </motion.div>
);

// Static Matrix Rain (for hero background)
function MatrixRainStatic() {
  // This is a simple static SVG for visual effect, not animated for performance.
  return (
    <svg width="100%" height="100%">
      <text x="10" y="40" fill="#00ff41" fontFamily="monospace" fontSize="32" opacity="0.2">1010101010101010</text>
      <text x="60" y="80" fill="#00ff41" fontFamily="monospace" fontSize="32" opacity="0.15">A9B8C7D6E5F4G3H2</text>
      <text x="120" y="120" fill="#00ff41" fontFamily="monospace" fontSize="32" opacity="0.12">SECURELOCK</text>
      <text x="200" y="160" fill="#00ff41" fontFamily="monospace" fontSize="32" opacity="0.18">0xDEADBEEF</text>
    </svg>
  );
}

export default PostDoorLockSystem;