'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { 
  HomeIcon, 
  UserGroupIcon, 
  ClipboardDocumentListIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  EyeIcon,
  QuestionMarkCircleIcon,
  ShareIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const pathname = usePathname();
  const { id } = use(params);
  const [navigation, setNavigation] = useState([
    { name: 'จัดการค่าย', href: `./camp`, icon: HomeIcon },
    { name: 'คัดน้องค่าย', href: `./camp-selection`, icon: UserGroupIcon },
    { name: 'รายการสมัคร', href: `./applications`, icon: ClipboardDocumentListIcon },
    { name: 'คำถามค่าย', href: `./questions`, icon: QuestionMarkCircleIcon },
    { name: 'ตั้งค่า', href: `./settings`, icon: Cog6ToothIcon },
    { name: 'จัดเรียงคำถาม', href: `./sort-question`, icon: ArrowPathIcon },
  ]);

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/camps/${id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('คัดลอกลิงก์แล้ว!');
    } catch (err) {
      console.error('Failed to copy link:', err);
      alert('ไม่สามารถคัดลอกลิงก์ได้');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar for desktop */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex flex-shrink-0 items-center px-4">
              <h1 className="text-xl font-bold text-gray-900">YWC Dashboard</h1>
            </div>
            <nav className="mt-5 flex-1 space-y-1 bg-white px-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon
                      className={`mr-3 h-6 w-6 flex-shrink-0 ${
                        isActive ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </a>
                );
              })}
              <Separator className="my-4" />
              <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
                <DialogTrigger asChild>
                  <button
                    className="group flex w-full items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  >
                    <ShareIcon
                      className="mr-3 h-6 w-6 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
                      aria-hidden="true"
                    />
                    แชร์ลิงก์สมัคร
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>แชร์ลิงก์สมัครค่าย</DialogTitle>
                    <DialogDescription>
                      คัดลอกลิงก์ด้านล่างเพื่อแชร์ให้ผู้ที่สนใจสมัครค่าย
                    </DialogDescription>
                  </DialogHeader>
                  <div className="mt-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={`${window.location.origin}/camps/${id}`}
                        className="flex-1 px-3 py-2 border rounded-md text-sm"
                      />
                      <Button onClick={handleShare}>
                        คัดลอก
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="sticky top-0 z-10 md:hidden bg-white pl-1 pt-1 sm:pl-3 sm:pt-3">
        <button
          type="button"
          className="-ml-0.5 -mt-0.5 inline-flex h-12 w-12 items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
          onClick={() => setSidebarOpen(true)}
        >
          <span className="sr-only">Open sidebar</span>
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        </button>
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 z-40 w-64 bg-white">
            <div className="flex h-full flex-col overflow-y-auto bg-white pt-5 pb-4">
              <div className="flex flex-shrink-0 items-center px-4">
                <h1 className="text-xl font-bold text-gray-900">YWC Dashboard</h1>
              </div>
              <nav className="mt-5 flex-1 space-y-1 bg-white px-2">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        isActive
                          ? 'bg-gray-100 text-gray-900'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon
                        className={`mr-3 h-6 w-6 flex-shrink-0 ${
                          isActive ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500'
                        }`}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  );
                })}
                <Separator className="my-4" />
                <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
                  <DialogTrigger asChild>
                    <button
                      className="group flex w-full items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <ShareIcon
                        className="mr-3 h-6 w-6 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
                        aria-hidden="true"
                      />
                      แชร์ลิงก์สมัคร
                    </button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>แชร์ลิงก์สมัครค่าย</DialogTitle>
                      <DialogDescription>
                        คัดลอกลิงก์ด้านล่างเพื่อแชร์ให้ผู้ที่สนใจสมัครค่าย
                      </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={`${window.location.origin}/camps/${id}`}
                          className="flex-1 px-3 py-2 border rounded-md text-sm"
                        />
                        <Button onClick={handleShare}>
                          คัดลอก
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col md:pl-64">
        <main className="flex-1">
          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
