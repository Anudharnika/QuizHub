import { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../config/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const defaultUser = {
          id: fbUser.uid,
          uid: fbUser.uid,
          email: fbUser.email,
          name: fbUser.displayName || fbUser.email.split('@')[0],
          role: 'user',
          avatar: fbUser.photoURL || '',
        };

        // Set immediate fallback user so protected routes don't bounce
        setUser((prev) => prev || defaultUser);

        try {
          // Sync profile info from Firestore
          const userDocRef = doc(db, 'users', fbUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            setUser({ ...defaultUser, ...userDoc.data() });
          } else {
            await setDoc(userDocRef, defaultUser, { merge: true });
            setUser(defaultUser);
          }
        } catch (err) {
          console.warn("Firestore user sync warning:", err?.message);
          setUser(defaultUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    const res = await signInWithEmailAndPassword(auth, email, password);
    const fbUser = res.user;
    const userData = {
      id: fbUser.uid,
      uid: fbUser.uid,
      email: fbUser.email,
      name: fbUser.displayName || fbUser.email.split('@')[0],
      role: 'user',
      avatar: fbUser.photoURL || '',
    };
    setUser(userData);
    return userData;
  };

  const signup = async (name, email, password) => {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const fbUser = res.user;
    
    await updateProfile(fbUser, { displayName: name });

    const newUserDoc = {
      id: fbUser.uid,
      uid: fbUser.uid,
      name,
      email,
      role: 'user',
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'users', fbUser.uid), newUserDoc);
    } catch (e) {
      console.warn("Firestore setDoc warning:", e?.message);
    }
    setUser(newUserDoc);
    return newUserDoc;
  };

  const loginWithGoogle = async () => {
    const res = await signInWithPopup(auth, googleProvider);
    const fbUser = res.user;
    const userData = {
      id: fbUser.uid,
      uid: fbUser.uid,
      email: fbUser.email,
      name: fbUser.displayName || fbUser.email.split('@')[0],
      role: 'user',
      avatar: fbUser.photoURL || '',
    };
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const resetPassword = async (email) => {
    await sendPasswordResetEmail(auth, email);
  };

  const updateUser = async (updates) => {
    if (!user?.uid) return;
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, updates);
    } catch (e) {
      console.warn("Update user warning:", e?.message);
    }
    setUser((prev) => ({ ...prev, ...updates }));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, loginWithGoogle, logout, resetPassword, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
