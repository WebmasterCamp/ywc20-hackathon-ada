'use client';

import { use, useEffect, useState } from "react";
import { supabase } from '@/lib/supabaseClient';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const formSchema = z.object({
    first_name: z.string().min(1, "กรุณากรอกชื่อ"),
    last_name: z.string().min(1, "กรุณากรอกนามสกุล"),
    nickname: z.string().min(1, "กรุณากรอกชื่อเล่น"),
    gender: z.string().min(1, "กรุณาเลือกเพศ"),
    birth_date: z.string().min(1, "กรุณาเลือกวันเกิด"),
    email: z.string().refine((email) => email.includes('@') && email.includes('.'), {
        message: "กรุณากรอกอีเมลให้ถูกต้อง"
    }),
    question1: z.string().min(1, "กรุณาตอบคำถาม"),
    question2: z.string().min(1, "กรุณาตอบคำถาม"),
    question3: z.string().min(1, "กรุณาตอบคำถาม"),
});

function useCountdown(targetDate: Date) {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            const difference = targetDate.getTime() - now.getTime();

            if (difference <= 0) {
                clearInterval(timer);
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                return;
            }

            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((difference / 1000 / 60) % 60);
            const seconds = Math.floor((difference / 1000) % 60);

            setTimeLeft({ days, hours, minutes, seconds });
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    return timeLeft;
}

export default function CampPage({ params }: { params: Promise<{ slug: string }> }) {
    const targetDate = new Date('2025-06-3');
    const { days, hours, minutes, seconds } = useCountdown(targetDate);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormDisabled, setIsFormDisabled] = useState(false);
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const campSlug = use(params).slug;

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            first_name: "",
            last_name: "",
            nickname: "",
            gender: "",
            birth_date: "",
            email: "",
            question1: "",
            question2: "",
            question3: "",
        },
    });

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const { data: { user }, error: userError } = await supabase.auth.getUser();
                
                if (userError || !user) {
                    setNotification({
                        type: 'error',
                        message: 'กรุณาเข้าสู่ระบบก่อนลงทะเบียน'
                    });
                    return;
                }

                // Fetch user profile data
                const { data: profileData, error: profileError } = await supabase
                    .from('campers')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (profileError) {
                    console.error('Error fetching profile:', profileError);
                    return;
                }

                if (profileData) {
                    // Pre-fill form with user data
                    form.reset({
                        first_name: profileData.first_name || "",
                        last_name: profileData.last_name || "",
                        nickname: profileData.nickname || "",
                        gender: profileData.gender || "",
                        birth_date: profileData.birth_date || "",
                        email: profileData.email || "",
                        question1: "",
                        question2: "",
                        question3: "",
                    });
                }

                // Check if user has already registered for this camp
                const { data: existingRegistration, error: registrationError } = await supabase
                    .from('camp_registrations')
                    .select('id, status, submitted_at')
                    .eq('camper_id', user.id)
                    .eq('camp_slug', campSlug)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();

                if (registrationError) {
                    console.error('Error checking registration:', registrationError);
                    return;
                }

                if (existingRegistration) {
                    setNotification({
                        type: 'error',
                        message: 'คุณได้ลงทะเบียนค่ายนี้ไปแล้ว'
                    });
                    setIsFormDisabled(true);
                }

            } catch (error) {
                console.error('Error:', error);
                setNotification({
                    type: 'error',
                    message: 'เกิดข้อผิดพลาดในการโหลดข้อมูล'
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, [form, campSlug]);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsSubmitting(true);
        setNotification(null);

        try {
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            
            if (userError || !user) {
                throw new Error('กรุณาเข้าสู่ระบบก่อนลงทะเบียน');
            }

            const { error } = await supabase
                .from('camp_registrations')
                .insert([
                    {
                        camper_id: user.id,
                        ...values,
                        camp_slug: campSlug,
                        created_at: new Date().toISOString()
                    }
                ]);

            if (error) throw error;

            setNotification({
                type: 'success',
                message: 'ลงทะเบียนสำเร็จ! เราจะติดต่อกลับไปในภายหลัง'
            });
            form.reset();
        } catch (error: any) {
            setNotification({
                type: 'error',
                message: error.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[rgb(255, 250, 241)]">
            <div className="w-full bg-black text-white py-4">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center space-x-4">
                        <div className="text-center">
                            <span className="text-2xl font-bold">{days}</span>
                            <span className="text-sm block">วัน</span>
                        </div>
                        <span className="text-2xl">:</span>
                        <div className="text-center">
                            <span className="text-2xl font-bold">{hours.toString().padStart(2, '0')}</span>
                            <span className="text-sm block">ชั่วโมง</span>
                        </div>
                        <span className="text-2xl">:</span>
                        <div className="text-center">
                            <span className="text-2xl font-bold">{minutes.toString().padStart(2, '0')}</span>
                            <span className="text-sm block">นาที</span>
                        </div>
                        <span className="text-2xl">:</span>
                        <div className="text-center">
                            <span className="text-2xl font-bold">{seconds.toString().padStart(2, '0')}</span>
                            <span className="text-sm block">วินาที</span>
                        </div>
                    </div>
                </div>
            </div>
  
            <img className="h-76 object-cover w-full" src="https://zhrlwnjbkaaautzeysuf.supabase.co/storage/v1/object/public/camp//Frame%2020%20(1).png" />
        
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-6">
                    <h1 className="text-4xl font-bold mb-6">
                       Creative Camp คืออะไร?
                    </h1>
                    <div>
                    ค่ายที่ "เปิดพื้นที่ให้เด็กมัธยมได้ปลดปล่อยความคิดสร้างสรรค์ผ่านศิลปะ การพูด และการสื่อสารหลากรูปแบบ"
                    Camp Create เป็นค่ายที่ออกแบบมาเพื่อให้วัยรุ่นได้พัฒนาทักษะ การแสดงออก ความมั่นใจ และความคิดสร้างสรรค์ ผ่านกิจกรรมศิลปะ ดนตรี การพูดในที่สาธารณะ และการเล่าเรื่อง
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>สมัครค่าย</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {notification && (
                            <div className={`mb-6 p-4 rounded-md ${
                                notification.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                            }`}>
                                {notification.message}
                            </div>
                        )}

                        {!isFormDisabled ? (
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <FormField
                                            control={form.control}
                                            name="first_name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>ชื่อ</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="ชื่อ" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="last_name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>นามสกุล</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="นามสกุล" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="nickname"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>ชื่อเล่น</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="ชื่อเล่น" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>อีเมล</FormLabel>
                                                    <FormControl>
                                                        <Input type="text" placeholder="your@email.com" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="gender"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>เพศ</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="เลือกเพศ" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="male">ชาย</SelectItem>
                                                            <SelectItem value="female">หญิง</SelectItem>
                                                            <SelectItem value="other">อื่นๆ</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="birth_date"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>วันเกิด</FormLabel>
                                                    <FormControl>
                                                        <Input type="date" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="question1"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>คำถามที่ 1</FormLabel>
                                                    <FormControl>
                                                        <Textarea placeholder="คำตอบของคุณ" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="question2"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>คำถามที่ 2</FormLabel>
                                                    <FormControl>
                                                        <Textarea placeholder="คำตอบของคุณ" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="question3"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>คำถามที่ 3</FormLabel>
                                                    <FormControl>
                                                        <Textarea placeholder="คำตอบของคุณ" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="flex justify-end">
                                        <Button type="submit" disabled={isSubmitting}>
                                            {isSubmitting ? 'กำลังส่ง...' : 'ส่งใบสมัคร'}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-lg text-gray-600">คุณได้ลงทะเบียนค่ายนี้ไปแล้ว</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}