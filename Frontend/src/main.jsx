// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import './index.css'
// import App from './App.jsx'
// import 'bootstrap/dist/css/bootstrap.min.css';
// import 'bootstrap-icons/font/bootstrap-icons.css';
// import { GoogleOAuthProvider } from "@react-oauth/google";


// createRoot(document.getElementById('root')).render(
//   <StrictMode clientId="YOUR_GOOGLE_CLIENT_ID">
//     <App />
//   </StrictMode>,
// )
// // const root = ReactDOM.createRoot(document.getElementById("root"));

// // root.render(
// //   <GoogleOAuthProvider clientId="500882567959-7tt24gtlqqn4jknlnh5df73c8or92hsu.apps.googleusercontent.com">
// //     <App />
// //   </GoogleOAuthProvider>
// // );

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from './Components/AuthContext'; // ✅ adjust path if needed

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="500882567959-7tt24gtlqqn4jknlnh5df73c8or92hsu.apps.googleusercontent.com">
      <AuthProvider> {/* ✅ Add this wrapper */}
        <App />
      </AuthProvider>
    </GoogleOAuthProvider>
  </StrictMode>
);
