import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  updateProfile as updateFbProfile 
} from 'firebase/auth';
import { db, auth } from '../config/firebase';

// Helper to convert Firestore snap doc to object with ID
const formatDoc = (snapshotDoc) => {
  if (!snapshotDoc || !snapshotDoc.exists()) return null;
  return { id: snapshotDoc.id, ...snapshotDoc.data() };
};

// Helper to convert collection snap to array
const formatDocs = (snapshot) => {
  if (!snapshot || !snapshot.docs) return [];
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// LocalStorage helpers for fallback persistence
const getLocalQuizzes = () => {
  try {
    return JSON.parse(localStorage.getItem('quizdeck_local_quizzes') || '[]');
  } catch {
    return [];
  }
};

const saveLocalQuiz = (quiz) => {
  try {
    const list = getLocalQuizzes();
    const quizId = quiz.id || quiz._id;
    const updated = [quiz, ...list.filter(q => (q.id || q._id) !== quizId)];
    localStorage.setItem('quizdeck_local_quizzes', JSON.stringify(updated));
  } catch (e) {
    console.warn('LocalStorage save error:', e);
  }
};

const deleteLocalQuiz = (id) => {
  try {
    const list = getLocalQuizzes();
    const updated = list.filter(q => q.id !== id && q._id !== id);
    localStorage.setItem('quizdeck_local_quizzes', JSON.stringify(updated));
  } catch (e) {
    console.warn('LocalStorage delete error:', e);
  }
};

const getLocalAttempts = () => {
  try {
    return JSON.parse(localStorage.getItem('quizdeck_local_attempts') || '[]');
  } catch {
    return [];
  }
};

const saveLocalAttempt = (attempt) => {
  try {
    const list = getLocalAttempts();
    const attId = attempt.id || attempt._id;
    const updated = [attempt, ...list.filter(a => (a.id || a._id) !== attId)];
    localStorage.setItem('quizdeck_local_attempts', JSON.stringify(updated));
  } catch (e) {
    console.warn('LocalStorage save attempt error:', e);
  }
};

// Auth Services
export const authAPI = {
  signup: async ({ name, email, password }) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateFbProfile(cred.user, { displayName: name });
    const userData = {
      id: cred.user.uid,
      uid: cred.user.uid,
      name,
      email,
      role: 'user',
      createdAt: new Date().toISOString(),
    };
    try {
      await setDoc(doc(db, 'users', cred.user.uid), userData);
    } catch (e) {
      console.warn('Firestore set user profile warning:', e);
    }
    return { data: userData };
  },
  login: async ({ email, password }) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    try {
      const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
      const data = userDoc.exists() ? userDoc.data() : { id: cred.user.uid, email: cred.user.email, name: cred.user.displayName };
      return { data };
    } catch {
      return { data: { id: cred.user.uid, email: cred.user.email, name: cred.user.displayName } };
    }
  },
  getMe: async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Not authenticated');
    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      return { data: userDoc.exists() ? userDoc.data() : { id: currentUser.uid, email: currentUser.email, name: currentUser.displayName } };
    } catch {
      return { data: { id: currentUser.uid, email: currentUser.email, name: currentUser.displayName } };
    }
  },
  forgotPassword: async (email) => {
    await sendPasswordResetEmail(auth, email);
    return { data: { message: 'Password reset email sent' } };
  },
  resetPassword: async () => {
    return { data: { message: 'Use Firebase email link to reset password' } };
  },
};

// Quiz Services
export const quizAPI = {
  getAll: async (params = {}) => {
    let firestoreList = [];
    try {
      const colRef = collection(db, 'quizzes');
      let q = query(colRef);
      if (params.category && params.category !== 'All') {
        q = query(colRef, where('category', '==', params.category));
      }
      const snap = await Promise.race([
        getDocs(q),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore timeout')), 4000))
      ]);
      firestoreList = formatDocs(snap);
    } catch (err) {
      console.warn('Firestore getAll fallback to local:', err);
    }

    const localList = getLocalQuizzes();
    const mergedMap = new Map();
    [...localList, ...firestoreList].forEach(item => {
      const key = item.id || item._id;
      if (key && !mergedMap.has(key)) {
        mergedMap.set(key, item);
      }
    });

    let result = Array.from(mergedMap.values());
    if (params.category && params.category !== 'All') {
      result = result.filter(item => item.category === params.category);
    }
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      result = result.filter((item) =>
        item.title?.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower)
      );
    }
    return { data: result };
  },

  getById: async (id) => {
    const localList = getLocalQuizzes();
    const localMatch = localList.find(q => q.id === id || q._id === id);
    if (localMatch) {
      return { data: localMatch };
    }

    try {
      const snap = await Promise.race([
        getDoc(doc(db, 'quizzes', id)),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore timeout')), 4000))
      ]);
      if (snap && snap.exists()) {
        return { data: formatDoc(snap) };
      }
    } catch (err) {
      console.warn('Firestore getById warning:', err);
    }

    throw new Error('Quiz not found');
  },

  create: async (data) => {
    const currentUser = auth.currentUser;
    const cleanData = JSON.parse(JSON.stringify(data || {}));
    const generatedId = cleanData.id || `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const newQuiz = {
      ...cleanData,
      id: generatedId,
      createdBy: currentUser ? currentUser.uid : (cleanData.createdBy || 'anonymous'),
      createdAt: new Date().toISOString(),
    };

    // 1. Instantly store in LocalStorage fallback
    saveLocalQuiz(newQuiz);

    // 2. Race Firestore write with a 4-second timeout to guarantee publishing never hangs
    try {
      const writePromise = addDoc(collection(db, 'quizzes'), newQuiz);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Firestore timeout')), 4000)
      );
      const docRef = await Promise.race([writePromise, timeoutPromise]);
      if (docRef && docRef.id) {
        newQuiz.id = docRef.id;
        saveLocalQuiz(newQuiz);
      }
    } catch (err) {
      console.warn('Firestore publish timeout/fallback applied:', err);
    }

    return { data: newQuiz };
  },

  update: async (id, data) => {
    const cleanData = JSON.parse(JSON.stringify(data || {}));
    const updatedObj = { ...cleanData, updatedAt: new Date().toISOString() };
    saveLocalQuiz({ id, ...updatedObj });
    try {
      const docRef = doc(db, 'quizzes', id);
      await updateDoc(docRef, updatedObj);
    } catch (e) {
      console.warn('Firestore update warning:', e);
    }
    return { data: { id, ...updatedObj } };
  },

  delete: async (id) => {
    deleteLocalQuiz(id);
    try {
      await deleteDoc(doc(db, 'quizzes', id));
    } catch (e) {
      console.warn('Firestore delete warning:', e);
    }
    return { data: { success: true } };
  },
};

// Question Bank Services
export const questionBankAPI = {
  getAll: async (params = {}) => {
    try {
      const colRef = collection(db, 'questionBank');
      const snap = await getDocs(colRef);
      let list = formatDocs(snap);
      if (params.category && params.category !== 'All') {
        list = list.filter((q) => q.category === params.category);
      }
      return { data: list };
    } catch {
      return { data: [] };
    }
  },
  create: async (data) => {
    const cleanData = JSON.parse(JSON.stringify(data || {}));
    const newDoc = {
      ...cleanData,
      id: `qb_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date().toISOString(),
    };
    try {
      const docRef = await addDoc(collection(db, 'questionBank'), newDoc);
      newDoc.id = docRef.id;
    } catch (e) {
      console.warn('QuestionBank create warning:', e);
    }
    return { data: newDoc };
  },
  getCategories: async () => {
    try {
      const snap = await getDocs(collection(db, 'questionBank'));
      const categories = Array.from(new Set(snap.docs.map((d) => d.data().category).filter(Boolean)));
      return { data: categories };
    } catch {
      return { data: [] };
    }
  },
};

// Attempt Services
export const attemptAPI = {
  submit: async (data) => {
    const currentUser = auth.currentUser;
    const cleanData = JSON.parse(JSON.stringify(data || {}));
    const attemptId = cleanData.id || `att_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    let quiz = null;
    if (cleanData.quizId) {
      try {
        const qRes = await quizAPI.getById(cleanData.quizId);
        quiz = qRes.data;
      } catch (e) {}
    }

    let score = cleanData.score || 0;
    let totalPoints = cleanData.totalPoints || 100;
    let percentage = cleanData.percentage || 0;
    let answersList = cleanData.answers || [];

    if (quiz && quiz.questions && cleanData.answers && typeof cleanData.answers === 'object' && !Array.isArray(cleanData.answers)) {
      const userAnsObj = cleanData.answers;
      let totalQ = quiz.questions.length;
      let correctQ = 0;

      answersList = quiz.questions.map((q) => {
        const userResp = userAnsObj[q.id];
        let isCorrect = false;
        if (q.type === 'MultiSelect') {
          const userArr = Array.isArray(userResp) ? [...userResp].sort() : [];
          const corrArr = Array.isArray(q.correctAnswer) ? [...q.correctAnswer].sort() : [];
          isCorrect = JSON.stringify(userArr) === JSON.stringify(corrArr);
        } else if (q.type === 'FillBlank' || q.type === 'ShortAnswer') {
          isCorrect = String(userResp || '').trim().toLowerCase() === String(q.correctAnswer || '').trim().toLowerCase();
        } else {
          isCorrect = userResp === q.correctAnswer;
        }
        if (isCorrect) correctQ++;
        return {
          questionId: q.id,
          userResponse: userResp || '',
          isCorrect,
          pointsEarned: isCorrect ? (q.points || 10) : 0
        };
      });

      percentage = totalQ > 0 ? Math.round((correctQ / totalQ) * 100) : 0;
      score = percentage;
      totalPoints = 100;
    }

    const attemptData = {
      id: attemptId,
      quizId: cleanData.quizId,
      quizTitle: quiz?.title || cleanData.quizTitle || 'Quiz',
      answers: answersList,
      timeTaken: cleanData.timeTaken || 0,
      score,
      totalPoints,
      percentage,
      accuracy: percentage,
      userId: currentUser ? currentUser.uid : (cleanData.userId || 'guest'),
      userName: currentUser ? (currentUser.displayName || currentUser.email) : (cleanData.userName || 'Guest Player'),
      submittedAt: new Date().toISOString(),
    };

    saveLocalAttempt(attemptData);

    try {
      const docRefPromise = addDoc(collection(db, 'attempts'), attemptData);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Firestore timeout')), 4000)
      );
      const docRef = await Promise.race([docRefPromise, timeoutPromise]);
      if (docRef && docRef.id) {
        attemptData.id = docRef.id;
        saveLocalAttempt(attemptData);
      }
    } catch (err) {
      console.warn('Firestore attempt submit fallback:', err);
    }

    return { data: attemptData };
  },

  getById: async (id) => {
    const localList = getLocalAttempts();
    const localMatch = localList.find(a => a.id === id || a._id === id);
    if (localMatch) {
      return { data: localMatch };
    }

    try {
      const snap = await Promise.race([
        getDoc(doc(db, 'attempts', id)),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 4000))
      ]);
      if (snap && snap.exists()) {
        return { data: formatDoc(snap) };
      }
    } catch (err) {
      console.warn('Firestore getById attempt error:', err);
    }

    throw new Error('Attempt not found');
  },

  getUserAttempts: async () => {
    const localList = getLocalAttempts();
    const currentUser = auth.currentUser;
    if (!currentUser) return { data: localList };
    try {
      const q = query(collection(db, 'attempts'), where('userId', '==', currentUser.uid));
      const snap = await getDocs(q);
      const fsList = formatDocs(snap);
      const mergedMap = new Map();
      [...localList, ...fsList].forEach(a => mergedMap.set(a.id || a._id, a));
      return { data: Array.from(mergedMap.values()) };
    } catch {
      return { data: localList };
    }
  },
};

// Analytics Services
export const analyticsAPI = {
  getMe: async () => {
    const currentUser = auth.currentUser;
    const localAttempts = getLocalAttempts();
    if (!currentUser && localAttempts.length === 0) {
      return { data: { totalQuizzesTaken: 0, averageScore: 0, highestScore: 0, recentAttempts: [] } };
    }
    const attempts = localAttempts;
    const total = attempts.length;
    const avgScore = total > 0 ? Math.round(attempts.reduce((acc, a) => acc + (a.score || 0), 0) / total) : 0;
    const highestScore = total > 0 ? Math.max(...attempts.map((a) => a.score || 0)) : 0;
    return {
      data: {
        totalQuizzesTaken: total,
        averageScore: avgScore,
        highestScore: highestScore,
        recentAttempts: attempts.slice(-5),
      },
    };
  },
  getQuiz: async (quizId) => {
    const localAttempts = getLocalAttempts().filter(a => a.quizId === quizId);
    const totalAttempts = localAttempts.length;
    const avgScore = totalAttempts > 0 ? Math.round(localAttempts.reduce((acc, a) => acc + (a.score || 0), 0) / totalAttempts) : 0;
    return {
      data: {
        quizId,
        totalAttempts,
        averageScore: avgScore,
        attempts: localAttempts,
      },
    };
  },
};

// Leaderboard Services
export const leaderboardAPI = {
  get: async (params = {}) => {
    const localAttempts = getLocalAttempts();
    try {
      const colRef = collection(db, 'attempts');
      let q = query(colRef, orderBy('score', 'desc'), limit(params.limit ? parseInt(params.limit) : 20));
      const snap = await getDocs(q);
      const fsList = formatDocs(snap);
      const mergedMap = new Map();
      [...localAttempts, ...fsList].forEach(a => mergedMap.set(a.id || a._id, a));
      const sorted = Array.from(mergedMap.values()).sort((a, b) => (b.score || 0) - (a.score || 0));
      return { data: sorted.slice(0, 20) };
    } catch {
      const sorted = [...localAttempts].sort((a, b) => (b.score || 0) - (a.score || 0));
      return { data: sorted.slice(0, 20) };
    }
  },
};

// Notification Services
export const notificationAPI = {
  getAll: async () => {
    return { data: [] };
  },
  markRead: async () => {
    return { data: { success: true } };
  },
  markAllRead: async () => {
    return { data: { success: true } };
  },
};

// Admin Services
export const adminAPI = {
  getStats: async () => {
    const localQuizzes = getLocalQuizzes();
    const localAttempts = getLocalAttempts();
    return {
      data: {
        totalUsers: 1,
        totalQuizzes: localQuizzes.length,
        totalAttempts: localAttempts.length,
      },
    };
  },
  getUsers: async () => {
    return { data: [] };
  },
  deleteQuiz: async (id) => {
    deleteLocalQuiz(id);
    return { data: { success: true } };
  },
};

// User Profile Services
export const userAPI = {
  updateProfile: async (data) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return { data: { success: true } };
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), data);
    } catch (e) {
      console.warn('Update profile warning:', e);
    }
    return { data: { success: true } };
  },
};

export default {
  auth: authAPI,
  quiz: quizAPI,
  questionBank: questionBankAPI,
  attempt: attemptAPI,
  analytics: analyticsAPI,
  leaderboard: leaderboardAPI,
  notification: notificationAPI,
  admin: adminAPI,
  user: userAPI,
};
