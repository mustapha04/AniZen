import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

interface AuthContextType {
  user: User | null;
  profile: any | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        try {
          const docRef = doc(db, "profiles", user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            // Auto-promote specified email to admin
            if ((user.email === "thefeedbuzz.store@gmail.com" || user.email === "mustaphaelibrahimi6@gmail.com") && data.role !== "admin") {
              const updatedProfile = { ...data, role: "admin" };
              try {
                await setDoc(docRef, updatedProfile, { merge: true });
                setProfile(updatedProfile);
              } catch (updateErr) {
                console.error("Failed to auto-promote admin:", updateErr);
                // Even if update fails, set it locally so they can use the dashboard
                setProfile(updatedProfile);
              }
            } else {
              setProfile(data);
            }
          } else {
            // New user profile
            const newProfile = {
              uid: user.uid,
              email: user.email,
              username: user.displayName || user.email?.split("@")?.[0] || "User",
              avatarUrl: user.photoURL,
              role: (user.email === "thefeedbuzz.store@gmail.com" || user.email === "mustaphaelibrahimi6@gmail.com") ? "admin" : "user",
              createdAt: new Date().toISOString(),
            };
            try {
              await setDoc(docRef, newProfile);
            } catch (createErr) {
               console.error("Failed to create profile:", createErr);
            }
            setProfile(newProfile);
          }
        } catch (fetchErr) {
          console.error("Error fetching profile:", fetchErr);
          // Fallback minimal profile if fetch fails but we have auth
          if (user.email === "thefeedbuzz.store@gmail.com" || user.email === "mustaphaelibrahimi6@gmail.com") {
             setProfile({ uid: user.uid, role: "admin", email: user.email });
          }
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
