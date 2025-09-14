import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { Provider } from "react-redux";
import { store } from "./app/store";

import { useAppDispatch, useAppSelector } from "./app/hooks";
import { onAuthStateChanged2 } from "./firebase/firebase";
import { login, logout } from "./features/auth/authSlice";

const AuthProvider = ({ children }) => {
  const dispatch = useAppDispatch();
  const [pending, setPending] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged2((user) => {
      const handleUser = async () => {
        if (user) {
          dispatch(login({ username: user.email, token: user.uid }));
        } else {
          dispatch(logout());
        }

        setPending(false);
      };

      handleUser();
    });

    return () => unsubscribe();
  }, [dispatch]);

  if (pending) {
    return <>Loading...</>;
  }

  return <>{children}</>;
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <AuthProvider>
      <Router>
        <App />
      </Router>
    </AuthProvider>
  </Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
