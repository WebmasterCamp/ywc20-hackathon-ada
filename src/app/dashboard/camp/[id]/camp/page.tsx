'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  UserGroupIcon, 
  ClipboardDocumentListIcon, 
  QuestionMarkCircleIcon,
  ChartBarIcon,
  ClockIcon,
  CalendarIcon
} from "@heroicons/react/24/outline";
import Link from "next/link";
      import { AreaChart, Title, Text } from "@tremor/react";

interface RegistrationData {
  date: string;
  registrations: number;
}

export default function CampDetailPage({ params }: { params: { id: string } }) {
  // Mock data - replace with real data from your backend
  const stats = {
    totalApplicants: 150,
    pendingApplications: 45,
    acceptedApplications: 80,
    rejectedApplications: 25,
    totalQuestions: 8,
    daysUntilCamp: 30,
  };

  // Mock data for registration timeline
  const registrationData: RegistrationData[] = [
    { date: '2024-03-01', registrations: 5 },
    { date: '2024-03-02', registrations: 8 },
    { date: '2024-03-03', registrations: 12 },
    { date: '2024-03-04', registrations: 15 },
    { date: '2024-03-05', registrations: 20 },
    { date: '2024-03-06', registrations: 25 },
    { date: '2024-03-07', registrations: 30 },
  ];

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('th-TH');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">จัดการค่าย</h1>
        <p className="text-muted-foreground">
          ภาพรวมการจัดการค่ายและผู้สมัคร
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ผู้สมัครทั้งหมด</CardTitle>
            <UserGroupIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalApplicants}</div>
            <p className="text-xs text-muted-foreground">
              คน
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">รอการตรวจสอบ</CardTitle>
            <ClipboardDocumentListIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingApplications}</div>
            <p className="text-xs text-muted-foreground">
              คน
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ผ่านการคัดเลือก</CardTitle>
            <ChartBarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.acceptedApplications}</div>
            <p className="text-xs text-muted-foreground">
              คน
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ไม่ผ่านการคัดเลือก</CardTitle>
            <ChartBarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejectedApplications}</div>
            <p className="text-xs text-muted-foreground">
              คน
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Registration Timeline Chart */}
      <Card>
        <CardHeader>
          <CardTitle>จำนวนผู้สมัครตามเวลา</CardTitle>
          <CardDescription>
            กราฟแสดงจำนวนผู้สมัครที่เพิ่มขึ้นตามเวลา
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <AreaChart
              className="mt-4 h-72"
              data={registrationData}
              index="date"
              categories={["registrations"]}
              colors={["blue"]}
              valueFormatter={(value) => `${value} คน`}
              showLegend={false}
              showGridLines={true}
              showAnimation={true}
              customTooltip={({ payload, active }) => {
                if (!active || !payload) return null;
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                          วันที่
                        </span>
                        <span className="font-bold text-muted-foreground">
                          {formatDate(payload[0].payload.date)}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                          จำนวนผู้สมัคร
                        </span>
                        <span className="font-bold">
                          {payload[0].value} คน
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QuestionMarkCircleIcon className="h-5 w-5" />
              คำถามค่าย
            </CardTitle>
            <CardDescription>
              จัดการคำถามสำหรับผู้สมัครเข้าร่วมค่าย
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {stats.totalQuestions} คำถาม
              </div>
              <Button asChild>
                <Link href="/dashboard/questions">จัดการคำถาม</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              กำหนดการค่าย
            </CardTitle>
            <CardDescription>
              จัดการกำหนดการและกิจกรรมในค่าย
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                อีก {stats.daysUntilCamp} วัน
              </div>
              <Button asChild>
                <Link href="/dashboard/settings">จัดการกำหนดการ</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClockIcon className="h-5 w-5" />
              สถานะการคัดเลือก
            </CardTitle>
            <CardDescription>
              ตรวจสอบและอัปเดตสถานะการคัดเลือก
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {stats.pendingApplications} รายการรอตรวจสอบ
              </div>
              <Button asChild>
                <Link href="/dashboard/camp-selection">จัดการการคัดเลือก</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>กิจกรรมล่าสุด</CardTitle>
          <CardDescription>
            กิจกรรมและการเปลี่ยนแปลงล่าสุดในระบบ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">มีการอัปเดตคำถามค่าย</p>
                <p className="text-xs text-muted-foreground">2 นาทีที่แล้ว</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">มีผู้สมัครใหม่ 5 คน</p>
                <p className="text-xs text-muted-foreground">15 นาทีที่แล้ว</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-2 w-2 rounded-full bg-yellow-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">มีการอัปเดตกำหนดการค่าย</p>
                <p className="text-xs text-muted-foreground">1 ชั่วโมงที่แล้ว</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}