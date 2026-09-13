import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database, PlusCircle, Search, Filter, Tag, Check, X,
  ChevronDown, ChevronUp, BookOpen, Layers, Type, Trash2, HelpCircle
} from 'lucide-react';
import DashboardLayout from '../components/common/DashboardLayout';
import { questionBankAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

const CATEGORIES = ['All', 'Programming', 'Mathematics', 'Science', 'General Knowledge', 'History', 'Aptitude', 'AI & ML', 'Web Development'];
const DIFFICULTIES = ['All', 'Easy', 'Intermediate', 'Hard'];

const DIFF_COLORS = {
  Easy: 'difficulty-easy',
  Intermediate: 'difficulty-intermediate',
  Hard: 'difficulty-hard'
};

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
      setQuestions(res.data);
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
      toast.error('Failed to add question', err?.response?.data?.message || 'Please try again.');
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
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Question Bank</h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Centralized repository of verified questions to import into any quiz.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="btn-primary self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" /> Add to Bank
          </button>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-wrap items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[240px] relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search question bank by keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10 pr-4"
            />
          </form>

          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="input w-auto text-sm"
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
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                category === c
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Question List */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="card p-5 animate-pulse flex flex-col gap-2">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : questions.length === 0 ? (
          <div className="card text-center py-16">
            <Database className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No questions found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Try relaxing filters or add a new question to the bank.</p>
            <button onClick={() => setShowModal(true)} className="btn-primary mt-4 mx-auto text-xs">
              <PlusCircle className="w-4 h-4" /> Add Question
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {questions.map((q, idx) => {
              const isExpanded = expandedId === q._id;
              return (
                <div
                  key={q._id || idx}
                  className="card p-5 hover:border-slate-300 dark:hover:border-slate-600 transition-all cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : q._id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="badge badge-slate">{q.type || 'MCQ'}</span>
                        <span className={`badge ${DIFF_COLORS[q.difficulty] || 'badge-slate'}`}>
                          {q.difficulty}
                        </span>
                        <span className="badge badge-indigo">{q.category}</span>
                        {(q.tags || []).map((t, ti) => (
                          <span key={ti} className="text-[11px] text-slate-400 flex items-center gap-0.5">
                            <Tag className="w-3 h-3" /> {t}
                          </span>
                        ))}
                      </div>

                      <p className="text-sm font-semibold text-slate-900 dark:text-white leading-snug">
                        {q.questionText}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button className="text-slate-400 hover:text-slate-600 p-1">
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
                        className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/80 space-y-3 text-xs"
                      >
                        {q.options && q.options.length > 0 && (
                          <div>
                            <p className="font-semibold text-slate-500 mb-2">Options:</p>
                            <div className="grid sm:grid-cols-2 gap-2">
                              {q.options.map((opt, oi) => {
                                const isCorrect = q.correctAnswer === opt;
                                return (
                                  <div
                                    key={oi}
                                    className={`px-3 py-2 rounded-xl border flex items-center justify-between ${
                                      isCorrect
                                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 font-semibold'
                                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                                    }`}
                                  >
                                    <span>{String.fromCharCode(65 + oi)}. {opt}</span>
                                    {isCorrect && <Check className="w-4 h-4 text-emerald-500" />}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {q.explanation && (
                          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 text-indigo-900 dark:text-indigo-300">
                            <span className="font-bold">Explanation: </span>
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
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Add Question to Bank</h2>
                  <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateQuestion} className="space-y-4">
                  <div>
                    <label className="label">Question Text *</label>
                    <textarea
                      value={modalForm.questionText}
                      onChange={(e) => setModalForm({ ...modalForm, questionText: e.target.value })}
                      rows={3}
                      placeholder="e.g., What is the virtual DOM in React?"
                      className="input resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">Category</label>
                      <select
                        value={modalForm.category}
                        onChange={(e) => setModalForm({ ...modalForm, category: e.target.value })}
                        className="input text-xs"
                      >
                        {CATEGORIES.filter(c => c !== 'All').map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="label">Difficulty</label>
                      <select
                        value={modalForm.difficulty}
                        onChange={(e) => setModalForm({ ...modalForm, difficulty: e.target.value })}
                        className="input text-xs"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="label">Options & Mark Correct Answer</label>
                    <div className="space-y-2">
                      {modalForm.options.map((opt, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setModalForm({ ...modalForm, correctAnswer: opt })}
                            className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center text-xs font-bold transition-all ${
                              modalForm.correctAnswer === opt && opt !== ''
                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                : 'border-slate-300 dark:border-slate-600 text-slate-400'
                            }`}
                          >
                            {modalForm.correctAnswer === opt && opt !== '' ? <Check className="w-4 h-4" /> : String.fromCharCode(65 + i)}
                          </button>
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => {
                              const opts = [...modalForm.options];
                              opts[i] = e.target.value;
                              setModalForm({ ...modalForm, options: opts });
                            }}
                            placeholder={`Option ${String.fromCharCode(65 + i)}`}
                            className="input flex-1 text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="label">Explanation (Optional)</label>
                    <textarea
                      value={modalForm.explanation}
                      onChange={(e) => setModalForm({ ...modalForm, explanation: e.target.value })}
                      rows={2}
                      placeholder="Why is this answer correct?"
                      className="input resize-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="label">Tags (comma separated)</label>
                    <input
                      type="text"
                      value={modalForm.tags}
                      onChange={(e) => setModalForm({ ...modalForm, tags: e.target.value })}
                      placeholder="React, JavaScript, Frontend"
                      className="input text-xs"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="btn-secondary text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-primary text-xs"
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
