import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight, ChevronLeft, Check, PlusCircle, Trash2, GripVertical,
  Clock, Target, Tag, Globe, Lock, EyeOff, BookOpen, CheckSquare,
  AlignLeft, List, Sparkles, Zap, FileText
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
  { type: 'MCQ', label: 'Multiple Choice', desc: 'One correct answer from options', bg: 'bg-[#EC4899] text-white', icon: List },
  { type: 'MultiSelect', label: 'Multiple Select', desc: 'Multiple correct answers', bg: 'bg-purple-600 text-white', icon: CheckSquare },
  { type: 'TrueFalse', label: 'True / False', desc: 'Binary boolean question', bg: 'bg-emerald-500 text-white', icon: Check },
  { type: 'ShortAnswer', label: 'Short Answer', desc: 'Brief open text response', bg: 'bg-blue-500 text-white', icon: FileText },
  { type: 'FillBlank', label: 'Fill in the Blank', desc: 'Complete the missing word', bg: 'bg-amber-400 text-black', icon: AlignLeft },
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

    if (!questions || questions.length === 0) {
      toast.error('Questions required', 'Please add at least one question.');
      setStep(2);
      return;
    }

    setSaving(true);
    try {
      const sanitizedQuestions = questions.map((q, idx) => ({
        id: q.id || `q_${Date.now()}_${idx}`,
        type: q.type || 'MCQ',
        questionText: q.questionText || `Question ${idx + 1}`,
        points: Number(q.points) || 10,
        difficulty: q.difficulty || 'Intermediate',
        explanation: q.explanation || '',
        options: Array.isArray(q.options) ? q.options : [],
        correctAnswer: q.correctAnswer || '',
      }));

      const payload = {
        title: info.title.trim(),
        description: info.description || '',
        category: info.category || 'Programming',
        difficulty: info.difficulty || 'Intermediate',
        timeLimit: Number(info.timeLimit) || 15,
        tags: info.tagsInput ? info.tagsInput.split(',').map(t => t.trim()).filter(Boolean) : [],
        visibility: info.visibility || 'Public',
        questions: sanitizedQuestions,
        passingScore: Number(settings.passingScore) || 70,
        allowRetakes: Boolean(settings.allowRetakes),
        createdBy: user?.uid || 'anonymous',
      };

      const res = await quizAPI.create(payload);
      toast.success('Quiz Created!', 'Your quiz is now ready to play across campus.');
      const quizId = res?.data?.id || res?.data?._id;
      if (quizId) {
        navigate(`/quiz/${quizId}`);
      } else {
        navigate('/my-quizzes');
      }
    } catch (err) {
      console.error('Quiz publish failed:', err);
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
        <div className="neo-box p-4 sm:p-10 bg-white relative">
          
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                {QUESTION_TYPES.map(qt => {
                  const Icon = qt.icon;
                  return (
                    <button
                      key={qt.type}
                      type="button"
                      onClick={() => { handleAddQuestion(qt.type); setStep(2); }}
                      className={`p-5 rounded-2xl border-2 sm:border-3 border-black shadow-[4px_4px_0px_#000] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000] ${qt.bg} flex flex-col justify-between cursor-pointer text-left transition-all min-h-[100px]`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <h4 className="font-black text-lg font-display tracking-tight">{qt.label}</h4>
                        {Icon && <Icon className="w-6 h-6 flex-shrink-0" />}
                      </div>
                      <p className="text-xs font-bold opacity-90">{qt.desc}</p>
                    </button>
                  );
                })}
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
                      <div className="flex items-center gap-2">
                        <span className="neo-tag-pink text-[10px] uppercase font-black">Q{idx + 1}</span>
                        <select
                          value={q.type || 'MCQ'}
                          onChange={(e) => {
                            const newType = e.target.value;
                            let newOpts = q.options;
                            if (newType === 'TrueFalse') newOpts = ['True', 'False'];
                            else if (newType === 'FillBlank') newOpts = [];
                            else if (!newOpts || newOpts.length < 2) newOpts = ['', '', '', ''];

                            updateQ(idx, {
                              type: newType,
                              options: newOpts,
                              correctAnswer: newType === 'MultiSelect'
                                ? (Array.isArray(q.correctAnswer) ? q.correctAnswer : [])
                                : (typeof q.correctAnswer === 'string' ? q.correctAnswer : '')
                            });
                          }}
                          className="p-1 px-2 border-2 border-black rounded-lg font-black text-xs bg-amber-300 text-black shadow-[1.5px_1.5px_0px_#000]"
                        >
                          <option value="MCQ">MCQ (Multiple Choice)</option>
                          <option value="MultiSelect">Multiple Select</option>
                          <option value="TrueFalse">True / False</option>
                          <option value="ShortAnswer">Short Answer</option>
                          <option value="FillBlank">Fill in the Blank</option>
                        </select>
                      </div>
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

                    {/* MCQ and MultiSelect Option Inputs */}
                    {(q.type === 'MCQ' || q.type === 'MultiSelect' || !q.type) && (
                      <div className="space-y-2">
                        <label className="block text-[11px] font-black uppercase text-slate-500">
                          {q.type === 'MultiSelect' ? 'Options (Click letter to toggle correct answers)' : 'Options (Click letter to set correct answer)'}
                        </label>
                        {(q.options || ['', '', '', '']).map((opt, oi) => {
                          const isCorrect = q.type === 'MultiSelect'
                            ? (Array.isArray(q.correctAnswer) && q.correctAnswer.includes(opt) && opt !== '')
                            : (q.correctAnswer === opt && opt !== '');
                          return (
                            <div key={oi} className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  if (q.type === 'MultiSelect') {
                                    const current = Array.isArray(q.correctAnswer) ? q.correctAnswer : [];
                                    const next = current.includes(opt) ? current.filter(c => c !== opt) : [...current, opt];
                                    updateQ(idx, { correctAnswer: next });
                                  } else {
                                    updateQ(idx, { correctAnswer: opt });
                                  }
                                }}
                                className={`w-8 h-8 rounded-lg border-2 border-black flex items-center justify-center text-xs font-black transition-all ${
                                  isCorrect ? 'bg-[#EC4899] text-white shadow-[1px_1px_0px_#000]' : 'bg-slate-100 text-black'
                                }`}
                              >
                                {String.fromCharCode(65 + oi)}
                              </button>
                              <input
                                value={opt}
                                onChange={e => {
                                  const opts = [...(q.options || ['', '', '', ''])];
                                  opts[oi] = e.target.value;
                                  updateQ(idx, { options: opts });
                                }}
                                placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                                className="flex-1 p-2 border-2 border-black rounded-xl font-bold text-xs"
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* True / False Option Inputs */}
                    {q.type === 'TrueFalse' && (
                      <div className="space-y-2">
                        <label className="block text-[11px] font-black uppercase text-slate-500">Select Correct Answer</label>
                        <div className="flex gap-3">
                          {['True', 'False'].map(tf => (
                            <button
                              key={tf}
                              type="button"
                              onClick={() => updateQ(idx, { correctAnswer: tf, options: ['True', 'False'] })}
                              className={`flex-1 py-2.5 rounded-xl border-2 border-black font-black text-xs transition-all ${
                                q.correctAnswer === tf ? 'bg-[#EC4899] text-white shadow-[2px_2px_0px_#000]' : 'bg-slate-100 text-slate-800'
                              }`}
                            >
                              {tf}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Short Answer Input */}
                    {q.type === 'ShortAnswer' && (
                      <div className="space-y-2">
                        <label className="block text-[11px] font-black uppercase text-slate-700">Sample/Model Short Answer</label>
                        <input
                          type="text"
                          value={typeof q.correctAnswer === 'string' ? q.correctAnswer : ''}
                          onChange={e => updateQ(idx, { correctAnswer: e.target.value, options: [] })}
                          placeholder="Type expected short answer response..."
                          className="w-full p-2.5 border-2 border-black rounded-xl font-bold text-xs bg-blue-50"
                        />
                      </div>
                    )}

                    {/* Fill in the Blank Input */}
                    {q.type === 'FillBlank' && (
                      <div className="space-y-2">
                        <label className="block text-[11px] font-black uppercase text-slate-700">Correct Blank Answer</label>
                        <input
                          type="text"
                          value={typeof q.correctAnswer === 'string' ? q.correctAnswer : ''}
                          onChange={e => updateQ(idx, { correctAnswer: e.target.value, options: [] })}
                          placeholder="Type the exact word or short phrase answer..."
                          className="w-full p-2.5 border-2 border-black rounded-xl font-bold text-xs bg-amber-50"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: SETTINGS */}
          {step === 3 && (
            <div className="space-y-5">
              <h3 className="font-black text-xl font-display text-slate-900 mb-2">Quiz Rule Settings</h3>
              
              <div className="space-y-4 max-w-lg">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 mb-1">Passing Score ({settings.passingScore}%)</label>
                  <input
                    type="range"
                    min="30"
                    max="100"
                    step="5"
                    value={settings.passingScore}
                    onChange={(e) => setSettings({ ...settings, passingScore: Number(e.target.value) })}
                    className="w-full accent-[#EC4899] cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] font-bold text-slate-500 mt-1">
                    <span>30% (Easy)</span>
                    <span>70% (Standard)</span>
                    <span>100% (Strict)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border-2 border-black bg-slate-50 shadow-[2px_2px_0px_#000]">
                  <div>
                    <h4 className="font-black text-sm text-slate-900">Allow Retakes</h4>
                    <p className="text-xs font-medium text-slate-600">Permit students to retake this test for practice.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, allowRetakes: !settings.allowRetakes })}
                    className={`px-4 py-1.5 rounded-full font-black text-xs border-2 border-black transition-all ${
                      settings.allowRetakes ? 'bg-[#EC4899] text-white shadow-[2px_2px_0px_#000]' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {settings.allowRetakes ? 'ENABLED' : 'DISABLED'}
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 mb-1">Visibility</label>
                  <select
                    value={info.visibility}
                    onChange={(e) => setInfo({ ...info, visibility: e.target.value })}
                    className="w-full p-3 border-2 border-black rounded-xl font-bold text-xs bg-white shadow-[2px_2px_0px_#000]"
                  >
                    <option value="Public">Public (Discoverable by everyone)</option>
                    <option value="Campus Only">Campus Only (Restricted to university)</option>
                    <option value="Private">Private (Code/Link required)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: PUBLISH */}
          {step === 4 && (
            <div className="space-y-6 text-center">
              <RotatingBadgeDoodle text="Ready to Publish • " icon={Zap} className="mx-auto" />
              <h2 className="text-3xl font-black font-display text-slate-900">Summary & Launch</h2>
              
              <div className="neo-box p-6 bg-amber-100 max-w-md mx-auto font-bold text-sm text-left space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600">Title:</span>
                  <span className="font-black text-[#EC4899]">{info.title || 'Untitled Quiz'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Category:</span>
                  <span className="font-black text-slate-900">{info.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Difficulty:</span>
                  <span className="font-black text-slate-900">{info.difficulty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Questions:</span>
                  <span className="font-black text-slate-900">{questions.length} Question(s)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Time Limit:</span>
                  <span className="font-black text-slate-900">{info.timeLimit} Minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Passing Score:</span>
                  <span className="font-black text-slate-900">{settings.passingScore}%</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="neo-btn-pink py-3.5 px-10 text-lg shadow-[4px_4px_0px_#000]"
              >
                {saving ? 'Publishing Quiz...' : '🚀 Publish Quiz Now'}
              </button>
            </div>
          )}

        </div>

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="neo-btn-white text-xs py-2 px-5 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="neo-btn-pink text-xs py-2 px-5"
            >
              Next Step <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="neo-btn-pink text-xs py-2.5 px-6 bg-emerald-500 hover:bg-emerald-600"
            >
              {saving ? 'Publishing...' : 'Publish Quiz Now 🚀'}
            </button>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}
