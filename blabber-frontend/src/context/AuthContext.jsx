import  { createContext, useReducer, useContext, useEffect } from 'react';
import Loader from '../components/Loader';

const AuthContext = createContext(undefined);

export const useAuthContext = () => {
  const val = useContext(AuthContext);
  if (!val) {
    throw new Error('useAuthContext must be used within an AuthContextProvider');
  }
  return val;
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.payload || null, loading: false };
    case 'LOGOUT':
      return { ...state, user: null, loading: false };
    case 'SET_LOADING':
      return { ...state, loading: true };
    default:
      return state;
  }
};

export const AuthContextProvider= ({ children }) => {
  const [state, dispatch] = useReducer(reducer, { user: null, loading: true });

  useEffect(() => {
    const fetchUser = async () => {
      dispatch({ type: 'SET_LOADING' });
      try {
        console.log("HAHAHAHHAHAHAHAHHA")
        const response = await fetch('/api/users/check', {
          method: 'GET',
          credentials: 'include',
        });

        console.log(response)
        if (!response.ok) {
          throw new Error('Failed to fetch user');
        }

        const data = await response.json();
        console.log(data)
        if (data.user) {
          dispatch({ type: 'LOGIN', payload: data.user });
        } else {
          dispatch({ type: 'LOGOUT' });
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        dispatch({ type: 'LOGOUT' });
      }
    };

    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {state.loading ? <Loader /> : children}
    </AuthContext.Provider>
  );
};