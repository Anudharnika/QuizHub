import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChevronLeft, ChevronRight, Flag, CheckCircle, BookOpen, Users, Trophy, Play, Zap } from 'lucide-react';
import DashboardLayout from '../components/common/DashboardLayout';
import { quizAPI, attemptAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

function Timer({ seconds, onExpire }) {
  const [remaining, setRemaining] = useState(seconds);
  const timerRef = useRef(null);

  useEffect(() => {
    setRemaining(seconds);
  }, [seconds]);

  useEffect(() => {
    if (remaining <= 0) { onExpire(); return; }
    timerRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); onExpire(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const pct = Math.round((remaining / seconds) * 100);
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const urgent = remaining <= 30;

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${urgent ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'}`}>
      <Clock className={`w-4 h-4 ${urgent ? 'animate-pulse' : ''}`} />
      <span className="font-bold text-sm tabular-nums">{String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}</span>
    </div>
  );
}

export default function QuizTakePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState('intro'); // intro | taking | submitting
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState(new Set());
  const [startTime, setStartTime] = useState(null);

  useEffect(() => {
    quizAPI.getById(id).then(res => {
      setQuiz(res.data);
    }).catch(() => {
      toast.error('Quiz not found', 'This quiz may have been removed.');
      navigate('/explore');
    }).finally(() => setLoading(false));
  }, [id]);

  const startQuiz = () => {
    setPhase('taking');
    setStartTime(Date.now());
    setCurrentIdx(0);
    setAnswers({});
    setFlagged(new Set());
  };

  const setAnswer = (qId, val) => {
    setAnswers(prev => ({ ...prev, [qId]: val }));
  };

  const toggleFlag = (qId) => {
    setFlagged(prev => {
      const next = new Set(prev);
      next.has(qId) ? next.delete(qId) : next.add(qId);
      return next;
    });
  };

  const handleSubmit = async () => {
    setPhase('submitting');
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    try {
      const res = await attemptAPI.submit({ quizId: id, answers, timeTaken });
      navigate(`/result/${res.data._id}`, { state: { attempt: res.data, quiz } });
    } catch (err) {
      toast.error('Submission failed', 'Please try again.');
      setPhase('taking');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!quiz) return null;

  // INTRO PHASE
  if (phase === 'intro') {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="card overflow-hidden">
            {quiz.coverImage && (
              <img src={quiz.coverImage} alt={quiz.title} className="w-full h-56 object-cover -m-6 mb-6 w-[calc(100%+48px)]" />
            )}
            {!quiz.coverImage && (
              <div className="flex items-center justify-center h-24 bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/30 dark:to-violet-900/30 -m-6 mb-6 w-[calc(100%+48px)]">
                <span className="text-4xl">📝</span>
              </div>
            )}

            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{quiz.title}</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{quiz.description}</p>
              </div>
              <span className={`badge ${quiz.difficulty === 'Easy' ? 'difficulty-easy' : quiz.difficulty === 'Hard' ? 'difficulty-hard' : 'difficulty-intermediate'} flex-shrink-0`}>
                {quiz.difficulty}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { icon: BookOpen, label: 'Questions', value: quiz.questions?.length || 0 },
                { icon: Clock, label: 'Time Limit', value: `${quiz.timeLimit} min` },
                { icon: Trophy, label: 'Pass Score', value: `${quiz.passingScore}%` },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="text-center py-4 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <Icon className="w-5 h-5 text-indigo-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{value}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 mb-6 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
              <img
                src={quiz.creator?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${quiz.creator?.name}`}
                alt={quiz.creator?.name} className="w-9 h-9 rounded-full"
              />
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{quiz.creator?.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Quiz Creator</p>
              </div>
              <div className="ml-auto flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1"><Users className="w-3 h-3" />{quiz.attemptsCount} attempts</span>
              </div>
            </div>

            <button onClick={startQuiz}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-lg hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-500/20 transition-all active:scale-95 flex items-center justify-center gap-3">
              <Play className="w-5 h-5" /> Start Quiz
            </button>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  // SUBMITTING
  if (phase === 'submitting') {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-slate-600 dark:text-slate-300 font-medium">Calculating your results...</p>
        </div>
      </DashboardLayout>
    );
  }

  // QUIZ TAKING PHASE
  const questions = quiz.questions || [];
  const currentQ = questions[currentIdx];
  const totalQ = questions.length;
  const answeredCount = Object.keys(answers).length;
  const progress = Math.round((currentIdx / totalQ) * 100);

  const handleOptionSelect = (val) => {
    if (!currentQ) return;
    if (currentQ.type === 'MultiSelect') {
      const prev = answers[currentQ.id] || [];
      const next = prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val];
      setAnswer(currentQ.id, next);
    } else {
      setAnswer(currentQ.id, val);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-4">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Question <span className="text-indigo-600 dark:text-indigo-400 font-bold">{currentIdx + 1}</span> / {totalQ}
            </span>
            <span className="text-xs text-slate-400">{answeredCount} answered</span>
          </div>
          <Timer
            seconds={quiz.timeLimit * 60}
            onExpire={handleSubmit}
          />
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
            animate={{ width: `${((currentIdx + 1) / totalQ) * 100}%` }}
            transition={{ type: 'spring', stiffness: 200 }}
          />
        </div>

        {/* Question card */}
        <AnimatePresence mode="wait">
          <motion.div key={currentIdx} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
            className="card">
            {/* Question header */}
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  {currentIdx + 1}
                </span>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="badge badge-slate">{currentQ?.type}</span>
                    <span className="badge badge-indigo">{currentQ?.points} pts</span>
                  </div>
                  {currentQ?.imageUrl && (
                    <img src={currentQ.imageUrl} alt="question" className="w-full max-h-48 object-cover rounded-xl mb-3" />
                  )}
                  <p className="text-base font-semibold text-slate-900 dark:text-white leading-relaxed">{currentQ?.questionText}</p>
                </div>
              </div>
              <button
                onClick={() => toggleFlag(currentQ?.id)}
                className={`p-2 rounded-xl transition-all flex-shrink-0 ${flagged.has(currentQ?.id) ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20'}`}
                title="Flag for review"
              >
                <Flag className="w-4 h-4" />
              </button>
            </div>

            {/* Answer area */}
            <div className="space-y-2.5">
              {(currentQ?.type === 'MCQ' || currentQ?.type === 'MultiSelect' || currentQ?.type === 'ImageBased') && currentQ?.options?.map((opt, i) => {
                const isSelected = currentQ.type === 'MultiSelect'
                  ? (answers[currentQ.id] || []).includes(opt)
                  : answers[currentQ.id] === opt;
                return (
                  <motion.button
                    key={i}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleOptionSelect(opt)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${isSelected ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' : 'border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                  >
                    <span className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center text-sm font-bold flex-shrink-0 ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300'}`}>
                      {isSelected ? <CheckCircle className="w-4 h-4" /> : String.fromCharCode(65 + i)}
                    </span>
                    <span className="text-sm font-medium">{opt}</span>
                  </motion.button>
                );
              })}

              {currentQ?.type === 'TrueFalse' && ['True', 'False'].map((opt) => {
                const isSelected = answers[currentQ.id] === opt;
                return (
                  <motion.button key={opt} whileTap={{ scale: 0.98 }} onClick={() => handleOptionSelect(opt)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${isSelected ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600'}`}>
                    <span className="text-xl">{opt === 'True' ? '✅' : '❌'}</span>
                    <span className={`text-sm font-semibold ${isSelected ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-900 dark:text-slate-100'}`}>{opt}</span>
                    {isSelected && <CheckCircle className="w-4 h-4 text-indigo-600 ml-auto" />}
                  </motion.button>
                );
              })}

              {(currentQ?.type === 'FillBlank' || currentQ?.type === 'ShortAnswer') && (
                <textarea
                  value={answers[currentQ.id] || ''}
                  onChange={e => setAnswer(currentQ.id, e.target.value)}
                  placeholder={currentQ.type === 'FillBlank' ? 'Type the missing word or phrase...' : 'Type your answer here...'}
                  rows={3}
                  className="input resize-none w-full"
                />
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Question navigator */}
        <div className="card py-4">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-3">Question Navigator</p>
          <div className="flex flex-wrap gap-2">
            {questions.map((q, i) => {
              const isAnswered = answers[q.id] !== undefined && answers[q.id] !== '' && !(Array.isArray(answers[q.id]) && answers[q.id].length === 0);
              const isFlagged = flagged.has(q.id);
              const isCurrent = i === currentIdx;
              return (
                <button key={q.id} onClick={() => setCurrentIdx(i)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${isCurrent ? 'bg-indigo-600 text-white ring-2 ring-indigo-400' : isAnswered ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' : isFlagged ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                  {isFlagged && !isCurrent ? '🚩' : i + 1}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-200 dark:bg-emerald-900/60" /> Answered</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-amber-200 dark:bg-amber-900/60" /> Flagged</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-indigo-500" /> Current</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-slate-200 dark:bg-slate-700" /> Unanswered</span>
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between">
          <button onClick={() => setCurrentIdx(i => Math.max(0, i - 1))} disabled={currentIdx === 0}
            className="btn-secondary disabled:opacity-40">
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          {currentIdx < totalQ - 1 ? (
            <button onClick={() => setCurrentIdx(i => Math.min(totalQ - 1, i + 1))} className="btn-primary">
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleSubmit}
              className="btn-primary bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20">
              <Zap className="w-4 h-4" /> Submit Quiz ({answeredCount}/{totalQ})
            </button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
