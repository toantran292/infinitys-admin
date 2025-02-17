import {
  createContext,
  useState,
  useEffect, useContext, type PropsWithChildren
} from "react";
import { useMutation } from "@tanstack/react-query";
import { jwtDecode } from "jwt-decode";
import { instance } from "~/common/api";
import {useNavigate} from "react-router";

type SignInFormData = {
  email: string;
  password: string;
};


type User = {
  id: string;
  email: string;
};

type Auth = {
  message: string;
  token: string;
  user?: User | null;
};

type Context = {
  auth: Auth;
  setAuth: (auth: Auth) => void;
  signOut: () => void;
  signIn: (data: SignInFormData) => void;
  isSigningIn: boolean;
};

const defaultAuth: Auth = {
  message: "",
  token: "",
  user: null
};

type Decoded = {
  sub: string;
  email: string;
};

const AuthContext = createContext<Context>({
  auth: defaultAuth,
  setAuth: () => {
  },
  signOut: () => {
  },
  signIn: () => {
  },
  isSigningIn: false
});

export const AuthProvider = ({ children } : PropsWithChildren) => {
  const [auth, setAuth] = useState<Auth>(defaultAuth);
  const navigate = useNavigate();

  useEffect(() => {
    const savedToken = localStorage.getItem("accessToken");
    if (savedToken) {
      try {
        const decoded = jwtDecode<Decoded>(savedToken);
        setAuth({
          message: "",
          token: savedToken,
          user: {
            id: decoded.sub,
            email: decoded.email
          }
        });
      } catch {
        setAuth(defaultAuth);
      }
    }
  }, []);

  useEffect(() => {

    if (auth.token) {
      localStorage.setItem("accessToken", auth.token);
    } else {
      localStorage.removeItem("accessToken");
    }
  }, [auth.token]);

  const signOut = () => {
    setAuth(defaultAuth);
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
    }
    navigate("/sign-in");
  };

  const { mutate: signIn, isPending: isSigningIn } = useMutation({
    mutationFn: async (data: SignInFormData) => {
      const response = await instance.post("/auths/signin", data);
      return response.data;
    },
    onSuccess: (result) => {
      if (result.token) {
        try {
          const decoded = jwtDecode<Decoded>(result.token);
          setAuth({
            message: result.message,
            token: result.token,
            user: {
              id: decoded.sub,
              email: decoded.email
            }
          });

          if (typeof window !== "undefined") {
            localStorage.setItem("accessToken", result.token);
          }
          navigate("/");
        } catch (error) {
          console.error("Token decode error:", error);
        }
      }
    },
    onError: (error) => {
      console.error("Error signing in:", error);
      setAuth({
        ...defaultAuth,
        // @ts-ignore
        message: error.response.data.message
      });
    }
  });


  return (
    <AuthContext.Provider
      value={{
        auth,
        setAuth,
        signOut,
        signIn,
        isSigningIn
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

export const useAuth = () => useContext(AuthContext);