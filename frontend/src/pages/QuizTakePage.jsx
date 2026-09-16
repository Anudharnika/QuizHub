import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChevronLeft, ChevronRight, Flag, CheckCircle, BookOpen, Users, Trophy, Play, Zap, ArrowLeft } from 'lucide-react';
import DashboardLayout from '../components/common/DashboardLayout';
import { quizAPI, attemptAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { SparkleStar } from '../components/common/Doodles';

function Timer({ seconds, onExpire }) {
  const [remaining, setRemaining] = useState(seconds);
  const timerRef = useRef(null);

  useEffect(() => {
    setRemaining(seconds);
  }, [seconds]);

  useEffect(() => {
    if (remaining <= 0) { onExpire(); return; }
    timerRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) { clearInterval(timerRef.current); onExpire(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const urgent = remaining <= 30;

  return (
    <div className={`px-3 py-1 rounded-full border-2 border-black font-extrabold text-xs sm:text-sm shadow-[2px_2px_0px_#000] flex items-center gap-1.5 ${urgent ? 'bg-rose-500 text-white animate-bounce' : 'bg-amber-300 text-black'}`}>
      <Clock className="w-4 h-4" />
      <span className="tabular-nums">{String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}</span>
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
    quizAPI.getById(id).then((res) => {
      setQuiz(res.data);
    }).catch(() => {
      toast.error('Quiz not found', 'This quiz may have been removed.');
      navigate('/explore');
    }).finally(() => setLoading(false));
  }, [id, navigate, toast]);

  const startQuiz = () => {
    setPhase('taking');
    setStartTime(Date.now());
    setCurrentIdx(0);
    setAnswers({});
    setFlagged(new Set());
  };

  const setAnswer = (qId, val) => {
    setAnswers((prev) => ({ ...prev, [qId]: val }));
  };

  const toggleFlag = (qId) => {
    setFlagged((prev) => {
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
      navigate(`/thank-you?score=${res.data.score || 100}%`);
    } catch {
      toast.error('Submission failed', 'Please try again.');
      setPhase('taking');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-12 h-12 border-4 border-[#EC4899] border-t-black rounded-full animate-spin shadow-[3px_3px_0px_#000]" />
        </div>
      </DashboardLayout>
    );
  }

  if (!quiz) return null;

  // INTRO PHASE
  if (phase === 'intro') {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto pb-20">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="neo-box p-6 sm:p-10 relative bg-white">
            <SparkleStar className="absolute -top-4 -right-3 w-8 h-8 text-[#EC4899]" />
            
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <span className="neo-tag-pink text-xs uppercase mb-2">College Test</span>
                <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-900 mt-1">{quiz.title}</h1>
                <p className="text-slate-600 text-sm font-medium mt-2">{quiz.description}</p>
              </div>
              <span className="px-3 py-1 rounded-full border-2 border-black font-bold text-xs bg-amber-300 shadow-[2px_2px_0px_#000]">
                {quiz.difficulty || 'Medium'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { icon: BookOpen, label: 'Questions', value: quiz.questions?.length || 0 },
                { icon: Clock, label: 'Time Limit', value: `${quiz.timeLimit || 15}m` },
                { icon: Trophy, label: 'Pass Score', value: `${quiz.passingScore || 60}%` },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="text-center p-3 rounded-xl border-2 border-black bg-slate-50 shadow-[2px_2px_0px_#000]">
                  <Icon className="w-4 h-4 text-[#EC4899] mx-auto mb-1" />
                  <p className="text-base font-black text-slate-900 font-display">{value}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">{label}</p>
                </div>
              ))}
            </div>

            <button
              onClick={startQuiz}
              className="w-full neo-btn-pink py-4 text-base font-black flex items-center justify-center gap-2 shadow-[4px_4px_0px_#000]"
            >
              <Play className="w-5 h-5" /> Start Quiz Now
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
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
          <div className="w-14 h-14 border-4 border-[#EC4899] border-t-black rounded-full animate-spin shadow-[4px_4px_0px_#000]" />
          <p className="text-lg font-black font-display">Submitting your answers...</p>
        </div>
      </DashboardLayout>
    );
  }

  // QUIZ TAKING PHASE
  const questions = quiz.questions || [];
  const currentQ = questions[currentIdx];
  const totalQ = questions.length;
  const answeredCount = Object.keys(answers).length;

  const handleOptionSelect = (val) => {
    if (!currentQ) return;
    if (currentQ.type === 'MultiSelect') {
      const prev = answers[currentQ.id] || [];
      const next = prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val];
      setAnswer(currentQ.id, next);
    } else {
      setAnswer(currentQ.id, val);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-4 pb-28">
        
        {/* Sticky Mobile Header bar */}
        <div className="flex items-center justify-between gap-2 p-3 bg-white border-2 border-black rounded-2xl shadow-[3px_3px_0px_#000]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase text-slate-700">
              Q<span className="text-[#EC4899]">{currentIdx + 1}</span>/{totalQ}
            </span>
            <span className="text-[10px] font-bold bg-slate-100 border border-black px-2 py-0.5 rounded-full">
              {answeredCount} done
            </span>
          </div>

          <Timer seconds={(quiz.timeLimit || 15) * 60} onExpire={handleSubmit} />
        </div>

        {/* Question card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIdx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="neo-box p-5 sm:p-8 bg-white relative"
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <span className="neo-tag-pink text-xs">
                Question {currentIdx + 1}
              </span>

              <button
                onClick={() => toggleFlag(currentQ?.id)}
                className={`p-2 rounded-xl border-2 border-black transition-all ${
                  flagged.has(currentQ?.id) ? 'bg-amber-300 text-black shadow-[2px_2px_0px_#000]' : 'bg-slate-100 text-slate-600'
                }`}
              >
                <Flag className="w-4 h-4" />
              </button>
            </div>

            <h2 className="text-base sm:text-xl font-black font-display text-slate-900 mb-6 leading-snug">
              {currentQ?.questionText}
            </h2>

            {/* Big Thumb Option Buttons */}
            <div className="space-y-3">
              {(currentQ?.type === 'MCQ' || currentQ?.type === 'MultiSelect' || !currentQ?.type) &&
                (currentQ?.options || ['Option A', 'Option B', 'Option C', 'Option D']).map((opt, i) => {
                  const isSelected = currentQ?.type === 'MultiSelect'
                    ? (answers[currentQ?.id] || []).includes(opt)
                    : answers[currentQ?.id] === opt;

                  return (
                    <button
                      key={i}
                      onClick={() => handleOptionSelect(opt)}
                      className={`w-full min-h-[54px] p-4 rounded-xl border-2 border-black font-bold text-sm text-left flex items-center justify-between transition-all active:scale-[0.98] ${
                        isSelected
                          ? 'bg-[#EC4899] text-white shadow-[4px_4px_0px_#000] translate-x-[-1px] translate-y-[-1px]'
                          : 'bg-white text-slate-900 shadow-[2px_2px_0px_#000] hover:bg-slate-50'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <span className={`w-7 h-7 rounded-lg border-2 border-black flex items-center justify-center font-black text-xs ${isSelected ? 'bg-white text-black' : 'bg-slate-100 text-black'}`}>
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span>{opt}</span>
                      </span>
                      {isSelected && <CheckCircle className="w-5 h-5 text-white" />}
                    </button>
                  );
                })}

              {currentQ?.type === 'TrueFalse' &&
                ['True', 'False'].map((opt) => {
                  const isSelected = answers[currentQ.id] === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => handleOptionSelect(opt)}
                      className={`w-full min-h-[54px] p-4 rounded-xl border-2 border-black font-bold text-sm flex items-center justify-between transition-all ${
                        isSelected
                          ? 'bg-[#EC4899] text-white shadow-[4px_4px_0px_#000]'
                          : 'bg-white text-slate-900 shadow-[2px_2px_0px_#000]'
                      }`}
                    >
                      <span className="flex items-center gap-3 font-extrabold text-base">
                        <span>{opt === 'True' ? 'True' : 'False'}</span>
                      </span>
                      {isSelected && <CheckCircle className="w-5 h-5 text-white" />}
                    </button>
                  );
                })}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Mobile Fixed Controls Bar */}
        <div className="fixed bottom-14 left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t-2 border-black flex items-center justify-between gap-3 z-30 lg:relative lg:bottom-0 lg:bg-transparent lg:border-none lg:p-0">
          <button
            onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
            disabled={currentIdx === 0}
            className="neo-btn-white text-xs py-2.5 px-4 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>

          {currentIdx < totalQ - 1 ? (
            <button
              onClick={() => setCurrentIdx((i) => Math.min(totalQ - 1, i + 1))}
              className="neo-btn-pink text-xs py-2.5 px-6"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="neo-btn-pink text-xs py-2.5 px-6 bg-emerald-500 hover:bg-emerald-600"
            >
              <Zap className="w-4 h-4" /> Submit Quiz ({answeredCount}/{totalQ})
            </button>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}
