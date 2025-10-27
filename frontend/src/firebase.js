import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);


export const googleProvider = new GoogleAuthProvider();
export const microsoftProvider = new OAuthProvider("microsoft.com");
export const appleProvider = new OAuthProvider("apple.com");


export const signInWithProvider = async (provider) => {
  const result = await signInWithPopup(auth, provider);
  const token = await result.user.getIdToken();
  return { user: result.user, token };
};


export const sendOTP = async (phoneNumber, recaptchaContainerId) => {
  window.recaptchaVerifier = new RecaptchaVerifier(
    recaptchaContainerId,
    { size: "invisible" },
    auth
  );
  const confirmationResult = await signInWithPhoneNumber(
    auth,
    phoneNumber,
    window.recaptchaVerifier
  );
  return confirmationResult;
};

export const verifyOTP = async (confirmationResult, otp) => {
  const result = await confirmationResult.confirm(otp);
  const token = await result.user.getIdToken();
  return { user: result.user, token };
};

export const logout  = async () => {
  await signOut(auth); 
  localStorage.removeItem("firebaseToken");
}


export const getCurrentUser = () => {
  return auth.currentUser;
};

export const getFirebaseToken = async () => {
  const user = getCurrentUser();
  if (user) {
    return await user.getIdToken();
  }
  return null;
};


export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};


export const formatUserData = (firebaseUser) => {
  return {
    name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || "User",
    email: firebaseUser.email || "",
    avatar: firebaseUser.photoURL || "",
    uid: firebaseUser.uid,
    isLoggedIn: true
  };
};