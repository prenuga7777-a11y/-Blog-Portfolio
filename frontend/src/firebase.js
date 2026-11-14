import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCfIrQxdwgcwtMaccUB7tKY9bD4wMw6PqA",
  authDomain: "blog-portfolio-4d99b.firebaseapp.com",
  projectId: "blog-portfolio-4d99b",
  storageBucket: "blog-portfolio-4d99b.firebasestorage.app",
  messagingSenderId: "818910919782",
  appId: "1:818910919782:web:617f1d6f26d19e859881a7",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);