import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
} from "react";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

// Session expires after 10 seconds
const EXPIRATION_TIME = 1000 * 60*10; // 10 minutes

export const AuthProvider = ({ children }) => {
  const logoutTimer = useRef(null);
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    if (!stored) return null;

    try {
      const record = JSON.parse(stored);
      const now = new Date().getTime();

      if (now > record.expiry) {
        localStorage.removeItem("user");
        return null;
      }

      return record.data;
    } catch {
      localStorage.removeItem("user");
      return null;
    }
  });

  // Schedule automatic logout
  const scheduleAutoLogout = (expiryTime) => {
    const timeLeft = expiryTime - new Date().getTime();
    if (logoutTimer.current) clearTimeout(logoutTimer.current);

    if (timeLeft <= 0) {
      logout();
      return;
    }

    // Optional warning 3 seconds before
    if (timeLeft > 5000) {
      setTimeout(() => {
        alert("Your session will expire in 3 seconds.");
      }, timeLeft - 5000);
    }

    logoutTimer.current = setTimeout(() => {
      logout();
      alert("Session expired.");
    }, timeLeft);
  };

  const login = (userData) => {
    const expiry = new Date().getTime() + EXPIRATION_TIME;
    const record = {
      data: userData,
      expiry,
    };

    localStorage.setItem("user", JSON.stringify(record));
    setUser(userData);
    scheduleAutoLogout(expiry);
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    if (logoutTimer.current) clearTimeout(logoutTimer.current);
  };

  // On mount: if there's a valid session, set the logout timer
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const record = JSON.parse(stored);
        if (record.expiry > new Date().getTime()) {
          scheduleAutoLogout(record.expiry);
        } else {
          logout();
        }
      } catch {
        logout();
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
