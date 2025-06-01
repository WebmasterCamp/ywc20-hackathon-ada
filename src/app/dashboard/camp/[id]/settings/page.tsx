'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, PhotoIcon, UserGroupIcon, ClockIcon } from "@heroicons/react/24/outline";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Image from "next/image";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  campName: z.string().min(2, {
    message: "ชื่อค่ายต้องมีความยาวอย่างน้อย 2 ตัวอักษร",
  }),
  description: z.string().min(10, {
    message: "คำอธิบายต้องมีความยาวอย่างน้อย 10 ตัวอักษร",
  }),
  startDate: z.date({
    required_error: "กรุณาเลือกวันที่เริ่มค่าย",
  }),
  closeDate: z.date({
    required_error: "กรุณาเลือกวันที่ปิดรับสมัคร",
  }),
  acceptCount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "จำนวนที่รับต้องเป็นตัวเลขและมากกว่า 0",
  }),
  coverImage: z.instanceof(File).optional(),
});

export default function SettingsPage() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      campName: "",
      description: "",
      acceptCount: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    // TODO: Implement save functionality
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("coverImage", file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  // Get form values for preview
  const formValues = form.watch();
  const currentApplicants = 15; // Mock data - replace with actual data

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium">ตั้งค่าค่าย</h3>
        <p className="text-sm text-muted-foreground">
          กำหนดรายละเอียดและเงื่อนไขการรับสมัครค่าย
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="coverImage"
            render={({ field: { value, onChange, ...field } }) => (
              <FormItem>
                <FormLabel>รูปปกค่าย</FormLabel>
                <FormControl>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        className="relative"
                        onClick={() => document.getElementById("coverImage")?.click()}
                      >
                        <PhotoIcon className="h-4 w-4 mr-2" />
                        เลือกรูปภาพ
                      </Button>
                      <input
                        id="coverImage"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                        {...field}
                      />
                      {previewUrl && (
                        <Button
                          type="button"
                          variant="ghost"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => {
                            setPreviewUrl(null);
                            form.setValue("coverImage", undefined);
                          }}
                        >
                          ลบรูปภาพ
                        </Button>
                      )}
                    </div>
                    {previewUrl && (
                      <div className="relative w-full h-48 rounded-lg overflow-hidden">
                        <Image
                          src={previewUrl}
                          alt="Camp cover preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormDescription>
                  รูปภาพปกที่จะแสดงในหน้าแรกของค่าย (แนะนำขนาด 1200x630 pixels)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="campName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ชื่อค่าย</FormLabel>
                <FormControl>
                  <Input placeholder="Young Webmaster Camp" {...field} />
                </FormControl>
                <FormDescription>
                  ชื่อค่ายที่จะแสดงในระบบ
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>คำอธิบายค่าย</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="อธิบายรายละเอียดและวัตถุประสงค์ของค่าย"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  คำอธิบายที่จะแสดงในหน้าแรกของค่าย
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>วันที่เริ่มค่าย</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: th })
                          ) : (
                            <span>เลือกวันที่</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="closeDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>วันที่ปิดรับสมัคร</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: th })
                          ) : (
                            <span>เลือกวันที่</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="acceptCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>จำนวนที่รับ</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="30" {...field} />
                </FormControl>
                <FormDescription>
                  จำนวนผู้เข้าร่วมค่ายสูงสุดที่รับได้
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">บันทึกการตั้งค่า</Button>
        </form>
      </Form>

      <Separator className="my-8" />

      {/* Preview Section */}
      <div>
        <h3 className="text-lg font-medium mb-4">ตัวอย่างการแสดงผล</h3>
        <div className="grid gap-6">
          {/* Cover Image */}
          <div className="relative w-full h-[300px] rounded-lg overflow-hidden">
            <Image
              src={previewUrl || "/placeholder-cover.jpg"}
              alt={formValues.campName || "Camp Cover"}
              fill
              className="object-cover"
            />
          </div>

          {/* Camp Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{formValues.campName || "ชื่อค่าย"}</CardTitle>
              <CardDescription className="text-base">
                {formValues.description || "คำอธิบายค่าย"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">วันที่เริ่มค่าย</p>
                    <p className="text-sm text-muted-foreground">
                      {formValues.startDate ? format(formValues.startDate, "PPP", { locale: th }) : "-"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ClockIcon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">ปิดรับสมัคร</p>
                    <p className="text-sm text-muted-foreground">
                      {formValues.closeDate ? format(formValues.closeDate, "PPP", { locale: th }) : "-"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <UserGroupIcon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">จำนวนที่รับ</p>
                    <p className="text-sm text-muted-foreground">
                      {currentApplicants} / {formValues.acceptCount || 0} คน
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Application Status */}
          <Card>
            <CardHeader>
              <CardTitle>สถานะการรับสมัคร</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">ระยะเวลารับสมัคร</p>
                    <p className="text-sm text-muted-foreground">
                      {formValues.closeDate && formValues.startDate
                        ? `${format(formValues.closeDate, "PPP", { locale: th })} - ${format(formValues.startDate, "PPP", { locale: th })}`
                        : "-"}
                    </p>
                  </div>
                  <Button variant="outline" disabled>
                    กำลังเปิดรับสมัคร
                  </Button>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{
                      width: `${formValues.acceptCount ? (currentApplicants / Number(formValues.acceptCount)) * 100 : 0}%`,
                    }}
                  />
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  มีผู้สมัครแล้ว {currentApplicants} คน จาก {formValues.acceptCount || 0} คน
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 