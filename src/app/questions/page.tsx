'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MagnifyingGlassIcon, ArchiveBoxIcon, ArchiveBoxXMarkIcon } from "@heroicons/react/24/outline";

interface Question {
  id: number;
  title: string;
  description: string;
  isArchived: boolean;
  createdAt: string;
}

// Mock data
const mockQuestions: Question[] = [
  {
    id: 1,
    title: "คำถามเกี่ยวกับการสมัครค่าย",
    description: "ต้องการทราบรายละเอียดการสมัครค่าย YWC 20",
    isArchived: false,
    createdAt: "2024-03-15"
  },
  {
    id: 2,
    title: "สอบถามเรื่องการเตรียมตัว",
    description: "ต้องเตรียมตัวอย่างไรบ้างสำหรับการเข้าค่าย",
    isArchived: true,
    createdAt: "2024-03-14"
  },
  {
    id: 3,
    title: "คำถามเกี่ยวกับค่าใช้จ่าย",
    description: "ต้องการทราบค่าใช้จ่ายในการเข้าค่าย",
    isArchived: false,
    createdAt: "2024-03-13"
  }
];

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'archived' | 'active'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Initialize localStorage with mock data if it doesn't exist
    const savedQuestions = localStorage.getItem('questions');
    if (!savedQuestions) {
      localStorage.setItem('questions', JSON.stringify(mockQuestions));
      setQuestions(mockQuestions);
    } else {
      setQuestions(JSON.parse(savedQuestions));
    }
    setLoading(false);
  }, []);

  const toggleArchive = (questionId: number) => {
    const updatedQuestions = questions.map(q => 
      q.id === questionId ? { ...q, isArchived: !q.isArchived } : q
    );
    setQuestions(updatedQuestions);
    localStorage.setItem('questions', JSON.stringify(updatedQuestions));
  };

  const filteredQuestions = questions
    .filter(question => {
      const matchesFilter = 
        filter === 'all' || 
        (filter === 'archived' && question.isArchived) ||
        (filter === 'active' && !question.isArchived);
      
      const matchesSearch = searchQuery === '' || 
        question.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        question.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

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
            <h1 className="text-4xl font-bold text-gray-900">คำถามทั้งหมด</h1>
            <div className="relative w-full md:w-64">
              <Input
                type="text"
                placeholder="ค้นหาคำถาม..."
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
              คำถามที่ยังไม่ได้เก็บ
            </Button>
            <Button
              variant={filter === 'archived' ? 'default' : 'outline'}
              onClick={() => setFilter('archived')}
            >
              คำถามที่เก็บแล้ว
            </Button>
          </div>
        </div>

        {filteredQuestions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 text-lg">ไม่พบคำถามที่ตรงกับเงื่อนไข</p>
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
          <div className="grid grid-cols-1 gap-6">
            {filteredQuestions.map((question) => (
              <Card key={question.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">{question.title}</h2>
                      <p className="text-gray-600 mb-4">{question.description}</p>
                      <div className="text-sm text-gray-500">
                        วันที่: {new Date(question.createdAt).toLocaleDateString('th-TH')}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleArchive(question.id)}
                      className="ml-4"
                    >
                      {question.isArchived ? (
                        <ArchiveBoxXMarkIcon className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ArchiveBoxIcon className="h-5 w-5 text-gray-500" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 