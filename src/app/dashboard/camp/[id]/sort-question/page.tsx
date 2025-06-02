'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  MagnifyingGlassIcon, 
  HeartIcon, 
  HeartIcon as HeartSolidIcon,
  CheckCircleIcon,
  CheckCircleIcon as CheckCircleSolidIcon
} from "@heroicons/react/24/outline";
import { useParams } from 'next/navigation';

interface Question {
  id: number;
  title: string;
  description: string;
  isLiked: boolean;
  isApproved: boolean;
  createdAt: string;
  campId: string;
}

// Mock data
const mockQuestions: Question[] = [
  {
    id: 1,
    title: "คำถามเกี่ยวกับการสมัครค่าย",
    description: "ต้องการทราบรายละเอียดการสมัครค่าย YWC 20 ต้องเตรียมเอกสารอะไรบ้าง และมีค่าใช้จ่ายเท่าไหร่",
    isLiked: false,
    isApproved: true,
    createdAt: "2024-03-15",
    campId: "1"
  },
  {
    id: 2,
    title: "สอบถามเรื่องการเตรียมตัว",
    description: "ต้องเตรียมตัวอย่างไรบ้างสำหรับการเข้าค่าย ต้องมีความรู้พื้นฐานด้านไหนบ้าง",
    isLiked: true,
    isApproved: false,
    createdAt: "2024-03-14",
    campId: "1"
  },
  {
    id: 3,
    title: "คำถามเกี่ยวกับค่าใช้จ่าย",
    description: "ต้องการทราบค่าใช้จ่ายในการเข้าค่าย และมีทุนสนับสนุนหรือไม่",
    isLiked: false,
    isApproved: true,
    createdAt: "2024-03-13",
    campId: "1"
  },
  {
    id: 4,
    title: "สอบถามเรื่องที่พัก",
    description: "ระหว่างเข้าค่ายมีที่พักให้หรือไม่ และต้องเตรียมอะไรไปบ้าง",
    isLiked: false,
    isApproved: false,
    createdAt: "2024-03-12",
    campId: "1"
  },
  {
    id: 5,
    title: "คำถามเรื่องการเดินทาง",
    description: "มีรถรับส่งจากสถานีรถไฟหรือสนามบินไปยังสถานที่จัดค่ายหรือไม่",
    isLiked: true,
    isApproved: true,
    createdAt: "2024-03-11",
    campId: "1"
  },
  {
    id: 6,
    title: "สอบถามเรื่องอาหาร",
    description: "ระหว่างเข้าค่ายมีอาหารให้หรือไม่ และสามารถเลือกรับประทานอาหารมังสวิรัติได้หรือไม่",
    isLiked: false,
    isApproved: false,
    createdAt: "2024-03-10",
    campId: "1"
  },
  {
    id: 7,
    title: "คำถามเรื่องอุปกรณ์",
    description: "ต้องนำโน๊ตบุ๊คไปเองหรือไม่ และมีข้อกำหนดเกี่ยวกับสเปคเครื่องหรือไม่",
    isLiked: false,
    isApproved: true,
    createdAt: "2024-03-09",
    campId: "1"
  },
  {
    id: 8,
    title: "สอบถามเรื่องการคัดเลือก",
    description: "มีเกณฑ์การคัดเลือกอย่างไรบ้าง และจะประกาศผลเมื่อไหร่",
    isLiked: true,
    isApproved: false,
    createdAt: "2024-03-08",
    campId: "1"
  },
  {
    id: 9,
    title: "คำถามเรื่องใบประกาศ",
    description: "เมื่อจบค่ายจะได้รับใบประกาศหรือไม่ และสามารถนำไปใช้ประกอบการสมัครงานได้หรือไม่",
    isLiked: false,
    isApproved: true,
    createdAt: "2024-03-07",
    campId: "1"
  },
  {
    id: 10,
    title: "สอบถามเรื่องการติดต่อ",
    description: "มีช่องทางการติดต่อสอบถามเพิ่มเติมอย่างไรบ้าง และมีไลน์กลุ่มสำหรับผู้สมัครหรือไม่",
    isLiked: false,
    isApproved: false,
    createdAt: "2024-03-06",
    campId: "1"
  }
];

export default function SortQuestionPage() {
  const params = useParams();
  const campId = params.id as string;
  
  const [questions, setQuestions] = useState<Question[]>(mockQuestions);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'liked' | 'unliked'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Initialize localStorage with mock data if it doesn't exist
    // const savedQuestions = localStorage.getItem(`questions-${campId}`);
    // if (!savedQuestions) {
    //   const campQuestions = mockQuestions
    //   localStorage.setItem(`questions-${campId}`, JSON.stringify(campQuestions));
    //   setQuestions(campQuestions);
    // } else {
    //   setQuestions(JSON.parse(savedQuestions));
    // }
    setLoading(false);
  }, [campId]);

  const toggleLike = (questionId: number) => {
    const updatedQuestions = questions.map(q => 
      q.id === questionId ? { ...q, isLiked: !q.isLiked } : q
    );
    setQuestions(updatedQuestions);
    localStorage.setItem(`questions-${campId}`, JSON.stringify(updatedQuestions));
  };

  const toggleApprove = (questionId: number) => {
    const updatedQuestions = questions.map(q => 
      q.id === questionId ? { ...q, isApproved: !q.isApproved } : q
    );
    setQuestions(updatedQuestions);
  };

  const filteredQuestions = questions
    .filter(question => {
      const matchesFilter = 
        filter === 'all' || 
        (filter === 'liked' && question.isLiked) ||
        (filter === 'unliked' && !question.isLiked);
      
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
            <h1 className="text-4xl font-bold text-gray-900">จัดการคำถาม</h1>
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
              variant={filter === 'unliked' ? 'default' : 'outline'}
              onClick={() => setFilter('unliked')}
            >
              คำถามที่ยังไม่ได้ถูกใจ
            </Button>
            <Button
              variant={filter === 'liked' ? 'default' : 'outline'}
              onClick={() => setFilter('liked')}
            >
              คำถามที่ถูกใจแล้ว
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
                      <div className="flex items-center gap-2 mb-2">
                        <h2 className="text-xl font-semibold text-gray-900">{question.title}</h2>
                        {question.isApproved && (
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            อนุมัติแล้ว
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-4">{question.description}</p>
                      <div className="text-sm text-gray-500">
                        วันที่: {new Date(question.createdAt).toLocaleDateString('th-TH')}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleApprove(question.id)}
                        className="ml-4"
                      >
                        {question.isApproved ? (
                          <CheckCircleSolidIcon className="h-5 w-5 text-green-500" />
                        ) : (
                          <CheckCircleIcon className="h-5 w-5 text-gray-500" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleLike(question.id)}
                        className="ml-4"
                      >
                        {question.isLiked ? (
                          <HeartSolidIcon className="h-5 w-5 text-red-500" />
                        ) : (
                          <HeartIcon className="h-5 w-5 text-gray-500" />
                        )}
                      </Button>
                    </div>
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
