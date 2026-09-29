"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { User } from "@/src/features/users/types/user.types";
import { authApi } from "@/src/features/auth/services/auth.api";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  setUser: () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  const isAuthRoute = pathname ? pathname.startsWith("/login") : false;

  useEffect(() => {
    let isMounted = true;

    const fetchMe = async () => {
      try {
        const currentUser = await authApi.getMe();
        if (isMounted) {
          setUser(currentUser);
        }
      } catch {
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchMe();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isLoading && !user && !isAuthRoute) {
      const returnUrl = encodeURIComponent(pathname || "/dashboard");
      router.replace(`/login?returnUrl=${returnUrl}`);
    }
  }, [isLoading, user, isAuthRoute, pathname, router]);

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error("Lỗi khi gọi API đăng xuất:", err);
    } finally {
      setUser(null);
      window.location.href = "/login";
    }
  };

  // While checking auth on dashboard routes, show an elegant loading screen to avoid FOUC
  if (isLoading && !isAuthRoute) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-900 text-white">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-slate-400 font-medium">Đang kiểm tra quyền truy cập...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);