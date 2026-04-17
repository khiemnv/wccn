import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Provider } from 'react-redux'
import { store } from './app/store.tsx'
import { useAppDispatch } from './app/hooks.tsx'
import { onAuthStateChanged2 } from './firebase/firebase.tsx'
import { getRole } from './services/role/roleApi.tsx'
import { login, logout } from './features/auth/authSlice.tsx'
import { BrowserRouter } from 'react-router-dom'

type RoleObj = { sys: string };

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();
  const [pending, setPending] = useState(true);

  useEffect(() => {
    let mounted = true;

    const unsubscribe = onAuthStateChanged2((user: { email: string; uid: string } | null) => {
      (async () => {
        try {
          if (user) {
            const roleResponse = await getRole(user.email, user.uid) as {
              result?: RoleObj | null;
            };
            const roleObj = roleResponse.result ?? null;
            dispatch(login({
              username: user.email,
              token: user.uid,
              role: roleObj?.sys ?? "",
              roleObj,
            }));
          } else {
            dispatch(logout());
          }
        } finally {
          if (mounted) setPending(false);
        }
      })();
    });

    return () => {
      mounted = false;
      unsubscribe?.();
    };
  }, [dispatch]);

  if (pending) return <>Loading...</>;

  return <>{children}</>;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <AuthProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </Provider>
  </StrictMode>,
)
