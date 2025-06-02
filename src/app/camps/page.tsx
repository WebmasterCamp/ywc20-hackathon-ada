'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

interface Camp {
  id: number;
  title: string;
  description: string;
  coverImage: string;
  status: "active" | "upcoming";
  startDate: string;
  endDate: string;
}

// Mock data
const mockCamps: Camp[] = [
  {
    id: 1,
    title: "ค่าย YWC 20",
    description: "ค่ายพัฒนาเว็บไซต์สำหรับเยาวชนรุ่นใหม่",
    coverImage: "https://zhrlwnjbkaaautzeysuf.supabase.co/storage/v1/object/public/camp//Frame%2020%20(1).png",
    status: "active",
    startDate: "2024-07-01",
    endDate: "2024-07-07"
  },
  {
    id: 2,
    title: "ค่าย YWC 21",
    description: "ค่ายพัฒนาเว็บไซต์สำหรับเยาวชนรุ่นใหม่",
    coverImage: "https://zhrlwnjbkaaautzeysuf.supabase.co/storage/v1/object/public/camp//Frame%2020%20(1).png",
    status: "upcoming",
    startDate: "2024-12-01",
    endDate: "2024-12-07"
  },
  {
    id: 1748838334437,
    title: "ค่าย YWC ใหม่",
    description: "ค่ายพัฒนาเว็บไซต์สำหรับเยาวชนรุ่นใหม่",
    coverImage: "https://zhrlwnjbkaaautzeysuf.supabase.co/storage/v1/object/public/camp//Frame%2020%20(1).png",
    status: "upcoming",
    startDate: "2025-06-02",
    endDate: "2025-06-09"
  },
  {
    id: 1748838683269,
    title: "ค่าย YWC ใหม่",
    description: "ค่ายพัฒนาเว็บไซต์สำหรับเยาวชนรุ่นใหม่",
    coverImage: "https://zhrlwnjbkaaautzeysuf.supabase.co/storage/v1/object/public/camp//Frame%2020%20(1).png",
    status: "upcoming",
    startDate: "2025-06-02",
    endDate: "2025-06-09"
  }
];

export default function CampsPage() {
  const [camps, setCamps] = useState<Camp[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'upcoming'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Initialize localStorage with mock data if it doesn't exist
    const savedCamps = localStorage.getItem('camps');
    console.log('mockCamps', mockCamps);

    if (!savedCamps) {
      localStorage.setItem('camps', JSON.stringify(mockCamps));
      
      setCamps(mockCamps);
    } else {
      setCamps(JSON.parse(savedCamps));
    }
    setLoading(false);
  }, []);

  const filteredAndSortedCamps = camps
    .filter(camp => {
      const matchesFilter = filter === 'all' || camp.status === filter;
      const matchesSearch = searchQuery === '' || 
        camp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        camp.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      }
      return a.title.localeCompare(b.title);
    });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col space-y-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h1 className="text-4xl font-bold text-gray-900">ค่ายของเรา</h1>
            <div className="relative w-full md:w-64">
              <Input
                type="text"
                placeholder="ค้นหาค่าย..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
            >
              ทั้งหมด
            </Button>
            <Button
              variant={filter === 'active' ? 'default' : 'outline'}
              onClick={() => setFilter('active')}
            >
              กำลังเปิดรับสมัคร
            </Button>
            <Button
              variant={filter === 'upcoming' ? 'default' : 'outline'}
              onClick={() => setFilter('upcoming')}
            >
              เร็วๆ นี้
            </Button>
            <Button
              variant="outline"
              onClick={() => setSortBy(sortBy === 'date' ? 'title' : 'date')}
            >
              เรียงตาม: {sortBy === 'date' ? 'วันที่' : 'ชื่อ'}
            </Button>
          </div>
        </div>

        {filteredAndSortedCamps.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 text-lg">ไม่พบค่ายที่ตรงกับเงื่อนไข</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setFilter('all');
                setSearchQuery('');
              }}
            >
              ล้างตัวกรอง
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAndSortedCamps.map((camp) => (
              <Link href={`/camps/${camp.id}`} key={camp.id}>
                <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                  <div className="relative h-48">
                    <img
                      src={camp.coverImage}
                      alt={camp.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        camp.status === "active" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-blue-100 text-blue-800"
                      }`}>
                        {camp.status === "active" ? "กำลังเปิดรับสมัคร" : "เร็วๆ นี้"}
                      </span>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">{camp.title}</h2>
                    <p className="text-gray-600 mb-4">{camp.description}</p>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>เริ่ม: {new Date(camp.startDate).toLocaleDateString('th-TH')}</span>
                      <span>สิ้นสุด: {new Date(camp.endDate).toLocaleDateString('th-TH')}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 