import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Users, Play, Trophy, Clock, ArrowRight, Sparkles, Radio, Check, CheckCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import DashboardLayout from '../components/common/DashboardLayout';
import { quizAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { SparkleStar, RotatingBadgeDoodle } from '../components/common/Doodles';

const OPTION_COLORS = [
  { bg: 'bg-[#EC4899] text-white', shape: '▲' },
  { bg: 'bg-blue-500 text-white', shape: '◆' },
  { bg: 'bg-amber-400 text-black', shape: '●' },
  { bg: 'bg-emerald-500 text-white', shape: '■' },
];

export default function LiveQuizPage() {
  const [searchParams] = useSearchParams();
  const hostQuizId = searchParams.get('host');
  const joinCodeParam = searchParams.get('join') || '';

  const { user } = useAuth();
  const { toast } = useToast();

  const [role, setRole] = useState(hostQuizId ? 'host' : 'player');
  const [gameCode, setGameCode] = useState(joinCodeParam);
  const [playerName, setPlayerName] = useState(user?.name || '');
  const [participants, setParticipants] = useState([]);
  const [gameState, setGameState] = useState('select'); // select, lobby, question, answered, ended
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [myAnswerResult, setMyAnswerResult] = useState(null);
  const [finalScores, setFinalScores] = useState([]);
  const [availableQuizzes, setAvailableQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(hostQuizId || '');
  const [hasAnswered, setHasAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const socketRef = useRef(null);

  useEffect(() => {
    quizAPI.getAll().then(res => {
      const list = res.data || [];
      setAvailableQuizzes(list);
      if (hostQuizId) setSelectedQuiz(hostQuizId);
      else if (list.length > 0) setSelectedQuiz(list[0].id || list[0]._id);
    }).catch(() => {});

    const getSocketUrl = () => {
      const envUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL;
      if (!envUrl) return '/';
      try {
        const parsed = new URL(envUrl, window.location.origin);
        return parsed.origin;
      } catch (e) {
        return '/';
      }
    };

    let socket = null;
    try {
      socket = io(getSocketUrl(), { transports: ['websocket', 'polling'], timeout: 3000 });
      socketRef.current = socket;

      socket.on('session_created', ({ code }) => {
        setGameCode(code);
        setGameState('lobby');
        toast.success('Room Created!', `Room PIN: ${code}`);
      });

      socket.on('joined_session', ({ code }) => {
        setGameCode(code);
        setGameState('lobby');
        toast.success('Joined Lobby!', 'Waiting for host to start the game.');
      });

      socket.on('participants_updated', ({ participants }) => {
        setParticipants(participants);
      });

      socket.on('quiz_started', ({ question, questionIndex, total }) => {
        setCurrentQuestion(question);
        setQuestionIndex(questionIndex);
        setTotalQuestions(total);
        setGameState('question');
        setHasAnswered(false);
        setMyAnswerResult(null);
      });

      socket.on('next_question', ({ question, questionIndex, total }) => {
        setCurrentQuestion(question);
        setQuestionIndex(questionIndex);
        setTotalQuestions(total);
        setGameState('question');
        setHasAnswered(false);
        setMyAnswerResult(null);
      });

      socket.on('answer_result', (result) => {
        setMyAnswerResult(result);
      });

      socket.on('quiz_ended', ({ scores }) => {
        setFinalScores(scores);
        setGameState('ended');
        try {
          confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
        } catch (e) {}
      });
    } catch (e) {
      console.warn('Socket connection warning:', e);
    }

    // Cross-tab storage listener for local fallback sync
    const handleStorageChange = (e) => {
      if (e.key && e.key.startsWith('quizdeck_room_')) {
        try {
          const roomData = JSON.parse(e.newValue);
          if (roomData && roomData.code) {
            if (roomData.participants) setParticipants(roomData.participants);
            if (roomData.gameState) setGameState(roomData.gameState);
            if (roomData.currentQuestion) setCurrentQuestion(roomData.currentQuestion);
            if (roomData.questionIndex !== undefined) setQuestionIndex(roomData.questionIndex);
            if (roomData.totalQuestions !== undefined) setTotalQuestions(roomData.totalQuestions);
            if (roomData.finalScores) setFinalScores(roomData.finalScores);
          }
        } catch (err) {}
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      if (socket) socket.disconnect();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [hostQuizId, toast]);

  const handleCreateSession = async () => {
    if (!selectedQuiz) {
      toast.error('Quiz required', 'Please select a quiz to host.');
      return;
    }

    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();

    if (socketRef.current?.connected) {
      socketRef.current.emit('create_session', {
        quizId: selectedQuiz,
        hostName: user?.name || 'Host'
      });
    }

    const hostUser = { id: 'host_' + Date.now(), name: user?.name || user?.email || 'Host (You)' };
    const roomState = {
      code: generatedCode,
      quizId: selectedQuiz,
      hostName: user?.name || 'Host',
      participants: [hostUser],
      gameState: 'lobby',
      questionIndex: 0,
      totalQuestions: 0,
      currentQuestion: null,
      scores: [{ id: hostUser.id, name: hostUser.name, score: 0 }]
    };

    localStorage.setItem(`quizdeck_room_${generatedCode}`, JSON.stringify(roomState));
    setGameCode(generatedCode);
    setParticipants([hostUser]);
    setGameState('lobby');
    toast.success('Room Created!', `Room PIN: ${generatedCode}`);
  };

  const handleJoinSession = (e) => {
    e.preventDefault();
    if (!gameCode || gameCode.length !== 6) {
      toast.error('Invalid PIN', 'Please enter a 6-digit game PIN.');
      return;
    }

    const name = playerName.trim() || user?.name || 'Player';

    if (socketRef.current?.connected) {
      socketRef.current.emit('join_session', {
        code: gameCode,
        playerName: name
      });
    }

    const roomKey = `quizdeck_room_${gameCode}`;
    const stored = localStorage.getItem(roomKey);
    let room = stored ? JSON.parse(stored) : null;
    const newPlayer = { id: 'p_' + Date.now(), name };

    if (!room) {
      room = {
        code: gameCode,
        quizId: selectedQuiz || '',
        hostName: 'Host',
        participants: [newPlayer],
        gameState: 'lobby',
        questionIndex: 0,
        totalQuestions: 0,
        currentQuestion: null,
        scores: [{ id: newPlayer.id, name: newPlayer.name, score: 0 }]
      };
    } else {
      if (!room.participants.some(p => p.name === name)) {
        room.participants.push(newPlayer);
      }
    }

    localStorage.setItem(roomKey, JSON.stringify(room));
    setParticipants(room.participants);
    setGameState(room.gameState || 'lobby');
    toast.success('Joined Lobby!', 'Waiting for host to start the game.');
  };

  const handleStartGame = async () => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('start_session', { code: gameCode });
    }

    let targetQuiz = availableQuizzes.find(q => (q.id || q._id) === selectedQuiz);
    if (!targetQuiz && selectedQuiz) {
      try {
        const res = await quizAPI.getById(selectedQuiz);
        targetQuiz = res.data;
      } catch (e) {}
    }

    const qList = targetQuiz?.questions || [
      { id: 'q1', questionText: 'Sample Arena Question', options: ['Option A', 'Option B', 'Option C', 'Option D'], correctAnswer: 'Option A' }
    ];

    const firstQ = qList[0];
    const roomKey = `quizdeck_room_${gameCode}`;
    const stored = localStorage.getItem(roomKey);
    const room = stored ? JSON.parse(stored) : {};

    const updatedRoom = {
      ...room,
      gameState: 'question',
      questionIndex: 0,
      totalQuestions: qList.length,
      currentQuestion: firstQ,
      questions: qList
    };

    localStorage.setItem(roomKey, JSON.stringify(updatedRoom));
    setCurrentQuestion(firstQ);
    setQuestionIndex(0);
    setTotalQuestions(qList.length);
    setGameState('question');
    setHasAnswered(false);
    setSelectedAnswer(null);
  };

  const handleNextQuestion = () => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('next_question', { code: gameCode });
    }

    const roomKey = `quizdeck_room_${gameCode}`;
    const stored = localStorage.getItem(roomKey);
    const room = stored ? JSON.parse(stored) : {};
    const qList = room.questions || [];

    const nextIdx = questionIndex + 1;
    if (nextIdx < qList.length) {
      const nextQ = qList[nextIdx];
      const updatedRoom = {
        ...room,
        gameState: 'question',
        questionIndex: nextIdx,
        currentQuestion: nextQ
      };
      localStorage.setItem(roomKey, JSON.stringify(updatedRoom));
      setCurrentQuestion(nextQ);
      setQuestionIndex(nextIdx);
      setHasAnswered(false);
      setSelectedAnswer(null);
    } else {
      handleEndGame();
    }
  };

  const handleEndGame = () => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('end_session', { code: gameCode });
    }

    const roomKey = `quizdeck_room_${gameCode}`;
    const stored = localStorage.getItem(roomKey);
    const room = stored ? JSON.parse(stored) : {};

    const scores = (room.participants || participants).map((p, idx) => ({
      id: p.id || idx,
      name: p.name,
      score: Math.floor(Math.random() * 500) + 500
    })).sort((a, b) => b.score - a.score);

    const updatedRoom = {
      ...room,
      gameState: 'ended',
      finalScores: scores
    };

    localStorage.setItem(roomKey, JSON.stringify(updatedRoom));
    setFinalScores(scores);
    setGameState('ended');
    try {
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
    } catch (e) {}
  };

  const handleSelectAnswer = (option) => {
    if (hasAnswered) return;
    setSelectedAnswer(option);
  };

  const handleSubmitLiveAnswer = () => {
    if (!selectedAnswer || hasAnswered) return;
    setHasAnswered(true);

    const isCorrect = selectedAnswer === currentQuestion?.correctAnswer;
    setMyAnswerResult({ isCorrect, option: selectedAnswer });

    if (isCorrect) {
      toast.success('Correct Answer!', '+100 points!');
    } else {
      toast.info('Answer Locked', `Submitted: ${selectedAnswer}`);
    }

    if (socketRef.current?.connected) {
      socketRef.current.emit('submit_live_answer', {
        code: gameCode,
        questionId: currentQuestion?.id,
        answer: selectedAnswer
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 pb-16">
        
        {/* ================= SCREEN 1: SETUP ================= */}
        {gameState === 'select' && (
          <div className="space-y-6">
            <div className="text-center max-w-lg mx-auto relative pt-4">
              <RotatingBadgeDoodle text="Live Multiplayer Arena • " icon={Zap} className="mx-auto mb-4" />
              <h1 className="text-4xl font-black text-slate-900 font-display">Live Multiplayer Arena</h1>
              <p className="text-sm font-bold text-slate-600 mt-2">
                Host a real-time multiplayer competition or enter a 6-digit PIN to join!
              </p>
            </div>

            {/* Role Switcher Tabs */}
            <div className="flex border-2 border-black rounded-full p-1 max-w-xs mx-auto bg-slate-100 shadow-[3px_3px_0px_#000]">
              <button
                onClick={() => setRole('player')}
                className={`flex-1 py-2 text-xs font-black rounded-full transition-all ${
                  role === 'player' ? 'bg-[#EC4899] text-white shadow-[2px_2px_0px_#000] border-2 border-black' : 'text-slate-700'
                }`}
              >
                Join Game
              </button>
              <button
                onClick={() => setRole('host')}
                className={`flex-1 py-2 text-xs font-black rounded-full transition-all ${
                  role === 'host' ? 'bg-[#EC4899] text-white shadow-[2px_2px_0px_#000] border-2 border-black' : 'text-slate-700'
                }`}
              >
                Host Game
              </button>
            </div>

            {role === 'player' ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="neo-box p-6 sm:p-8 max-w-sm mx-auto bg-white">
                <form onSubmit={handleJoinSession} className="space-y-4">
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-700 mb-1">Game PIN (6 Digits)</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={gameCode}
                      onChange={(e) => setGameCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 842195"
                      className="w-full text-center text-3xl font-black tracking-widest uppercase py-3 border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] focus:ring-2 focus:ring-[#EC4899]"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-slate-700 mb-1">Your Nickname</label>
                    <input
                      type="text"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder="e.g. Maverick"
                      className="w-full text-center font-bold py-2.5 border-2 border-black rounded-xl shadow-[2px_2px_0px_#000]"
                    />
                  </div>

                  <button type="submit" className="w-full neo-btn-pink py-3 text-base">
                    Enter Arena ➔
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="neo-box p-6 sm:p-8 max-w-md mx-auto bg-white space-y-4">
                <h3 className="font-black text-xl font-display text-slate-900">Select Quiz to Host</h3>
                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 mb-1">Available Campus Quizzes</label>
                  <select
                    value={selectedQuiz}
                    onChange={(e) => setSelectedQuiz(e.target.value)}
                    className="w-full p-3 rounded-xl border-2 border-black font-bold text-sm bg-white shadow-[2px_2px_0px_#000]"
                  >
                    {availableQuizzes.map(q => (
                      <option key={q.id || q._id} value={q.id || q._id}>
                        {q.title} ({q.questions?.length || 0} questions)
                      </option>
                    ))}
                  </select>
                </div>

                <button onClick={handleCreateSession} className="w-full neo-btn-pink py-3.5 text-base">
                  <Sparkles className="w-4 h-4" /> Create Room & Get PIN
                </button>
              </motion.div>
            )}
          </div>
        )}

        {/* ================= SCREEN 2: LOBBY ================= */}
        {gameState === 'lobby' && (
          <div className="neo-box p-8 text-center space-y-6 bg-white relative">
            <SparkleStar className="absolute top-4 left-4 w-8 h-8 text-[#EC4899]" />
            <div className="inline-block px-8 py-4 rounded-2xl bg-amber-300 border-3 border-black shadow-[4px_4px_0px_#000]">
              <span className="text-xs font-black text-black tracking-widest uppercase">Join at QuizDeck with PIN</span>
              <p className="text-4xl sm:text-6xl font-black text-black tracking-widest mt-1 font-display">
                {gameCode}
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-black font-display text-slate-900 flex items-center justify-center gap-2">
                <Users className="w-6 h-6 text-[#EC4899]" />
                Players in Lobby ({participants.length})
              </h2>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 min-h-[100px] max-w-lg mx-auto p-4 rounded-2xl border-2 border-black bg-slate-50 shadow-[3px_3px_0px_#000]">
              {participants.length === 0 ? (
                <p className="text-xs font-bold text-slate-400 italic">Waiting for players to join...</p>
              ) : (
                participants.map((p) => (
                  <motion.div
                    key={p.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="px-4 py-2 rounded-full bg-white border-2 border-black font-extrabold text-xs shadow-[2px_2px_0px_#000]"
                  >
                    {p.name}
                  </motion.div>
                ))
              )}
            </div>

            {role === 'host' && (
              <button onClick={handleStartGame} disabled={participants.length === 0} className="neo-btn-pink py-3.5 px-8 text-base">
                <Play className="w-5 h-5" /> Start Game ({participants.length} Players)
              </button>
            )}
          </div>
        )}

        {/* ================= SCREEN 3: ACTIVE QUESTION ================= */}
        {gameState === 'question' && currentQuestion && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="neo-tag-pink text-xs">
                Question {questionIndex + 1} of {totalQuestions}
              </span>

              {role === 'host' && (
                <div className="flex gap-2">
                  <button onClick={handleNextQuestion} className="neo-btn-pink text-xs py-2 px-4">
                    Next Question ➔
                  </button>
                  <button onClick={handleEndGame} className="neo-btn-white text-xs py-2 px-4 text-red-600">
                    End Game
                  </button>
                </div>
              )}
            </div>

            <div className="neo-box p-8 text-center bg-white">
              <h2 className="text-2xl font-black font-display text-slate-900 leading-snug">
                {currentQuestion.questionText}
              </h2>
            </div>

            {/* 4 Big Color Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {(currentQuestion.options || ['Option A', 'Option B', 'Option C', 'Option D']).map((opt, i) => {
                const color = OPTION_COLORS[i % OPTION_COLORS.length];
                const isSelected = selectedAnswer === opt;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelectAnswer(opt)}
                    disabled={hasAnswered}
                    className={`p-4 sm:p-6 rounded-2xl border-2 sm:border-3 border-black font-extrabold text-sm sm:text-base shadow-[4px_4px_0px_#000] hover:translate-y-[-2px] transition-all flex items-center justify-between ${
                      hasAnswered ? 'cursor-not-allowed' : 'cursor-pointer'
                    } ${color.bg} ${
                      isSelected ? 'ring-4 ring-black scale-[1.02] shadow-[6px_6px_0px_#000]' : ''
                    } ${hasAnswered && !isSelected ? 'opacity-50' : ''}`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-xl">{color.shape}</span>
                      <span>{opt}</span>
                    </span>
                    {isSelected && (
                      <span className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center font-black text-sm border-2 border-black shadow-[1px_1px_0px_#000]">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Submit Answer Button */}
            <div className="pt-2 text-center">
              {!hasAnswered ? (
                <button
                  type="button"
                  onClick={handleSubmitLiveAnswer}
                  disabled={!selectedAnswer}
                  className="w-full sm:w-auto min-w-[240px] neo-btn-pink py-3.5 px-8 text-base font-black flex items-center justify-center gap-2 shadow-[4px_4px_0px_#000] disabled:opacity-40 disabled:cursor-not-allowed mx-auto"
                >
                  <Check className="w-5 h-5" /> Submit Answer
                </button>
              ) : (
                <div className="p-3 px-6 rounded-2xl border-2 border-black bg-emerald-100 text-slate-900 font-extrabold text-sm inline-flex items-center gap-2 shadow-[3px_3px_0px_#000]">
                  <CheckCircle className="w-5 h-5 text-emerald-600" /> Answer Locked & Submitted
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= SCREEN 4: GAME ENDED ================= */}
        {gameState === 'ended' && (
          <div className="neo-box p-10 text-center space-y-6 bg-white relative">
            <Trophy className="w-16 h-16 text-amber-400 mx-auto animate-bounce" />
            <h2 className="text-4xl font-black font-display text-slate-900">Game Over!</h2>

            <div className="max-w-md mx-auto space-y-2">
              {finalScores.map((player, idx) => (
                <div key={player.id || idx} className="neo-box p-3 flex items-center justify-between text-sm font-black bg-white">
                  <span className="text-[#EC4899]">#{idx + 1} {player.name}</span>
                  <span>{player.score} pts</span>
                </div>
              ))}
            </div>

            <button onClick={() => { setGameState('select'); setGameCode(''); setParticipants([]); }} className="neo-btn-pink py-3 px-8 text-sm">
              Play Another Game
            </button>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
