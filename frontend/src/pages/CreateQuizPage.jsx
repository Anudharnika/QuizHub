import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight, ChevronLeft, Check, PlusCircle, Trash2, GripVertical,
  Image, Clock, Target, Tag, Globe, Lock, EyeOff, BookOpen, CheckSquare,
  AlignLeft, List, RefreshCw, Layers, Type
} from 'lucide-react';
import DashboardLayout from '../components/common/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { quizAPI } from '../services/api';

const STEPS = ['Quiz Info', 'Question Type', 'Questions', 'Settings', 'Preview & Publish'];
const CATEGORIES = ['Programming', 'Mathematics', 'Science', 'General Knowledge', 'History', 'Aptitude', 'AI & ML', 'Web Development'];
const DIFFICULTIES = ['Easy', 'Intermediate', 'Hard'];
const VISIBILITIES = [
  { value: 'Public', icon: Globe, desc: 'Anyone can find & take this quiz' },
  { value: 'Private', icon: Lock, desc: 'Only you can access this quiz' },
  { value: 'Unlisted', icon: EyeOff, desc: 'Only people with the link can access' },
];

const QUESTION_TYPES = [
  { type: 'MCQ', icon: Target, label: 'Multiple Choice', desc: 'One correct answer from 4 options', color: 'from-indigo-500 to-violet-500' },
  { type: 'MultiSelect', icon: CheckSquare, label: 'Multiple Select', desc: 'Multiple correct answers', color: 'from-violet-500 to-purple-500' },
  { type: 'TrueFalse', icon: Check, label: 'True / False', desc: 'Binary true or false question', color: 'from-emerald-500 to-teal-500' },
  { type: 'FillBlank', icon: Type, label: 'Fill in the Blank', desc: 'Complete the missing word', color: 'from-amber-500 to-orange-500' },
  { type: 'ShortAnswer', icon: AlignLeft, label: 'Short Answer', desc: 'Type a brief text answer', color: 'from-blue-500 to-cyan-500' },
  { type: 'Matching', icon: Layers, label: 'Matching', desc: 'Match items in two columns', color: 'from-pink-500 to-rose-500' },
  { type: 'Ordering', icon: List, label: 'Ordering', desc: 'Arrange items in correct order', color: 'from-red-500 to-orange-500' },
  { type: 'ImageBased', icon: Image, label: 'Image Based', desc: 'Question with an image', color: 'from-teal-500 to-green-500' },
];

function createEmptyQuestion(type = 'MCQ') {
  const base = {
    id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    type,
    questionText: '',
    points: 10,
    difficulty: 'Intermediate',
    explanation: '',
    tags: [],
    imageUrl: '',
  };
  switch (type) {
    case 'MCQ': return { ...base, options: ['', '', '', ''], correctAnswer: '' };
    case 'MultiSelect': return { ...base, options: ['', '', '', ''], correctAnswer: [] };
    case 'TrueFalse': return { ...base, options: ['True', 'False'], correctAnswer: '' };
    case 'FillBlank': return { ...base, correctAnswer: '' };
    case 'ShortAnswer': return { ...base, correctAnswer: '' };
    case 'ImageBased': return { ...base, options: ['', '', '', ''], correctAnswer: '', imageUrl: '' };
    default: return { ...base, options: ['', '', '', ''], correctAnswer: '' };
  }
}

// Step 1 — Quiz Information
function Step1({ info, setInfo }) {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="label">Quiz Title *</label>
          <input value={info.title} onChange={e => setInfo({ ...info, title: e.target.value })}
            placeholder="e.g., JavaScript Fundamentals Quiz"
            className="input text-base font-medium" />
        </div>
        <div className="md:col-span-2">
          <label className="label">Description</label>
          <textarea value={info.description} onChange={e => setInfo({ ...info, description: e.target.value })}
            placeholder="What will participants learn or be tested on?"
            rows={3} className="input resize-none" />
        </div>
        <div>
          <label className="label">Category</label>
          <select value={info.category} onChange={e => setInfo({ ...info, category: e.target.value })} className="input">
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Difficulty</label>
          <div className="flex gap-2">
            {DIFFICULTIES.map(d => (
              <button key={d} onClick={() => setInfo({ ...info, difficulty: d })}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${info.difficulty === d
                  ? d === 'Easy' ? 'bg-emerald-500 text-white border-emerald-500'
                    : d === 'Intermediate' ? 'bg-amber-500 text-white border-amber-500'
                      : 'bg-red-500 text-white border-red-500'
                  : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-500'}`}>
                {d}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label"><Clock className="w-4 h-4 inline mr-1" /> Time Limit (minutes)</label>
          <input type="number" value={info.timeLimit} onChange={e => setInfo({ ...info, timeLimit: Number(e.target.value) })}
            min={1} max={180} className="input" />
        </div>
        <div>
          <label className="label"><Tag className="w-4 h-4 inline mr-1" /> Tags (comma separated)</label>
          <input value={info.tagsInput} onChange={e => setInfo({ ...info, tagsInput: e.target.value })}
            placeholder="JavaScript, Frontend, Beginner" className="input" />
        </div>
        <div>
          <label className="label"><Image className="w-4 h-4 inline mr-1" /> Cover Image URL</label>
          <input value={info.coverImage} onChange={e => setInfo({ ...info, coverImage: e.target.value })}
            placeholder="https://..." className="input" />
          {info.coverImage && (
            <img src={info.coverImage} alt="cover" className="mt-2 w-full h-32 object-cover rounded-xl" onError={e => e.target.style.display = 'none'} />
          )}
        </div>
        <div>
          <label className="label">Visibility</label>
          <div className="space-y-2">
            {VISIBILITIES.map(({ value, icon: Icon, desc }) => (
              <button key={value} onClick={() => setInfo({ ...info, visibility: value })}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${info.visibility === value ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}>
                <Icon className={`w-4 h-4 ${info.visibility === value ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                <div>
                  <p className={`text-sm font-medium ${info.visibility === value ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-200'}`}>{value}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{desc}</p>
                </div>
                {info.visibility === value && <Check className="w-4 h-4 text-indigo-600 ml-auto" />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Step 2 — Question Type
function Step2({ onSelect }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Choose a question type to add</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Select the type of question you want to create. You can mix types in the same quiz.</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {QUESTION_TYPES.map(qt => (
          <motion.button key={qt.type} onClick={() => onSelect(qt.type)}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 text-left transition-all group">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${qt.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
              <qt.icon className="w-5 h-5 text-white" />
            </div>
            <p className="font-semibold text-slate-900 dark:text-white text-sm">{qt.label}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{qt.desc}</p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// MCQ option editor
function MCQEditor({ question, onChange }) {
  const setOption = (i, val) => {
    const opts = [...question.options];
    opts[i] = val;
    onChange({ ...question, options: opts });
  };
  const addOption = () => onChange({ ...question, options: [...question.options, ''] });
  const removeOption = (i) => {
    const opts = question.options.filter((_, idx) => idx !== i);
    onChange({ ...question, options: opts, correctAnswer: question.correctAnswer === question.options[i] ? '' : question.correctAnswer });
  };

  return (
    <div className="space-y-2">
      <label className="label">Answer Options</label>
      {question.options.map((opt, i) => (
        <div key={i} className="flex items-center gap-2">
          <button
            onClick={() => onChange({ ...question, correctAnswer: question.type === 'MultiSelect' ? (question.correctAnswer.includes(opt) ? question.correctAnswer.filter(a => a !== opt) : [...question.correctAnswer, opt]) : opt })}
            className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center border-2 transition-all ${(question.type === 'MultiSelect' ? question.correctAnswer?.includes(opt) : question.correctAnswer === opt) ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 dark:border-slate-600 text-slate-400'}`}>
            {(question.type === 'MultiSelect' ? question.correctAnswer?.includes(opt) : question.correctAnswer === opt) ? <Check className="w-4 h-4" /> : <span className="text-xs font-bold">{String.fromCharCode(65 + i)}</span>}
          </button>
          <input value={opt} onChange={e => setOption(i, e.target.value)}
            placeholder={`Option ${String.fromCharCode(65 + i)}`}
            className="input flex-1" />
          {question.options.length > 2 && (
            <button onClick={() => removeOption(i)} className="text-slate-400 hover:text-red-500 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}
      {question.options.length < 8 && (
        <button onClick={addOption} className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-medium">
          <PlusCircle className="w-4 h-4" /> Add Option
        </button>
      )}
    </div>
  );
}

function TrueFalseEditor({ question, onChange }) {
  return (
    <div>
      <label className="label">Correct Answer</label>
      <div className="flex gap-3">
        {['True', 'False'].map(opt => (
          <button key={opt} onClick={() => onChange({ ...question, correctAnswer: opt })}
            className={`flex-1 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${question.correctAnswer === opt ? (opt === 'True' ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-red-500 border-red-500 text-white') : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300'}`}>
            {opt === 'True' ? '✅ True' : '❌ False'}
          </button>
        ))}
      </div>
    </div>
  );
}

// Step 3 — Question Editor
function Step3({ questions, setQuestions, onAddType }) {
  const [editing, setEditing] = useState(null);
  const [dragOver, setDragOver] = useState(null);

  const updateQ = (idx, updates) => {
    const updated = [...questions];
    updated[idx] = { ...updated[idx], ...updates };
    setQuestions(updated);
  };

  const deleteQ = (idx) => setQuestions(questions.filter((_, i) => i !== idx));
  const duplicateQ = (idx) => {
    const dupe = { ...questions[idx], id: `q_${Date.now()}` };
    const updated = [...questions];
    updated.splice(idx + 1, 0, dupe);
    setQuestions(updated);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white">{questions.length} Question{questions.length !== 1 ? 's' : ''}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Click a question to edit it</p>
        </div>
        <button onClick={onAddType}
          className="btn-primary text-sm py-2">
          <PlusCircle className="w-4 h-4" /> Add Question
        </button>
      </div>

      {questions.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
          <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="font-medium text-slate-500 dark:text-slate-400">No questions yet</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mb-4">Click "Add Question" to start building your quiz</p>
          <button onClick={onAddType} className="btn-primary mx-auto"><PlusCircle className="w-4 h-4" /> Add First Question</button>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((q, idx) => (
            <motion.div key={q.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`border-2 rounded-2xl transition-all ${editing === idx ? 'border-indigo-500 shadow-lg shadow-indigo-500/10' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}>
              {/* Question header */}
              <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={() => setEditing(editing === idx ? null : idx)}>
                <GripVertical className="w-5 h-5 text-slate-300 dark:text-slate-600 flex-shrink-0" />
                <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold flex-shrink-0">{idx + 1}</span>
                <span className="badge badge-slate flex-shrink-0">{q.type}</span>
                <p className="text-sm text-slate-700 dark:text-slate-200 flex-1 truncate font-medium">
                  {q.questionText || <span className="text-slate-400 italic">Click to edit question text...</span>}
                </p>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-slate-400 dark:text-slate-500">{q.points}pts</span>
                  <button onClick={(e) => { e.stopPropagation(); duplicateQ(idx); }} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors" title="Duplicate">
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); deleteQ(idx); }} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors" title="Delete">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Inline editor */}
              <AnimatePresence>
                {editing === idx && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t border-slate-100 dark:border-slate-700">
                    <div className="p-4 space-y-4">
                      {/* Image URL for ImageBased */}
                      {q.type === 'ImageBased' && (
                        <div>
                          <label className="label">Question Image URL</label>
                          <input value={q.imageUrl || ''} onChange={e => updateQ(idx, { imageUrl: e.target.value })}
                            placeholder="https://..." className="input" />
                          {q.imageUrl && <img src={q.imageUrl} alt="q" className="mt-2 w-full h-40 object-cover rounded-xl" onError={e => e.target.style.display = 'none'} />}
                        </div>
                      )}

                      {/* Question text */}
                      <div>
                        <label className="label">Question Text *</label>
                        <textarea value={q.questionText} onChange={e => updateQ(idx, { questionText: e.target.value })}
                          placeholder="Enter your question here..." rows={3} className="input resize-none" />
                      </div>

                      {/* Type-specific editors */}
                      {(q.type === 'MCQ' || q.type === 'MultiSelect' || q.type === 'ImageBased') && (
                        <MCQEditor question={q} onChange={updated => updateQ(idx, updated)} />
                      )}
                      {q.type === 'TrueFalse' && (
                        <TrueFalseEditor question={q} onChange={updated => updateQ(idx, updated)} />
                      )}
                      {(q.type === 'FillBlank' || q.type === 'ShortAnswer') && (
                        <div>
                          <label className="label">Correct Answer</label>
                          <input value={q.correctAnswer} onChange={e => updateQ(idx, { correctAnswer: e.target.value })}
                            placeholder="Enter the correct answer" className="input" />
                        </div>
                      )}

                      {/* Points, difficulty, explanation */}
                      <div className="grid sm:grid-cols-3 gap-4">
                        <div>
                          <label className="label">Points</label>
                          <input type="number" value={q.points} min={1} max={100}
                            onChange={e => updateQ(idx, { points: Number(e.target.value) })} className="input" />
                        </div>
                        <div>
                          <label className="label">Difficulty</label>
                          <select value={q.difficulty} onChange={e => updateQ(idx, { difficulty: e.target.value })} className="input">
                            {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="label">Tags</label>
                          <input value={q.tags?.join(', ') || ''} onChange={e => updateQ(idx, { tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                            placeholder="e.g., JavaScript, React" className="input" />
                        </div>
                      </div>
                      <div>
                        <label className="label">Explanation (shown after submission)</label>
                        <textarea value={q.explanation || ''} onChange={e => updateQ(idx, { explanation: e.target.value })}
                          placeholder="Explain why the answer is correct..." rows={2} className="input resize-none" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// Step 4 — Settings
function Step4({ settings, setSettings }) {
  const toggles = [
    { key: 'randomizeQuestions', label: 'Randomize Questions', desc: 'Shuffle question order for each participant' },
    { key: 'randomizeAnswers', label: 'Randomize Answers', desc: 'Shuffle answer options for each question' },
    { key: 'showCorrectAnswers', label: 'Show Correct Answers', desc: 'Reveal correct answers after submission' },
    { key: 'showExplanations', label: 'Show Explanations', desc: 'Display explanations for each question' },
    { key: 'allowRetakes', label: 'Allow Retakes', desc: 'Let participants take the quiz multiple times' },
    { key: 'showLeaderboard', label: 'Show Leaderboard', desc: 'Display public leaderboard for this quiz' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <label className="label">Passing Score (%)</label>
        <div className="flex items-center gap-4">
          <input type="range" min={0} max={100} value={settings.passingScore}
            onChange={e => setSettings({ ...settings, passingScore: Number(e.target.value) })}
            className="flex-1 accent-indigo-600" />
          <span className="w-12 text-center font-bold text-indigo-600 dark:text-indigo-400">{settings.passingScore}%</span>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-slate-900 dark:text-white">Quiz Behavior</h3>
        {toggles.map(({ key, label, desc }) => (
          <div key={key} className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700 last:border-0">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">{label}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{desc}</p>
            </div>
            <button onClick={() => setSettings({ ...settings, [key]: !settings[key] })}
              className={`relative w-11 h-6 rounded-full transition-colors ${settings[key] ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}>
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${settings[key] ? 'translate-x-5' : ''}`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Step 5 — Preview & Publish
function Step5({ info, questions, settings }) {
  return (
    <div className="space-y-6">
      <div className="card bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 border-indigo-100 dark:border-indigo-800">
        {info.coverImage && <img src={info.coverImage} alt="cover" className="w-full h-48 object-cover rounded-xl mb-4" onError={e => e.target.style.display = 'none'} />}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{info.title || 'Untitled Quiz'}</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{info.description}</p>
          </div>
          <span className={`badge ${info.difficulty === 'Easy' ? 'difficulty-easy' : info.difficulty === 'Hard' ? 'difficulty-hard' : 'difficulty-intermediate'}`}>
            {info.difficulty}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { label: 'Questions', value: questions.length },
            { label: 'Time Limit', value: `${info.timeLimit}m` },
            { label: 'Pass Score', value: `${settings.passingScore}%` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-3">
              <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-slate-900 dark:text-white">Question Preview</h3>
        {questions.slice(0, 3).map((q, i) => (
          <div key={q.id} className="card flex items-start gap-3 py-3">
            <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-700 dark:text-slate-200 truncate">{q.questionText || 'No question text'}</p>
              <div className="flex gap-2 mt-1">
                <span className="badge badge-slate">{q.type}</span>
                <span className="badge badge-indigo">{q.points}pts</span>
              </div>
            </div>
          </div>
        ))}
        {questions.length > 3 && <p className="text-sm text-slate-500 dark:text-slate-400 text-center">+{questions.length - 3} more questions</p>}
        {questions.length === 0 && <p className="text-sm text-amber-600 dark:text-amber-400 text-center py-4">⚠️ No questions added yet. Please go back and add at least one question.</p>}
      </div>
    </div>
  );
}

export default function CreateQuizPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState(0);
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [saving, setSaving] = useState(false);

  const [info, setInfo] = useState({
    title: '',
    description: '',
    category: 'Programming',
    difficulty: 'Intermediate',
    timeLimit: 15,
    tagsInput: '',
    coverImage: '',
    visibility: 'Public',
  });

  const [questions, setQuestions] = useState([]);

  const [settings, setSettings] = useState({
    randomizeQuestions: false,
    randomizeAnswers: false,
    showCorrectAnswers: true,
    showExplanations: true,
    allowRetakes: true,
    showLeaderboard: true,
    passingScore: 70,
  });

  const handleAddType = (type) => {
    const newQ = createEmptyQuestion(type);
    setQuestions(prev => [...prev, newQ]);
    setShowTypeSelector(false);
    if (step === 1) setStep(2);
  };

  const handleSave = async (publish = false) => {
    if (!info.title.trim()) {
      toast.error('Title required', 'Please provide a quiz title.');
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
        coverImage: info.coverImage,
        visibility: publish ? 'Public' : info.visibility,
        questions,
        settings: {
          randomizeQuestions: settings.randomizeQuestions,
          randomizeAnswers: settings.randomizeAnswers,
          showCorrectAnswers: settings.showCorrectAnswers,
          showExplanations: settings.showExplanations,
          allowRetakes: settings.allowRetakes,
          showLeaderboard: settings.showLeaderboard,
        },
        passingScore: settings.passingScore,
      };
      const res = await quizAPI.create(payload);
      toast.success(publish ? 'Quiz Published! 🎉' : 'Draft Saved', publish ? 'Your quiz is now live.' : 'Quiz saved as draft.');
      navigate(`/quiz/${res.data._id}`);
    } catch (err) {
      toast.error('Save failed', err?.response?.data?.message || 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (showTypeSelector) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <button onClick={() => setShowTypeSelector(false)} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-6 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back to editor
          </button>
          <Step2 onSelect={handleAddType} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create Quiz</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Build an engaging quiz step by step</p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-0 mb-8 overflow-x-auto pb-2">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-0 flex-shrink-0">
              <button
                onClick={() => setStep(i)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${step === i ? 'bg-indigo-600 text-white shadow-sm' : i < step ? 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30' : 'text-slate-400 dark:text-slate-500'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${step === i ? 'bg-white/20' : i < step ? 'bg-indigo-100 dark:bg-indigo-900/50' : 'bg-slate-100 dark:bg-slate-700'}`}>
                  {i < step ? <Check className="w-3 h-3" /> : i + 1}
                </span>
                <span className="hidden sm:block">{s}</span>
              </button>
              {i < STEPS.length - 1 && <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 mx-1 flex-shrink-0" />}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="card min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              {step === 0 && <Step1 info={info} setInfo={setInfo} />}
              {step === 1 && <Step2 onSelect={handleAddType} />}
              {step === 2 && <Step3 questions={questions} setQuestions={setQuestions} onAddType={() => setShowTypeSelector(true)} />}
              {step === 3 && <Step4 settings={settings} setSettings={setSettings} />}
              {step === 4 && <Step5 info={info} questions={questions} settings={settings} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="btn-secondary disabled:opacity-40">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          <div className="flex gap-3">
            <button onClick={() => handleSave(false)} disabled={saving}
              className="btn-secondary">
              {saving ? <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" /> : 'Save Draft'}
            </button>
            {step < STEPS.length - 1 ? (
              <button onClick={() => setStep(step + 1)} className="btn-primary">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={() => handleSave(true)} disabled={saving || questions.length === 0} className="btn-primary bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50">
                {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : '🚀 Publish Quiz'}
              </button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
