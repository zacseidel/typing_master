import React, { useState, useEffect, useRef } from 'react';

const TypingMaster = () => {
  // Practice texts by difficulty level
  const levelTexts = {
    beginner: [
      "cat hat bat sat pat rat mat",
      "the and you for are not",
      "is to on it of in",
      "dad mom son kid pet dog cat",
      "run sit hop jog eat swim play"
    ],
    intermediate: [
      "The quick brown fox jumps over the lazy dog.",
      "Pack my box with five dozen liquor jugs.",
      "How vexingly quick daft zebras jump!",
      "Sphinx of black quartz, judge my vow.",
      "Amazingly few discotheques provide jukeboxes."
    ],
    advanced: [
      "The five boxing wizards jump quickly to deliver the judgment.",
      "Crazy Fredrick bought many very exquisite opal jewels.",
      "We promptly judged antique ivory buckles for the next prize.",
      "A mad boxer shot a quick, gloved jab to the jaw of his dizzy opponent.",
      "The job requires extra pluck and zeal from every young wage earner."
    ],
    expert: [
      "Jaded zombies acted quaintly but kept driving their oxen forward while quickly extemporizing jazz melodies.",
      "The explorer was frozen in his big kayak just after making queer discoveries.",
      "The early morning fog prevented them from seeing the jagged rocks that quickly zapped their boat.",
      "My faxed joke won a pager in the cable TV quiz show with exorbitant prizes for all the participants.",
      "Six big devils from Japan quickly forgot how to waltz as the xylophone players marched in."
    ]
  };

  // Keyboard layout 
  const keyboardLayout = [
    ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
    ['Tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
    ['Caps', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", 'Enter'],
    ['Shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'Shift'],
    ['Ctrl', 'Win', 'Alt', 'Space', 'Alt', 'Win', 'Menu', 'Ctrl']
  ];

  // Finger to key mapping
  const fingerKeyMap = {
    'left-pinky': ['`', '1', 'tab', 'q', 'caps', 'a', 'shift', 'z'],
    'left-ring': ['2', 'w', 's', 'x'],
    'left-middle': ['3', 'e', 'd', 'c'],
    'left-index': ['4', '5', 'r', 't', 'f', 'g', 'v', 'b'],
    'right-index': ['6', '7', 'y', 'u', 'h', 'j', 'n', 'm'],
    'right-middle': ['8', 'i', 'k', ','],
    'right-ring': ['9', 'o', 'l', '.'],
    'right-pinky': ['0', '-', '=', 'backspace', 'p', '[', ']', '\\', ';', "'", 'enter', '/', 'shift']
  };

  // Home row keys
  const homeRowKeys = ['a', 's', 'd', 'f', 'j', 'k', 'l', ';'];

  // State management
  const [level, setLevel] = useState('beginner');
  const [currentText, setCurrentText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [startTime, setStartTime] = useState(null);
  const [completedWords, setCompletedWords] = useState(0);
  const [errors, setErrors] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [activeTextIndex, setActiveTextIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [encouragement, setEncouragement] = useState('');
  const [nextKeyToType, setNextKeyToType] = useState('');
  const [fingerToUse, setFingerToUse] = useState(null);
  
  const inputRef = useRef(null);

  // Initialize with a text
  useEffect(() => {
    setCurrentText(levelTexts[level][activeTextIndex]);
    setUserInput('');
    setNextKeyToType(levelTexts[level][activeTextIndex][0] || '');
    updateFingerHighlight(levelTexts[level][activeTextIndex][0] || '');
  }, [level, activeTextIndex]);

  // Update next key and finger highlight
  useEffect(() => {
    if (currentText && userInput.length < currentText.length) {
      setNextKeyToType(currentText[userInput.length].toLowerCase());
      updateFingerHighlight(currentText[userInput.length].toLowerCase());
    } else {
      setNextKeyToType('');
      setFingerToUse(null);
    }
  }, [userInput, currentText]);

  // Timer logic
  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer + 1);
      }, 1000);
    } else if (!isActive && timer !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, timer]);

  // Calculate WPM and accuracy in real-time
  useEffect(() => {
    if (isActive && startTime) {
      const timeElapsed = timer;
      if (timeElapsed > 0) {
        // Calculate WPM based on standard 5 chars per word
        const wordsTyped = userInput.length / 5;
        const minutes = timeElapsed / 60;
        const currentWpm = Math.round(wordsTyped / minutes);
        setWpm(currentWpm);
        
        // Update encouragement messages based on performance
        updateEncouragement(currentWpm, accuracy);
      }
    }
  }, [isActive, timer, userInput, startTime, accuracy]);

  // Function to determine which finger should be used for a key
  const updateFingerHighlight = (key) => {
    key = key.toLowerCase();
    
    for (const [finger, keys] of Object.entries(fingerKeyMap)) {
      if (keys.includes(key)) {
        setFingerToUse(finger);
        return;
      }
    }
    
    setFingerToUse(null);
  };

  // Update encouragement message
  const updateEncouragement = (currentWpm, currentAccuracy) => {
    if (currentWpm < 20 && currentAccuracy > 90) {
      setEncouragement("Good start! Focus on accuracy before speed.");
    } else if (currentWpm >= 20 && currentWpm < 40 && currentAccuracy > 90) {
      setEncouragement("Nice pace! You're building good habits.");
    } else if (currentWpm >= 40 && currentAccuracy > 95) {
      setEncouragement("Impressive typing! Both fast and accurate!");
    } else if (currentAccuracy < 80) {
      setEncouragement("Slow down a bit and focus on accuracy.");
    } else if (currentWpm >= 60 && currentAccuracy > 97) {
      setEncouragement("Wow! You're a typing master!");
    } else {
      setEncouragement("Keep practicing, you're making progress!");
    }
  };

  // Handle user input
  const handleInputChange = (e) => {
    const value = e.target.value;
    
    // Start timer on first input
    if (!isActive && value.length === 1) {
      setIsActive(true);
      setStartTime(Date.now());
    }
    
    // Calculate errors and accuracy in real-time
    let currentErrors = 0;
    let totalAttempted = 0;
    
    // Count errors and total characters attempted
    for (let i = 0; i < value.length; i++) {
      totalAttempted++;
      if (value[i] !== currentText[i]) {
        currentErrors++;
      }
    }
    
    setErrors(currentErrors);
    // Calculate accuracy based on total characters attempted so far, not just current input length
    const calculatedAccuracy = totalAttempted > 0 
      ? Math.max(0, Math.round(((totalAttempted - currentErrors) / totalAttempted) * 100))
      : 100;
    setAccuracy(calculatedAccuracy);
    
    // Update completed words count
    const words = value.trim().split(' ').filter(word => word !== '');
    const prevWords = userInput.trim().split(' ').filter(word => word !== '');
    
    if (words.length > prevWords.length) {
      // Word completed - award points
      setScore(prevScore => prevScore + (10 * calculatedAccuracy / 100));
      setCompletedWords(words.length);
    }
    
    // Check if exercise is completed
    if (value === currentText) {
      setIsActive(false);
      setIsCompleted(true);
      // Bonus for completing the full text
      const completionBonus = Math.round(50 * (calculatedAccuracy / 100) * (Math.min(wpm, 60) / 30));
      setScore(prevScore => prevScore + completionBonus);
      setEncouragement(`Great job! You earned a completion bonus of ${completionBonus} points!`);
    }
    
    setUserInput(value);
  };

  // Reset the exercise
  const handleReset = () => {
    setUserInput('');
    setTimer(0);
    setIsActive(false);
    setWpm(0);
    setAccuracy(100);
    setStartTime(null);
    setCompletedWords(0);
    setErrors(0);
    setIsCompleted(false);
    setEncouragement('');
    inputRef.current.focus();
    setNextKeyToType(currentText[0] || '');
    updateFingerHighlight(currentText[0] || '');
  };

  // Next text passage
  const handleNextText = () => {
    const nextIndex = (activeTextIndex + 1) % levelTexts[level].length;
    setActiveTextIndex(nextIndex);
    handleReset();
  };

  // Change level
  const handleLevelChange = (newLevel) => {
    setLevel(newLevel);
    setActiveTextIndex(0);
    handleReset();
  };

  // Render text with highlighting
  const renderText = () => {
    return currentText.split('').map((char, index) => {
      let charClass = 'text-gray-700';
      
      if (index < userInput.length) {
        charClass = userInput[index] === char ? 'text-green-600 font-bold' : 'text-red-600 font-bold bg-red-100';
      } else if (index === userInput.length) {
        // Highlight the next character to type
        charClass = 'text-blue-600 font-bold bg-blue-100';
      }
      
      return (
        <span key={index} className={charClass}>
          {char}
        </span>
      );
    });
  };

  // Render keyboard
  const renderKeyboard = () => {
    return (
      <div className="mb-8 w-full max-w-4xl">
        {keyboardLayout.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center mb-1">
            {row.map((key, keyIndex) => {
              let keyClass = "mx-1 text-center rounded border border-gray-300 ";
              let width = "w-10";
              
              // Set key width based on special keys
              if (key === 'Space') width = "w-40";
              else if (key === 'Backspace' || key === 'Tab' || key === 'Caps' || key === 'Enter') width = "w-16";
              else if (key === 'Shift') width = "w-20";
              
              // Highlight next key to type
              if (key.toLowerCase() === nextKeyToType) {
                keyClass += "bg-blue-500 text-white font-bold ";
              } 
              // Highlight home row keys
              else if (homeRowKeys.includes(key.toLowerCase())) {
                keyClass += "bg-gray-200 ";
              } else {
                keyClass += "bg-white ";
              }
              
              return (
                <div 
                  key={keyIndex} 
                  className={`${keyClass} ${width} h-10 flex items-center justify-center`}
                >
                  {key}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  // Render hand diagram
  const renderHandDiagram = () => {
    // We'll create a simple visual representation of hands
    return (
      <div className="flex justify-center mb-8 w-full">
        <div className="flex space-x-8">
          {/* Left hand */}
          <div className="relative w-48 h-32 bg-gray-100 rounded-b-full rounded-t-lg border border-gray-300">
            <div className="absolute top-0 left-0 w-full h-full flex justify-around pt-2">
              <div className={`w-6 h-16 bg-${fingerToUse === 'left-pinky' ? 'blue-500' : homeRowKeys.includes('a') ? 'gray-300' : 'gray-100'} rounded-b-full rounded-t-lg`}></div>
              <div className={`w-6 h-18 bg-${fingerToUse === 'left-ring' ? 'blue-500' : homeRowKeys.includes('s') ? 'gray-300' : 'gray-100'} rounded-b-full rounded-t-lg`}></div>
              <div className={`w-6 h-20 bg-${fingerToUse === 'left-middle' ? 'blue-500' : homeRowKeys.includes('d') ? 'gray-300' : 'gray-100'} rounded-b-full rounded-t-lg`}></div>
              <div className={`w-6 h-19 bg-${fingerToUse === 'left-index' ? 'blue-500' : homeRowKeys.includes('f') ? 'gray-300' : 'gray-100'} rounded-b-full rounded-t-lg`}></div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-10 bg-gray-200 rounded-b-full"></div>
            <div className="absolute bottom-2 left-0 right-0 text-center text-xs font-bold">Left Hand</div>
          </div>
          
          {/* Right hand */}
          <div className="relative w-48 h-32 bg-gray-100 rounded-b-full rounded-t-lg border border-gray-300">
            <div className="absolute top-0 left-0 w-full h-full flex justify-around pt-2">
              <div className={`w-6 h-19 bg-${fingerToUse === 'right-index' ? 'blue-500' : homeRowKeys.includes('j') ? 'gray-300' : 'gray-100'} rounded-b-full rounded-t-lg`}></div>
              <div className={`w-6 h-20 bg-${fingerToUse === 'right-middle' ? 'blue-500' : homeRowKeys.includes('k') ? 'gray-300' : 'gray-100'} rounded-b-full rounded-t-lg`}></div>
              <div className={`w-6 h-18 bg-${fingerToUse === 'right-ring' ? 'blue-500' : homeRowKeys.includes('l') ? 'gray-300' : 'gray-100'} rounded-b-full rounded-t-lg`}></div>
              <div className={`w-6 h-16 bg-${fingerToUse === 'right-pinky' ? 'blue-500' : homeRowKeys.includes(';') ? 'gray-300' : 'gray-100'} rounded-b-full rounded-t-lg`}></div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-10 bg-gray-200 rounded-b-full"></div>
            <div className="absolute bottom-2 left-0 right-0 text-center text-xs font-bold">Right Hand</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl p-6 mx-auto bg-white rounded-lg shadow-lg">
      <h1 className="mb-4 text-3xl font-bold text-blue-600">Typing Master</h1>
      
      {/* Level Selection */}
      <div className="flex justify-center w-full mb-6 space-x-4">
        <button 
          onClick={() => handleLevelChange('beginner')} 
          className={`px-4 py-2 rounded-lg ${level === 'beginner' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Beginner
        </button>
        <button 
          onClick={() => handleLevelChange('intermediate')} 
          className={`px-4 py-2 rounded-lg ${level === 'intermediate' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Intermediate
        </button>
        <button 
          onClick={() => handleLevelChange('advanced')} 
          className={`px-4 py-2 rounded-lg ${level === 'advanced' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Advanced
        </button>
        <button 
          onClick={() => handleLevelChange('expert')} 
          className={`px-4 py-2 rounded-lg ${level === 'expert' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Expert
        </button>
      </div>
      
      {/* Stats Display */}
      <div className="flex justify-around w-full mb-6">
        <div className="flex flex-col items-center p-3 bg-blue-50 rounded-lg">
          <span className="text-sm text-blue-600">WPM</span>
          <span className="text-2xl font-bold">{wpm}</span>
        </div>
        <div className="flex flex-col items-center p-3 bg-green-50 rounded-lg">
          <span className="text-sm text-green-600">Accuracy</span>
          <span className="text-2xl font-bold">{accuracy}%</span>
        </div>
        <div className="flex flex-col items-center p-3 bg-purple-50 rounded-lg">
          <span className="text-sm text-purple-600">Time</span>
          <span className="text-2xl font-bold">{timer}s</span>
        </div>
        <div className="flex flex-col items-center p-3 bg-yellow-50 rounded-lg">
          <span className="text-sm text-yellow-600">Words</span>
          <span className="text-2xl font-bold">{completedWords}</span>
        </div>
        <div className="flex flex-col items-center p-3 bg-pink-50 rounded-lg">
          <span className="text-sm text-pink-600">Score</span>
          <span className="text-2xl font-bold">{Math.round(score)}</span>
        </div>
      </div>
      
      {/* Text Display */}
      <div className="w-full p-4 mb-6 text-lg bg-gray-50 rounded-lg min-h-16">
        {renderText()}
      </div>
      
      {/* Input Field */}
      <div className="w-full mb-6">
        <input
          ref={inputRef}
          type="text"
          value={userInput}
          onChange={handleInputChange}
          className="w-full p-3 text-lg border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-500"
          placeholder="Start typing..."
          disabled={isCompleted}
          autoFocus
        />
      </div>
      
      {/* Encouragement Message */}
      {encouragement && (
        <div className="w-full mb-6 p-3 bg-blue-50 rounded-lg text-center text-blue-800">
          {encouragement}
        </div>
      )}
      
      {/* Keyboard Visualization */}
      {renderKeyboard()}
      
      {/* Hand Diagram */}
      {renderHandDiagram()}
      
      {/* Controls */}
      <div className="flex space-x-4">
        <button
          onClick={handleReset}
          className="px-6 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none"
        >
          Reset
        </button>
        <button
          onClick={handleNextText}
          className="px-6 py-2 text-white bg-green-500 rounded-lg hover:bg-green-600 focus:outline-none"
        >
          Next Text
        </button>
      </div>
      
      {/* Completion Message */}
      {isCompleted && (
        <div className="mt-6 p-4 bg-green-100 text-green-800 rounded-lg">
          <p className="text-xl font-bold">Great job! 🎉</p>
          <p>You completed the text with {accuracy}% accuracy at {wpm} WPM.</p>
          <p>Score earned: {Math.round(score)} points</p>
        </div>
      )}
    </div>
  );
};

export default TypingMaster;
