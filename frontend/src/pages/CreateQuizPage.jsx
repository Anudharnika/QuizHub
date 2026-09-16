import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight, ChevronLeft, Check, PlusCircle, Trash2, GripVertical,
  Clock, Target, Tag, Globe, Lock, EyeOff, BookOpen, CheckSquare,
  AlignLeft, List, Sparkles, Zap
} from 'lucide-react';
import DashboardLayout from '../components/common/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { quizAPI } from '../services/api';
import { SparkleStar, RotatingBadgeDoodle } from '../components/common/Doodles';

const STEPS = ['Quiz Info', 'Question Type', 'Questions', 'Settings', 'Publish'];
const CATEGORIES = ['Programming', 'Mathematics', 'Science', 'General Knowledge', 'History', 'Aptitude', 'AI & ML', 'Web Development'];
const DIFFICULTIES = ['Easy', 'Intermediate', 'Hard'];

const QUESTION_TYPES = [
  { type: 'MCQ', label: 'Multiple Choice', desc: 'One correct answer from options', bg: 'bg-[#EC4899] text-white' },
  { type: 'MultiSelect', label: 'Multiple Select', desc: 'Multiple correct answers', bg: 'bg-purple-600 text-white' },
  { type: 'TrueFalse', label: 'True / False', desc: 'Binary boolean question', bg: 'bg-emerald-500 text-white' },
  { type: 'FillBlank', label: 'Fill in the Blank', desc: 'Complete the missing word', bg: 'bg-amber-400 text-black' },
];

function createEmptyQuestion(type = 'MCQ') {
  return {
    id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    type,
    questionText: '',
    points: 10,
    difficulty: 'Intermediate',
    explanation: '',
    options: type === 'TrueFalse' ? ['True', 'False'] : ['', '', '', ''],
    correctAnswer: '',
  };
}

export default function CreateQuizPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [info, setInfo] = useState({
    title: '',
    description: '',
    category: 'Programming',
    difficulty: 'Intermediate',
    timeLimit: 15,
    tagsInput: '',
    visibility: 'Public',
  });

  const [questions, setQuestions] = useState([createEmptyQuestion('MCQ')]);

  const [settings, setSettings] = useState({
    passingScore: 70,
    allowRetakes: true,
  });

  const handleAddQuestion = (type) => {
    setQuestions(prev => [...prev, createEmptyQuestion(type)]);
  };

  const updateQ = (idx, updates) => {
    const updated = [...questions];
    updated[idx] = { ...updated[idx], ...updates };
    setQuestions(updated);
  };

  const deleteQ = (idx) => setQuestions(questions.filter((_, i) => i !== idx));

  const handleSave = async () => {
    if (!info.title.trim()) {
      toast.error('Title required', 'Please enter a quiz title.');
      setStep(0);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: info.title,
        description: info.description,
        category: info.category,
        difficulty: info.difficulty,
        timeLimit: info.timeLimit,
        tags: info.tagsInput.split(',').map(t => t.trim()).filter(Boolean),
        visibility: info.visibility,
        questions,
        passingScore: settings.passingScore,
        createdBy: user?.uid,
      };
      const res = await quizAPI.create(payload);
      toast.success('Quiz Created!', 'Your quiz is now ready to play across campus.');
      navigate(`/quiz/${res.data.id || res.data._id}`);
    } catch (err) {
      toast.error('Creation failed', err?.message || 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 pb-16">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <span className="neo-tag-pink text-xs uppercase mb-1">Creator Suite</span>
            <h1 className="text-3xl font-black text-slate-900 font-display tracking-tight flex items-center gap-2 mt-1">
              <Sparkles className="w-7 h-7 text-[#EC4899]" /> Create New Quiz
            </h1>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {STEPS.map((s, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 border-black font-extrabold text-xs transition-all flex-shrink-0 ${
                step === i
                  ? 'bg-[#EC4899] text-white shadow-[2px_2px_0px_#000]'
                  : 'bg-white text-slate-800'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center font-black text-[10px] ${step === i ? 'bg-white text-black' : 'bg-slate-100 text-black'}`}>
                {i + 1}
              </span>
              <span>{s}</span>
            </button>
          ))}
        </div>

        {/* Step Content Container */}
        <div className="neo-box p-6 sm:p-10 bg-white relative">
          
          {/* STEP 0: INFO */}
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1">Quiz Title *</label>
                <input
                  value={info.title}
                  onChange={e => setInfo({ ...info, title: e.target.value })}
                  placeholder="e.g. Data Structures & Algorithms Midterm"
                  className="w-full p-3 border-2 border-black rounded-xl font-bold text-base"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1">Description</label>
                <textarea
                  value={info.description}
                  onChange={e => setInfo({ ...info, description: e.target.value })}
                  placeholder="What will participants learn or be tested on?"
                  rows={3}
                  className="w-full p-3 border-2 border-black rounded-xl font-bold text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 mb-1">Category</label>
                  <select
                    value={info.category}
                    onChange={e => setInfo({ ...info, category: e.target.value })}
                    className="w-full p-3 border-2 border-black rounded-xl font-bold text-xs"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 mb-1">Time Limit (Minutes)</label>
                  <input
                    type="number"
                    value={info.timeLimit}
                    onChange={e => setInfo({ ...info, timeLimit: Number(e.target.value) })}
                    min={1} max={180}
                    className="w-full p-3 border-2 border-black rounded-xl font-bold text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 1: QUESTION TYPE */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-black text-xl font-display text-slate-900 mb-2">Select Question Style</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {QUESTION_TYPES.map(qt => (
                  <button
                    key={qt.type}
                    onClick={() => { handleAddQuestion(qt.type); setStep(2); }}
                    className={`neo-box p-5 ${qt.bg} flex flex-col justify-between cursor-pointer hover:translate-y-[-2px]`}
                  >
                    <h4 className="font-black text-lg font-display">{qt.label}</h4>
                    <p className="text-xs font-bold mt-1 opacity-90">{qt.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: QUESTIONS */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b-2 border-black pb-3">
                <h3 className="font-black text-xl font-display text-slate-900">{questions.length} Question(s)</h3>
                <button onClick={() => handleAddQuestion('MCQ')} className="neo-btn-pink text-xs py-2 px-4">
                  <PlusCircle className="w-4 h-4" /> Add Question
                </button>
              </div>

              <div className="space-y-4">
                {questions.map((q, idx) => (
                  <div key={q.id} className="neo-box p-5 bg-white space-y-3">
                    <div className="flex items-center justify-between border-b-2 border-black/10 pb-2">
                      <span className="neo-tag-pink text-[10px]">Q{idx + 1} • {q.type}</span>
                      <button onClick={() => deleteQ(idx)} className="text-red-600 font-bold text-xs flex items-center gap-1">
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>

                    <input
                      value={q.questionText}
                      onChange={e => updateQ(idx, { questionText: e.target.value })}
                      placeholder="Enter question statement..."
                      className="w-full p-3 border-2 border-black rounded-xl font-bold text-sm"
                    />

                    {q.options && (
                      <div className="space-y-2">
                        {q.options.map((opt, oi) => (
                          <div key={oi} className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => updateQ(idx, { correctAnswer: opt })}
                              className={`w-7 h-7 rounded-lg border-2 border-black flex items-center justify-center text-xs font-black ${
                                q.correctAnswer === opt && opt !== '' ? 'bg-[#EC4899] text-white shadow-[1px_1px_0px_#000]' : 'bg-slate-100 text-black'
                              }`}
                            >
                              {String.fromCharCode(65 + oi)}
                            </button>
                            <input
                              value={opt}
                              onChange={e => {
                                const opts = [...q.options];
                                opts[oi] = e.target.value;
                                updateQ(idx, { options: opts });
                              }}
                              placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                              className="flex-1 p-2 border-2 border-black rounded-xl font-bold text-xs"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3 & 4: SETTINGS & PUBLISH */}
          {(step === 3 || step === 4) && (
            <div className="space-y-6 text-center">
              <RotatingBadgeDoodle text="Ready to Publish • " icon={Zap} className="mx-auto" />
              <h2 className="text-3xl font-black font-display text-slate-900">Summary & Launch</h2>
              <div className="neo-box p-4 bg-amber-100 max-w-sm mx-auto font-bold text-sm">
                <div>Title: <span className="font-black text-[#EC4899]">{info.title || 'Untitled Quiz'}</span></div>
                <div>Questions: {questions.length}</div>
                <div>Time: {info.timeLimit} minutes</div>
              </div>

              <button onClick={handleSave} disabled={saving} className="neo-btn-pink py-3 px-8 text-base">
                {saving ? 'Publishing...' : 'Launch Quiz Now'}
              </button>
            </div>
          )}

        </div>

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="neo-btn-white text-xs py-2 px-5 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          {step < STEPS.length - 1 && (
            <button onClick={() => setStep(step + 1)} className="neo-btn-pink text-xs py-2 px-5">
              Next Step <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}
