'use client';

import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";


export default function CampDetailPage() {
  const router = useRouter();
  useEffect(() => {
    router.push(`/dashboard/camp`);
  },[])
  return (
   <>
   <div className="flex justify-center items-center h-screen">
    <h1><Loader2 className="w-10 h-10 animate-spin" /></h1>
   </div>
   </>
  );
}