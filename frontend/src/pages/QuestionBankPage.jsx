import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database, PlusCircle, Search, Tag, Check, X,
  ChevronDown, ChevronUp, BookOpen
} from 'lucide-react';
import DashboardLayout from '../components/common/DashboardLayout';
import { questionBankAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { SparkleStar, RotatingBadgeDoodle } from '../components/common/Doodles';

const CATEGORIES = ['All', 'Programming', 'Mathematics', 'Science', 'General Knowledge', 'History', 'Aptitude', 'AI & ML', 'Web Development'];
const DIFFICULTIES = ['All', 'Easy', 'Intermediate', 'Hard'];

export default function QuestionBankPage() {
  const { toast } = useToast();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [difficulty, setDifficulty] = useState('All');
  const [expandedId, setExpandedId] = useState(null);

  // Add Question Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalForm, setModalForm] = useState({
    questionText: '',
    type: 'MCQ',
    category: 'Programming',
    difficulty: 'Intermediate',
    options: ['', '', '', ''],
    correctAnswer: '',
    explanation: '',
    tags: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (category !== 'All') params.category = category;
      if (difficulty !== 'All') params.difficulty = difficulty;
      const res = await questionBankAPI.getAll(params);
      setQuestions(res.data || []);
    } catch (err) {
      console.error('Failed to load questions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [category, difficulty]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchQuestions();
  };

  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    if (!modalForm.questionText.trim()) {
      toast.error('Question required', 'Please enter question text.');
      return;
    }
    if (modalForm.type === 'MCQ' && !modalForm.correctAnswer) {
      toast.error('Correct answer required', 'Please mark the correct option.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...modalForm,
        tags: modalForm.tags.split(',').map(t => t.trim()).filter(Boolean)
      };
      await questionBankAPI.create(payload);
      toast.success('Question added!', 'Added successfully to Question Bank.');
      setShowModal(false);
      setModalForm({
        questionText: '',
        type: 'MCQ',
        category: 'Programming',
        difficulty: 'Intermediate',
        options: ['', '', '', ''],
        correctAnswer: '',
        explanation: '',
        tags: ''
      });
      fetchQuestions();
    } catch (err) {
      toast.error('Failed to add question', err?.message || 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6 pb-12">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="neo-tag-pink text-xs uppercase mb-1">Central Repository</span>
            <h1 className="text-3xl font-black text-slate-900 font-display tracking-tight flex items-center gap-2 mt-1">
              <Database className="w-7 h-7 text-[#EC4899]" /> Question Bank
            </h1>
            <p className="text-slate-600 font-medium text-sm mt-1">
              Verified campus questions ready to import into any quiz.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="neo-btn-pink py-2.5 px-5 text-sm self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" /> Add to Bank
          </button>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-wrap items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[240px] relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search question bank by keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-full border-2 border-black font-bold text-slate-900 placeholder-slate-400 bg-white shadow-[2px_2px_0px_#000] focus:ring-2 focus:ring-[#EC4899]"
            />
          </form>

          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="px-4 py-2.5 rounded-full border-2 border-black font-extrabold text-xs bg-white shadow-[2px_2px_0px_#000]"
          >
            {DIFFICULTIES.map(d => (
              <option key={d} value={d}>Difficulty: {d}</option>
            ))}
          </select>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full font-extrabold text-xs border-2 border-black transition-all ${
                category === c
                  ? 'bg-[#EC4899] text-white shadow-[2px_2px_0px_#000]'
                  : 'bg-white text-slate-800 hover:bg-slate-100'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Question List */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="neo-box p-5 animate-pulse bg-white">
                <div className="h-4 bg-slate-200 rounded w-2/3 mb-2" />
                <div className="h-3 bg-slate-200 rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : questions.length === 0 ? (
          <div className="neo-box p-12 text-center bg-white">
            <RotatingBadgeDoodle text="Empty Question Bank • " icon={BookOpen} className="mx-auto mb-4" />
            <h3 className="text-xl font-black font-display text-slate-900">No questions found</h3>
            <p className="text-slate-500 font-medium text-xs mt-1">Try relaxing filters or add a new question to the bank.</p>
            <button onClick={() => setShowModal(true)} className="neo-btn-pink mt-4 text-xs py-2 px-5">
              <PlusCircle className="w-4 h-4" /> Add Question
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {questions.map((q, idx) => {
              const isExpanded = expandedId === q.id || expandedId === q._id;
              const qId = q.id || q._id;
              return (
                <div
                  key={qId || idx}
                  className="neo-box p-5 bg-white cursor-pointer hover:translate-y-[-2px]"
                  onClick={() => setExpandedId(isExpanded ? null : qId)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="neo-tag-pink text-[10px] uppercase">{q.type || 'MCQ'}</span>
                        <span className="px-2.5 py-0.5 rounded-full border border-black font-bold text-[10px] bg-amber-300">
                          {q.difficulty}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full border border-black font-bold text-[10px] bg-purple-100">
                          {q.category}
                        </span>
                        {(q.tags || []).map((t, ti) => (
                          <span key={ti} className="text-[11px] font-bold text-slate-500 flex items-center gap-0.5">
                            <Tag className="w-3 h-3 text-[#EC4899]" /> {t}
                          </span>
                        ))}
                      </div>

                      <p className="text-sm font-extrabold text-slate-900 font-display leading-snug">
                        {q.questionText}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button className="p-1 text-black font-black">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t-2 border-black space-y-3 text-xs font-bold"
                      >
                        {q.options && q.options.length > 0 && (
                          <div>
                            <p className="font-extrabold text-slate-500 mb-2 uppercase text-[10px]">Options:</p>
                            <div className="grid sm:grid-cols-2 gap-2">
                              {q.options.map((opt, oi) => {
                                const isCorrect = q.correctAnswer === opt;
                                return (
                                  <div
                                    key={oi}
                                    className={`p-2.5 rounded-xl border-2 border-black flex items-center justify-between font-bold ${
                                      isCorrect
                                        ? 'bg-[#EC4899] text-white shadow-[2px_2px_0px_#000]'
                                        : 'bg-slate-50 text-slate-800'
                                    }`}
                                  >
                                    <span>{String.fromCharCode(65 + oi)}. {opt}</span>
                                    {isCorrect && <Check className="w-4 h-4 text-white" />}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {q.explanation && (
                          <div className="p-3 rounded-xl border-2 border-black bg-amber-100 text-slate-900 font-medium">
                            <span className="font-extrabold font-display">Explanation: </span>
                            {q.explanation}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal: Add Question to Bank */}
        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white neo-box max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-4 border-b-2 border-black pb-3">
                  <h2 className="text-xl font-black font-display text-slate-900">Add Question to Bank</h2>
                  <button onClick={() => setShowModal(false)} className="text-black font-bold">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateQuestion} className="space-y-4">
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-700 mb-1">Question Text *</label>
                    <textarea
                      value={modalForm.questionText}
                      onChange={(e) => setModalForm({ ...modalForm, questionText: e.target.value })}
                      rows={3}
                      placeholder="e.g., What is the virtual DOM in React?"
                      className="w-full p-3 border-2 border-black rounded-xl font-bold text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-black uppercase text-slate-700 mb-1">Question Type *</label>
                      <select
                        value={modalForm.type || 'MCQ'}
                        onChange={(e) => {
                          const newType = e.target.value;
                          let newOpts = modalForm.options;
                          if (newType === 'TrueFalse') newOpts = ['True', 'False'];
                          else if (newType === 'FillBlank') newOpts = [];
                          else if (!newOpts || newOpts.length < 2) newOpts = ['', '', '', ''];
                          setModalForm({
                            ...modalForm,
                            type: newType,
                            options: newOpts,
                            correctAnswer: newType === 'MultiSelect' ? [] : ''
                          });
                        }}
                        className="w-full p-2.5 border-2 border-black rounded-xl font-bold text-xs bg-amber-300 shadow-[1.5px_1.5px_0px_#000]"
                      >
                        <option value="MCQ">MCQ</option>
                        <option value="MultiSelect">MultiSelect</option>
                        <option value="TrueFalse">True / False</option>
                        <option value="ShortAnswer">Short Answer</option>
                        <option value="FillBlank">Fill Blank</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase text-slate-700 mb-1">Category</label>
                      <select
                        value={modalForm.category}
                        onChange={(e) => setModalForm({ ...modalForm, category: e.target.value })}
                        className="w-full p-2.5 border-2 border-black rounded-xl font-bold text-xs"
                      >
                        {CATEGORIES.filter(c => c !== 'All').map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase text-slate-700 mb-1">Difficulty</label>
                      <select
                        value={modalForm.difficulty}
                        onChange={(e) => setModalForm({ ...modalForm, difficulty: e.target.value })}
                        className="w-full p-2.5 border-2 border-black rounded-xl font-bold text-xs"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>
                  </div>

                  {/* Dynamic Options Input according to Question Type */}
                  {(modalForm.type === 'MCQ' || modalForm.type === 'MultiSelect' || !modalForm.type) && (
                    <div>
                      <label className="block text-xs font-black uppercase text-slate-700 mb-1">Options & Select Correct Answer</label>
                      <div className="space-y-2">
                        {(modalForm.options || ['', '', '', '']).map((opt, i) => {
                          const isCorrect = modalForm.type === 'MultiSelect'
                            ? (Array.isArray(modalForm.correctAnswer) && modalForm.correctAnswer.includes(opt) && opt !== '')
                            : (modalForm.correctAnswer === opt && opt !== '');
                          return (
                            <div key={i} className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  if (modalForm.type === 'MultiSelect') {
                                    const curr = Array.isArray(modalForm.correctAnswer) ? modalForm.correctAnswer : [];
                                    const next = curr.includes(opt) ? curr.filter(c => c !== opt) : [...curr, opt];
                                    setModalForm({ ...modalForm, correctAnswer: next });
                                  } else {
                                    setModalForm({ ...modalForm, correctAnswer: opt });
                                  }
                                }}
                                className={`w-8 h-8 rounded-lg border-2 border-black flex items-center justify-center text-xs font-black transition-all ${
                                  isCorrect ? 'bg-[#EC4899] text-white shadow-[2px_2px_0px_#000]' : 'bg-slate-100 text-black'
                                }`}
                              >
                                {isCorrect ? <Check className="w-4 h-4" /> : String.fromCharCode(65 + i)}
                              </button>
                              <input
                                type="text"
                                value={opt}
                                onChange={(e) => {
                                  const opts = [...(modalForm.options || ['', '', '', ''])];
                                  opts[i] = e.target.value;
                                  setModalForm({ ...modalForm, options: opts });
                                }}
                                placeholder={`Option ${String.fromCharCode(65 + i)}`}
                                className="flex-1 px-3 py-2 border-2 border-black rounded-xl font-bold text-xs"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {modalForm.type === 'TrueFalse' && (
                    <div>
                      <label className="block text-xs font-black uppercase text-slate-700 mb-1">Select Correct Answer</label>
                      <div className="flex gap-3">
                        {['True', 'False'].map(tf => (
                          <button
                            key={tf}
                            type="button"
                            onClick={() => setModalForm({ ...modalForm, correctAnswer: tf, options: ['True', 'False'] })}
                            className={`flex-1 py-2.5 rounded-xl border-2 border-black font-black text-xs transition-all ${
                              modalForm.correctAnswer === tf ? 'bg-[#EC4899] text-white shadow-[2px_2px_0px_#000]' : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {tf}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {modalForm.type === 'FillBlank' && (
                    <div>
                      <label className="block text-xs font-black uppercase text-slate-700 mb-1">Correct Answer Word/Phrase</label>
                      <input
                        type="text"
                        value={typeof modalForm.correctAnswer === 'string' ? modalForm.correctAnswer : ''}
                        onChange={(e) => setModalForm({ ...modalForm, correctAnswer: e.target.value, options: [] })}
                        placeholder="Type exact correct word or phrase..."
                        className="w-full p-2.5 border-2 border-black rounded-xl font-bold text-xs bg-amber-50"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-black uppercase text-slate-700 mb-1">Explanation (Optional)</label>
                    <textarea
                      value={modalForm.explanation}
                      onChange={(e) => setModalForm({ ...modalForm, explanation: e.target.value })}
                      rows={2}
                      placeholder="Why is this answer correct?"
                      className="w-full p-2.5 border-2 border-black rounded-xl font-bold text-xs"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-black">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="neo-btn-white text-xs py-2 px-4"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="neo-btn-pink text-xs py-2 px-5"
                    >
                      {submitting ? 'Saving...' : 'Save Question'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
