import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Users, Play, Trophy, Clock, CheckCircle, XCircle, ArrowRight,
  LogOut, Crown, Sparkles, Volume2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import DashboardLayout from '../components/common/DashboardLayout';
import { quizAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

// 4 Kahoot-style color themes for options
const OPTION_COLORS = [
  { bg: 'bg-rose-500 hover:bg-rose-600 border-rose-600', text: 'text-white', shape: '▲' },
  { bg: 'bg-blue-500 hover:bg-blue-600 border-blue-600', text: 'text-white', shape: '◆' },
  { bg: 'bg-amber-500 hover:bg-amber-600 border-amber-600', text: 'text-white', shape: '●' },
  { bg: 'bg-emerald-500 hover:bg-emerald-600 border-emerald-600', text: 'text-white', shape: '■' },
];

export default function LiveQuizPage() {
  const [searchParams] = useSearchParams();
  const hostQuizId = searchParams.get('host');
  const joinCodeParam = searchParams.get('join') || '';

  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Mode: 'select' | 'lobby' | 'playing' | 'ended'
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

  const socketRef = useRef(null);

  useEffect(() => {
    // Load quizzes if host needs to choose
    quizAPI.getAll().then(res => {
      setAvailableQuizzes(res.data);
      if (hostQuizId) setSelectedQuiz(hostQuizId);
      else if (res.data.length > 0) setSelectedQuiz(res.data[0]._id);
    }).catch(() => {});

    // Init socket
    const socket = io('/', { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('session_created', ({ code, quiz }) => {
      setGameCode(code);
      setGameState('lobby');
      toast.success('Live Session Created!', `Room code: ${code}`);
    });

    socket.on('joined_session', ({ code, quiz }) => {
      setGameCode(code);
      setGameState('lobby');
      toast.success('Joined lobby!', 'Waiting for host to start the game.');
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

    socket.on('leaderboard_update', ({ participants }) => {
      setParticipants(participants);
    });

    socket.on('quiz_ended', ({ scores }) => {
      setFinalScores(scores);
      setGameState('ended');
      try {
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
      } catch (e) {}
    });

    socket.on('error', ({ message }) => {
      toast.error('Game Error', message);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleCreateSession = () => {
    if (!selectedQuiz) {
      toast.error('Quiz required', 'Please pick a quiz to host.');
      return;
    }
    socketRef.current.emit('create_session', {
      quizId: selectedQuiz,
      hostName: user?.name || 'Host'
    });
  };

  const handleJoinSession = (e) => {
    e.preventDefault();
    if (!gameCode || gameCode.length !== 6) {
      toast.error('Invalid PIN', 'Please enter a 6-digit game PIN.');
      return;
    }
    if (!playerName.trim()) {
      toast.error('Name required', 'Please enter your nickname.');
      return;
    }
    socketRef.current.emit('join_session', {
      code: gameCode,
      playerName: playerName.trim()
    });
  };

  const handleStartGame = () => {
    socketRef.current.emit('start_session', { code: gameCode });
  };

  const handleNextQuestion = () => {
    socketRef.current.emit('next_question', { code: gameCode });
  };

  const handleEndGame = () => {
    socketRef.current.emit('end_session', { code: gameCode });
  };

  const handleSelectAnswer = (option) => {
    if (hasAnswered) return;
    setHasAnswered(true);
    socketRef.current.emit('submit_live_answer', {
      code: gameCode,
      questionId: currentQuestion.id,
      answer: option
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto pb-12">
        {/* ========================================================= */}
        {/* SCREEN 1: SELECT MODE / INITIAL SETUP                     */}
        {/* ========================================================= */}
        {gameState === 'select' && (
          <div className="space-y-6">
            <div className="text-center max-w-lg mx-auto mb-8">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/25">
                <Zap className="w-8 h-8" />
              </div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white">Live Multiplayer Arena</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                Host a real-time multiplayer competition or enter a 6-digit PIN to play with friends!
              </p>
            </div>

            {/* Role switch tab */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl max-w-xs mx-auto mb-8">
              <button
                onClick={() => setRole('player')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  role === 'player'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                🎮 Join Game
              </button>
              <button
                onClick={() => setRole('host')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  role === 'host'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                👑 Host Game
              </button>
            </div>

            {role === 'player' ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card max-w-sm mx-auto p-6"
              >
                <form onSubmit={handleJoinSession} className="space-y-4">
                  <div>
                    <label className="label">Game PIN (6 Digits)</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={gameCode}
                      onChange={(e) => setGameCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 842195"
                      className="input text-center text-2xl font-black tracking-widest uppercase"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="label">Your Nickname</label>
                    <input
                      type="text"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder="e.g. Maverick"
                      className="input text-center font-bold"
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-primary w-full py-3 text-base justify-center shadow-lg shadow-indigo-500/25"
                  >
                    Enter Arena <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card max-w-md mx-auto p-6 space-y-4"
              >
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Select Quiz to Host</h3>
                <div>
                  <label className="label">Available Quizzes</label>
                  <select
                    value={selectedQuiz}
                    onChange={(e) => setSelectedQuiz(e.target.value)}
                    className="input text-sm"
                  >
                    {availableQuizzes.map(q => (
                      <option key={q._id} value={q._id}>
                        {q.title} ({q.questions?.length || 0} questions)
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleCreateSession}
                  className="btn-primary w-full py-3 justify-center bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 shadow-lg shadow-amber-500/25"
                >
                  <Sparkles className="w-4 h-4" /> Create Room & Get PIN
                </button>
              </motion.div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* SCREEN 2: LOBBY (WAITING FOR PLAYERS)                      */}
        {/* ========================================================= */}
        {gameState === 'lobby' && (
          <div className="card text-center p-8 space-y-6">
            <div className="inline-block px-6 py-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800">
              <span className="text-xs font-bold text-indigo-500 tracking-widest uppercase">Join at QuizHub with PIN</span>
              <p className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-widest mt-1">
                {gameCode}
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2">
                <Users className="w-5 h-5 text-indigo-500" />
                Players in Lobby ({participants.length})
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {role === 'host' ? 'Press "Start Game" when all players are in!' : 'Waiting for host to begin the countdown...'}
              </p>
            </div>

            {/* Players Bubbles */}
            <div className="flex flex-wrap items-center justify-center gap-3 min-h-[120px] max-w-lg mx-auto p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
              {participants.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No players have entered yet...</p>
              ) : (
                participants.map((p) => (
                  <motion.div
                    key={p.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-700 shadow-sm border border-slate-200 dark:border-slate-600 text-xs font-bold text-slate-800 dark:text-white"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    {p.name}
                  </motion.div>
                ))
              )}
            </div>

            {role === 'host' && (
              <button
                onClick={handleStartGame}
                disabled={participants.length === 0}
                className="btn-primary px-8 py-3.5 text-base mx-auto bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 shadow-lg shadow-emerald-500/25 disabled:opacity-50"
              >
                <Play className="w-5 h-5" /> Start Game ({participants.length} Players)
              </button>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* SCREEN 3: ACTIVE QUESTION IN GAME                         */}
        {/* ========================================================= */}
        {gameState === 'question' && currentQuestion && (
          <div className="space-y-6">
            {/* Top status */}
            <div className="flex items-center justify-between">
              <span className="badge badge-indigo text-xs">
                Question {questionIndex + 1} of {totalQuestions}
              </span>

              {role === 'host' && (
                <div className="flex gap-2">
                  <button
                    onClick={handleNextQuestion}
                    className="btn-primary text-xs py-1.5"
                  >
                    Next Question <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleEndGame}
                    className="btn-secondary text-xs py-1.5 text-red-500"
                  >
                    End
                  </button>
                </div>
              )}
            </div>

            {/* Question Card */}
            <div className="card text-center p-8 shadow-xl">
              {currentQuestion.imageUrl && (
                <img
                  src={currentQuestion.imageUrl}
                  alt="Question"
                  className="max-h-48 rounded-xl mx-auto object-cover mb-4"
                />
              )}
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-snug">
                {currentQuestion.questionText}
              </h2>
            </div>

            {/* Feedback notification if answered */}
            <AnimatePresence>
              {myAnswerResult && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`p-4 rounded-2xl text-center font-bold text-sm ${
                    myAnswerResult.isCorrect
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                      : 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                  }`}
                >
                  {myAnswerResult.isCorrect
                    ? `🎉 Correct! +${myAnswerResult.points} points!`
                    : '❌ Incorrect! Better luck on next question!'}
                </motion.div>
              )}
            </AnimatePresence>

            {/* 4 Big Color Options (Kahoot style) */}
            <div className="grid sm:grid-cols-2 gap-4">
              {(currentQuestion.options || ['Option A', 'Option B', 'Option C', 'Option D']).map((opt, i) => {
                const color = OPTION_COLORS[i % OPTION_COLORS.length];
                return (
                  <button
                    key={i}
                    onClick={() => handleSelectAnswer(opt)}
                    disabled={hasAnswered || role === 'host'}
                    className={`p-6 rounded-2xl text-left border-b-4 font-bold text-base transition-all active:scale-95 shadow-md flex items-center justify-between ${color.bg} ${color.text} ${
                      hasAnswered ? 'opacity-80 cursor-not-allowed' : ''
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-xl">{color.shape}</span>
                      <span>{opt}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Live Mini-Leaderboard */}
            <div className="card p-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Live Standings
              </h4>
              <div className="flex flex-wrap gap-2">
                {[...participants].sort((a, b) => b.score - a.score).map((p, i) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                  >
                    <span className="text-indigo-500 font-bold">#{i + 1}</span>
                    <span>{p.name}</span>
                    <span className="badge badge-indigo text-[10px]">{p.score} pts</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SCREEN 4: GAME ENDED & PODIUM                             */}
        {/* ========================================================= */}
        {gameState === 'ended' && (
          <div className="card text-center p-8 space-y-6">
            <Trophy className="w-16 h-16 text-amber-500 mx-auto animate-bounce" />
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">Game Over!</h2>
            <p className="text-xs text-slate-400">Here are the final champion standings!</p>

            <div className="max-w-md mx-auto divide-y divide-slate-100 dark:divide-slate-800">
              {finalScores.map((player, idx) => (
                <div
                  key={player.id || idx}
                  className="py-3 flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      idx === 0 ? 'bg-amber-400 text-slate-900' : idx === 1 ? 'bg-slate-300 text-slate-900' : idx === 2 ? 'bg-amber-700 text-white' : 'text-slate-400'
                    }`}>
                      {idx + 1}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">{player.name}</span>
                  </div>
                  <span className="font-black text-indigo-600 dark:text-indigo-400">{player.score} pts</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                setGameState('select');
                setGameCode('');
                setParticipants([]);
              }}
              className="btn-primary mx-auto"
            >
              Play Another Game
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
