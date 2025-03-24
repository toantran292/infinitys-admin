import {
  createContext,
  useState,
  useEffect, useContext, type PropsWithChildren
} from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { jwtDecode } from "jwt-decode";
import { instance } from "@/common/api";
import { useNavigate } from "react-router";
import type { User } from "@/types/users";

type SignInFormData = {
  email: string;
  password: string;
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
  user: User | null;
  isGettingUser: boolean;
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
  isSigningIn: false,
  isGettingUser: true,
  user: null
});

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [auth, setAuth] = useState<Auth>(() => {
    if (typeof window !== 'undefined') {
      const savedToken = localStorage.getItem("accessToken");
      if (savedToken) {
        return {
          message: "",
          token: savedToken,
        };
      }
    }
    return defaultAuth;
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (auth.token) {
        localStorage.setItem("accessToken", auth.token);
      } else {
        localStorage.removeItem("accessToken");
      }
    }
  }, [auth.token]);

  const signOut = () => {
    setAuth(defaultAuth);
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
    }
    navigate("/sign-in");
  };

  const { data: userData, isLoading: isGettingUser } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      if (!auth.token) return null;
      const response = await instance.get("/auths/me");
      return response.data;
    },
    enabled: typeof window !== 'undefined' && (!!auth.token || !!localStorage.getItem("accessToken")),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const { mutate: signIn, isPending: isSigningIn } = useMutation({
    mutationFn: async (data: SignInFormData) => {
      const response = await instance.post("/auths/login", data);
      return response.data;
    },
    onSuccess: (result) => {
      if (result.token && result.token.accessToken) {
        try {
          setAuth({
            message: result.message,
            token: result.token.accessToken,
          });
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
        user: userData || null,
        setAuth,
        signOut,
        signIn,
        isSigningIn,
        isGettingUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

export const useAuth = () => useContext(AuthContext);