"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        
        const fetchProfile = async () => {
          const {
            data: { user },
            error: authError,
          } = await supabase.auth.getUser();
    
          if (authError || !user) {
            console.error("Auth error:", authError);
            router.push("/login");
            return;
          }
    
    
    
          const { data, error } = await supabase
            .from("campers")
            .select("*")
            .eq("id", user.id)
            .single();
    
          if (error) {
            router.push("/setup-profile"); // ไปที่หน้า Setup Profile ถ้าไม่มีโปรไฟล์
            return;
          }
    
     
        };
    
        fetchProfile();
        // if (currentSession) {
        //   router.push('/');
        // }
      } catch (error) {
        console.error("Session check error:", error);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);
      
      // if (event === 'SIGNED_IN') {
      //   router.push('/dashboard');
      // }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setLoginError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (error) throw error;
    } catch (error) {
      console.error("Login failed:", error);
      setLoginError(
        error instanceof Error
          ? error.message
          : "Error during login"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setSession(null);
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
      setLoginError(
        error instanceof Error
          ? error.message
          : "Error logging out"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const LoadingSpinner = () => (
    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 to-blue-500">
      <div className="w-full max-w-md p-8 space-y-6 bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white">
            {session ? `Welcome Back, ${session.user.email}` : "Sign In"}
          </h1>
          <p className="text-white/80">
            {session ? "You are logged in" : "Sign in to continue to the platform"}
          </p>
        </div>

        {session ? (
          <button
            onClick={handleLogout}
            disabled={isLoading}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center space-x-3 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-70"
          >
            {isLoading ? (
              <div className="flex items-center space-x-3">
                <LoadingSpinner />
                <span>Signing out...</span>
              </div>
            ) : (
              <span>Sign Out</span>
            )}
          </button>
        ) : (
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full bg-white hover:bg-gray-50 text-gray-800 font-semibold py-3 px-4 rounded-xl flex items-center justify-center space-x-3 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-70"
          >
            {isLoading ? (
              <div className="flex items-center space-x-3">
                <LoadingSpinner />
                <span>Signing in...</span>
              </div>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>
        )}

        {loginError && (
          <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl">
            <p className="text-white text-center text-sm">{loginError}</p>
          </div>
        )}

        <div className="pt-4 text-center text-white/60 text-sm">
          {session ? `Logged in as ${session.user.email}` : "By continuing, you agree to our Terms of Service and Privacy Policy"}
        </div>
      </div>
    </div>
  );
}
