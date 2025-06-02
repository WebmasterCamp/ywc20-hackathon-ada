'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EyeIcon, PlusIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Camp {
  id: number;
  title: string;
  description: string;
  coverImage: string;
  status: "active" | "upcoming";
  startDate: string;
  endDate: string;
}

const defaultCamp: Camp = {
  id: Date.now(),
  title: "ค่าย YWC ใหม่",
  description: "ค่ายพัฒนาเว็บไซต์สำหรับเยาวชนรุ่นใหม่",
  coverImage: "/camp-cover-1.jpg",
  status: "upcoming",
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
};

export default function DashboardPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [camps, setCamps] = useState<Camp[]>([]);
  const [newCamp, setNewCamp] = useState<Camp>(defaultCamp);

  // Load camps from localStorage on component mount
  useEffect(() => {
    const savedCamps = localStorage.getItem('camps');
    if (savedCamps) {
      setCamps(JSON.parse(savedCamps));
    } else {
      // Set initial camps if none exist
      const initialCamps: Camp[] = [
        {
          id: 1,
          title: "ค่าย YWC 20",
          description: "ค่ายพัฒนาเว็บไซต์สำหรับเยาวชนรุ่นใหม่",
          coverImage: "/camp-cover-1.jpg",
          status: "active" as const,
          startDate: "2024-07-01",
          endDate: "2024-07-07",
        },
        {
          id: 2,
          title: "ค่าย YWC 21",
          description: "ค่ายพัฒนาเว็บไซต์สำหรับเยาวชนรุ่นใหม่",
          coverImage: "/camp-cover-2.jpg",
          status: "upcoming" as const,
          startDate: "2024-12-01",
          endDate: "2024-12-07",
        },
      ];
      setCamps(initialCamps);
      localStorage.setItem('camps', JSON.stringify(initialCamps));
    }
  }, []);

  const handleCreateCamp = () => {
    const updatedCamps = [...camps, { ...newCamp, id: Date.now() }];
    setCamps(updatedCamps);
    localStorage.setItem('camps', JSON.stringify(updatedCamps));
    setIsDialogOpen(false);
    setNewCamp(defaultCamp);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewCamp(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">จัดการค่าย</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <PlusIcon className="h-5 w-5" />
                สร้างค่ายใหม่
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>สร้างค่ายใหม่</DialogTitle>
                <DialogDescription>
                  กรอกข้อมูลค่ายที่ต้องการสร้าง
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">ชื่อค่าย</Label>
                  <Input
                    id="title"
                    name="title"
                    value={newCamp.title}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">รายละเอียด</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={newCamp.description}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="coverImage">รูปภาพปก</Label>
                  <Input
                    id="coverImage"
                    name="coverImage"
                    value={newCamp.coverImage}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="startDate">วันที่เริ่ม</Label>
                    <Input
                      id="startDate"
                      name="startDate"
                      type="date"
                      value={newCamp.startDate}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="endDate">วันที่สิ้นสุด</Label>
                    <Input
                      id="endDate"
                      name="endDate"
                      type="date"
                      value={newCamp.endDate}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">สถานะ</Label>
                  <select
                    id="status"
                    name="status"
                    value={newCamp.status}
                    onChange={(e) => setNewCamp(prev => ({ ...prev, status: e.target.value as "active" | "upcoming" }))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="active">กำลังเปิดรับสมัคร</option>
                    <option value="upcoming">เร็วๆ นี้</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateCamp}>สร้างค่าย</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {camps.map((camp) => (
            <Card key={camp.id} className="overflow-hidden">
              <div className="relative h-48">
                <Image
                  src={camp.coverImage}
                  alt={camp.title}
                  fill
                  className="object-cover"
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
                <div className="flex justify-between text-sm text-gray-500 mb-4">
                  <span>เริ่ม: {new Date(camp.startDate).toLocaleDateString('th-TH')}</span>
                  <span>สิ้นสุด: {new Date(camp.endDate).toLocaleDateString('th-TH')}</span>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" asChild>
                    <Link href={`/dashboard/camp/${camp.id}`}>
                      <EyeIcon className="h-5 w-5 mr-2" />
                      ดูรายละเอียด
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 