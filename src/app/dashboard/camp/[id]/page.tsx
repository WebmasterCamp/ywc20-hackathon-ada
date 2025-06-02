'use client';

import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
export default function CampDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  useEffect(() => {
    router.push(`/dashboard/camp/${id}/camp`);
  },[])
  return (
   <>
   <div className="flex justify-center items-center h-screen">
    <h1><Loader2 className="w-10 h-10 animate-spin" /></h1>
   </div>
   </>
  );
}