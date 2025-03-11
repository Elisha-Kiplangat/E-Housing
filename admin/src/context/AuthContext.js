import { createContext, useEffect, useReducer } from "react";

const INITIAL_STATE = {
  user: JSON.parse(localStorage.getItem("user")) || null,
  loading: false,
  error: null,
};

export const AuthContext = createContext(INITIAL_STATE);

const AuthReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_START":
      return { user: null, loading: true, error: null };
    case "LOGIN_SUCCESS":
      return { user: action.payload, loading: false, error: null };
    case "LOGIN_FAILURE":
      return { user: null, loading: false, error: action.payload };
    case "LOGOUT":
      return { user: null, loading: false, error: null };
    default:
      return state;
  }
};

const logoutChannel = new BroadcastChannel("logout"); // ✅ Shared across tabs

export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(AuthReducer, INITIAL_STATE);

  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(state.user));

    const handleStorageChange = (event) => {
      if (event.key === "logout") {
        dispatch({ type: "LOGOUT" });
      }
    };

    const handleBroadcastLogout = () => {
      dispatch({ type: "LOGOUT" });
    };

    window.addEventListener("storage", handleStorageChange);
    logoutChannel.addEventListener("message", handleBroadcastLogout);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      logoutChannel.removeEventListener("message", handleBroadcastLogout);
    };
  }, [state.user]);

  const updateUser = (user) => {
    if (user) {
      dispatch({ type: "LOGIN_SUCCESS", payload: user });
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      dispatch({ type: "LOGOUT" });
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      sessionStorage.clear();
      logoutChannel.postMessage("logout");
      localStorage.setItem("logout", Date.now()); // Sync logout across tabs
    }
  };

  return (
    <AuthContext.Provider value={{ user: state.user, loading: state.loading, error: state.error, dispatch, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
