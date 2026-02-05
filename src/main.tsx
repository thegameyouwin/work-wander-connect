 import { createRoot } from "react-dom/client";
 import App from "./App.tsx";
 import "./index.css";
 import "./i18n";

 // Set initial RTL direction based on stored language
 const storedLang = localStorage.getItem('i18nextLng');
 if (storedLang === 'ar') {
   document.documentElement.dir = 'rtl';
   document.documentElement.lang = 'ar';
 }
 
 createRoot(document.getElementById("root")!).render(<App />);
