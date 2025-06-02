"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        await supabase.auth.getSession();
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
    
          if (!error) {
            router.push("/"); // ไปที่หน้า Setup Profile ถ้าไม่มีโปรไฟล์
            return;
          }
    
     
        };
    
        fetchProfile();
        // After session is established, redirect to dashboard
        router.push("/setup-profile");
      } catch (error) {
        console.error("Error in auth callback:", error);
        router.push("/login?error=Authentication failed");
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 to-blue-500">
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-white/20">
        <div className="flex items-center space-x-4">
          <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full"></div>
          <p className="text-white">Completing sign in...</p>
        </div>
      </div>
    </div>
  );
}