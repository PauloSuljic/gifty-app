import { createContext } from "react";
import { User as FirebaseUser } from "firebase/auth";
import { GiftyUser } from "../hooks/useDatabaseUser";

// ✅ Define context type
export interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  register: (email: string, password: string, username: string, dateOfBirth: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshFirebaseUser: () => Promise<void>;
  databaseUser: GiftyUser | null;
  refreshDatabaseUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
