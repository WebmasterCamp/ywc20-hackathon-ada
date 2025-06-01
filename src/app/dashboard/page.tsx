'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EyeIcon, PlusIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
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

export default function DashboardPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCamp, setNewCamp] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    coverImage: '',
  });

  const camps = [
    {
      id: 1,
      title: "ค่าย YWC 20",
      description: "ค่ายพัฒนาเว็บไซต์สำหรับเยาวชนรุ่นใหม่",
      coverImage: "/camp-cover-1.jpg",
      status: "active",
      startDate: "2024-07-01",
      endDate: "2024-07-07",
    },
    {
      id: 2,
      title: "ค่าย YWC 21",
      description: "ค่ายพัฒนาเว็บไซต์สำหรับเยาวชนรุ่นใหม่",
      coverImage: "/camp-cover-2.jpg",
      status: "upcoming",
      startDate: "2024-12-01",
      endDate: "2024-12-07",
    },
  ];

  const handleCreateCamp = () => {
    // TODO: Implement camp creation logic
    console.log('Creating new camp:', newCamp);
    setIsDialogOpen(false);
    setNewCamp({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      coverImage: '',
    });
  };

  return (
    <div className="space-y-6 mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">จัดการค่าย</h1>
          <p className="text-muted-foreground">
            จัดการค่ายและผู้สมัคร
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
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
                  value={newCamp.title}
                  onChange={(e) => setNewCamp({ ...newCamp, title: e.target.value })}
                  placeholder="กรอกชื่อค่าย"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">รายละเอียดค่าย</Label>
                <Textarea
                  id="description"
                  value={newCamp.description}
                  onChange={(e) => setNewCamp({ ...newCamp, description: e.target.value })}
                  placeholder="กรอกรายละเอียดค่าย"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="startDate">วันที่เริ่มต้น</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={newCamp.startDate}
                    onChange={(e) => setNewCamp({ ...newCamp, startDate: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endDate">วันที่สิ้นสุด</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={newCamp.endDate}
                    onChange={(e) => setNewCamp({ ...newCamp, endDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="coverImage">รูปภาพปก</Label>
                <Input
                  id="coverImage"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // TODO: Implement file upload logic
                      console.log('File selected:', file);
                    }
                  }}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                ยกเลิก
              </Button>
              <Button onClick={handleCreateCamp}>
                สร้างค่าย
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {camps.map((camp) => (
          <Card key={camp.id} className="overflow-hidden">
            <div className="relative h-48 w-full">
              <Image
                src={camp.coverImage}
                alt={camp.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-lg font-semibold text-white">{camp.title}</h3>
                <p className="text-sm text-white/80">{camp.description}</p>
              </div>
            </div>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {new Date(camp.startDate).toLocaleDateString('th-TH')} - {new Date(camp.endDate).toLocaleDateString('th-TH')}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${
                      camp.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'
                    }`} />
                    <span className="text-sm text-muted-foreground">
                      {camp.status === 'active' ? 'กำลังเปิดรับสมัคร' : 'เร็วๆ นี้'}
                    </span>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/dashboard/camp/${camp.id}`}>
                    <EyeIcon className="h-4 w-4 mr-2" />
                    ดูรายละเอียด
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 