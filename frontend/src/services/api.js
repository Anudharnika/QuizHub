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
  limit,
  serverTimestamp 
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
  if (!snapshotDoc.exists()) return null;
  return { id: snapshotDoc.id, ...snapshotDoc.data() };
};

// Helper to convert collection snap to array
const formatDocs = (snapshot) => {
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
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
    await setDoc(doc(db, 'users', cred.user.uid), userData);
    return { data: userData };
  },
  login: async ({ email, password }) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
    const data = userDoc.exists() ? userDoc.data() : { id: cred.user.uid, email: cred.user.email };
    return { data };
  },
  getMe: async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Not authenticated');
    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
    return { data: userDoc.exists() ? userDoc.data() : { id: currentUser.uid, email: currentUser.email } };
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
    const colRef = collection(db, 'quizzes');
    let q = query(colRef);
    if (params.category && params.category !== 'All') {
      q = query(colRef, where('category', '==', params.category));
    }
    const snap = await getDocs(q);
    let list = formatDocs(snap);
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      list = list.filter((item) => item.title?.toLowerCase().includes(searchLower) || item.description?.toLowerCase().includes(searchLower));
    }
    return { data: list };
  },
  getById: async (id) => {
    const snap = await getDoc(doc(db, 'quizzes', id));
    if (!snap.exists()) throw new Error('Quiz not found');
    return { data: formatDoc(snap) };
  },
  create: async (data) => {
    const currentUser = auth.currentUser;
    const newQuiz = {
      ...data,
      createdBy: currentUser ? currentUser.uid : 'anonymous',
      createdAt: new Date().toISOString(),
    };
    const docRef = await addDoc(collection(db, 'quizzes'), newQuiz);
    return { data: { id: docRef.id, ...newQuiz } };
  },
  update: async (id, data) => {
    const docRef = doc(db, 'quizzes', id);
    await updateDoc(docRef, { ...data, updatedAt: new Date().toISOString() });
    const snap = await getDoc(docRef);
    return { data: formatDoc(snap) };
  },
  delete: async (id) => {
    await deleteDoc(doc(db, 'quizzes', id));
    return { data: { success: true } };
  },
};

// Question Bank Services
export const questionBankAPI = {
  getAll: async (params = {}) => {
    const colRef = collection(db, 'questionBank');
    const snap = await getDocs(colRef);
    let list = formatDocs(snap);
    if (params.category && params.category !== 'All') {
      list = list.filter((q) => q.category === params.category);
    }
    return { data: list };
  },
  create: async (data) => {
    const docRef = await addDoc(collection(db, 'questionBank'), {
      ...data,
      createdAt: new Date().toISOString(),
    });
    return { data: { id: docRef.id, ...data } };
  },
  getCategories: async () => {
    const snap = await getDocs(collection(db, 'questionBank'));
    const categories = Array.from(new Set(snap.docs.map((d) => d.data().category).filter(Boolean)));
    return { data: categories };
  },
};

// Attempt Services
export const attemptAPI = {
  submit: async (data) => {
    const currentUser = auth.currentUser;
    const attemptData = {
      ...data,
      userId: currentUser ? currentUser.uid : data.userId || 'guest',
      userName: currentUser ? (currentUser.displayName || currentUser.email) : (data.userName || 'Guest Player'),
      submittedAt: new Date().toISOString(),
    };
    const docRef = await addDoc(collection(db, 'attempts'), attemptData);
    return { data: { id: docRef.id, ...attemptData } };
  },
  getById: async (id) => {
    const snap = await getDoc(doc(db, 'attempts', id));
    if (!snap.exists()) throw new Error('Attempt not found');
    return { data: formatDoc(snap) };
  },
  getUserAttempts: async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return { data: [] };
    const q = query(collection(db, 'attempts'), where('userId', '==', currentUser.uid));
    const snap = await getDocs(q);
    return { data: formatDocs(snap) };
  },
};

// Analytics Services
export const analyticsAPI = {
  getMe: async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return { data: { totalQuizzesTaken: 0, averageScore: 0, highestScore: 0 } };
    const q = query(collection(db, 'attempts'), where('userId', '==', currentUser.uid));
    const snap = await getDocs(q);
    const attempts = formatDocs(snap);
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
    const q = query(collection(db, 'attempts'), where('quizId', '==', quizId));
    const snap = await getDocs(q);
    const attempts = formatDocs(snap);
    const totalAttempts = attempts.length;
    const avgScore = totalAttempts > 0 ? Math.round(attempts.reduce((acc, a) => acc + (a.score || 0), 0) / totalAttempts) : 0;
    return {
      data: {
        quizId,
        totalAttempts,
        averageScore: avgScore,
        attempts,
      },
    };
  },
};

// Leaderboard Services
export const leaderboardAPI = {
  get: async (params = {}) => {
    const colRef = collection(db, 'attempts');
    let q = query(colRef, orderBy('score', 'desc'), limit(params.limit ? parseInt(params.limit) : 20));
    try {
      const snap = await getDocs(q);
      return { data: formatDocs(snap) };
    } catch {
      // Fallback query if index is building
      const snap = await getDocs(colRef);
      const list = formatDocs(snap).sort((a, b) => (b.score || 0) - (a.score || 0));
      return { data: list.slice(0, 20) };
    }
  },
};

// Notification Services
export const notificationAPI = {
  getAll: async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return { data: [] };
    const q = query(collection(db, 'notifications'), where('userId', '==', currentUser.uid));
    const snap = await getDocs(q);
    return { data: formatDocs(snap) };
  },
  markRead: async (id) => {
    await updateDoc(doc(db, 'notifications', id), { read: true });
    return { data: { success: true } };
  },
  markAllRead: async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return { data: { success: true } };
    const q = query(collection(db, 'notifications'), where('userId', '==', currentUser.uid));
    const snap = await getDocs(q);
    const updatePromises = snap.docs.map((d) => updateDoc(doc(db, 'notifications', d.id), { read: true }));
    await Promise.all(updatePromises);
    return { data: { success: true } };
  },
};

// Admin Services
export const adminAPI = {
  getStats: async () => {
    const [usersSnap, quizzesSnap, attemptsSnap] = await Promise.all([
      getDocs(collection(db, 'users')),
      getDocs(collection(db, 'quizzes')),
      getDocs(collection(db, 'attempts')),
    ]);
    return {
      data: {
        totalUsers: usersSnap.size,
        totalQuizzes: quizzesSnap.size,
        totalAttempts: attemptsSnap.size,
      },
    };
  },
  getUsers: async () => {
    const snap = await getDocs(collection(db, 'users'));
    return { data: formatDocs(snap) };
  },
  deleteQuiz: async (id) => {
    await deleteDoc(doc(db, 'quizzes', id));
    return { data: { success: true } };
  },
};

// User Profile Services
export const userAPI = {
  updateProfile: async (data) => {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Not authenticated');
    await updateDoc(doc(db, 'users', currentUser.uid), data);
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
