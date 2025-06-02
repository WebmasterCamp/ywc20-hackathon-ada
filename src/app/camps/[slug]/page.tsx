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
import { RiPaletteLine, RiMicLine, RiGalleryLine } from "react-icons/ri";
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
        <div className="bg-[rgb(255, 250, 241)] flex flex-col items-center justify-center">
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
  
            <img className="h-92 object-cover w-full" src="https://zhrlwnjbkaaautzeysuf.supabase.co/storage/v1/object/public/camp//Frame%2020%20(1).png" />
        
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col gap-32 text-center">
                <div className="mb-6">
                    <h1 className="text-4xl font-bold mb-6">
                       Creative Camp คืออะไร?
                    </h1>
                    <div>
                    ค่ายที่ "เปิดพื้นที่ให้เด็กมัธยมได้ปลดปล่อยความคิดสร้างสรรค์ผ่านศิลปะ การพูด และการสื่อสารหลากรูปแบบ"
                    Camp Create เป็นค่ายที่ออกแบบมาเพื่อให้วัยรุ่นได้พัฒนาทักษะ การแสดงออก ความมั่นใจ และความคิดสร้างสรรค์ ผ่านกิจกรรมศิลปะ ดนตรี การพูดในที่สาธารณะ และการเล่าเรื่อง
                    </div>
                </div>

                <div className="mb-6">
                    <h1 className="text-4xl font-bold mb-6">
                        ทำไมถึงควรสมัครค่ายนี้?
                    </h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="bg-white p-6 rounded-lg shadow-lg">
                            <div className="flex justify-center mb-4">
                                <RiPaletteLine className="w-12 h-12 text-purple-500" />
                            </div>
                            <h3 className="text-xl font-semibold mb-4">เลือกเส้นทางความสร้างสรรค์</h3>
                            <p className="text-gray-600">
                                ให้ทุกคนได้ค้นพบและเลือกเส้นทางความสร้างสรรค์ของตัวเอง ผ่านการทดลองและเรียนรู้ในรูปแบบที่หลากหลาย
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-lg">
                            <div className="flex justify-center mb-4">
                                <RiMicLine className="w-12 h-12 text-blue-500" />
                            </div>
                            <h3 className="text-xl font-semibold mb-4">วิทยากรและ Mentor มืออาชีพ</h3>
                            <p className="text-gray-600">
                                เรียนรู้และรับคำแนะนำจากวิทยากรและ Mentor ผู้เชี่ยวชาญด้านศิลปะ ดนตรี และการพูด
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-lg">
                            <div className="flex justify-center mb-4">
                                <RiGalleryLine className="w-12 h-12 text-pink-500" />
                            </div>
                            <h3 className="text-xl font-semibold mb-4">Mini Showcase</h3>
                            <p className="text-gray-600">
                                โอกาสในการแสดงผลงานจริงผ่าน Mini Showcase เพื่อแสดงศักยภาพและความคิดสร้างสรรค์
                            </p>
                        </div>
                    </div>
                </div>

                <div className="w-full bg-[#b14418] py-16">
                    <div className="max-w-4xl mx-auto px-4">
                        <h1 className="text-4xl font-bold mb-12 text-white text-center">
                            Timeline
                        </h1>
                        <div className="relative">
                            {/* Line running through timeline */}
                            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-white/30"></div>
                            
                            {/* Timeline items */}
                            <div className="space-y-16">
                                {/* Registration Period */}
                                <div className="relative">
                                    <div className="flex items-center">
                                        {/* Left content */}
                                        <div className="w-1/2 pr-8 text-right">
                                            <h3 className="text-xl font-semibold text-white mb-2">เปิดรับสมัคร</h3>
                                            <p className="text-orange-200">1 พฤษภาคม - 31 พฤษภาคม 2567</p>
                                        </div>
                                        {/* Circle indicator */}
                                        <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-green-400 rounded-full"></div>
                                        {/* Right content */}
                                        <div className="w-1/2 pl-8">
                                            <p className="text-orange-200">
                                                เปิดรับสมัครผู้เข้าร่วมค่าย<br />
                                                รับจำนวนจำกัดเพียง 60 คนเท่านั้น
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Results Announcement */}
                                <div className="relative">
                                    <div className="flex items-center">
                                        <div className="w-1/2 pr-8 text-right">
                                            <h3 className="text-xl font-semibold text-white mb-2">ประกาศผล</h3>
                                            <p className="text-orange-200">15 มิถุนายน 2567</p>
                                        </div>
                                        <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white rounded-full"></div>
                                        <div className="w-1/2 pl-8">
                                            <p className="text-orange-200">
                                                ประกาศรายชื่อผู้มีสิทธิ์เข้าร่วมค่าย<br />
                                                ผ่านทางเว็บไซต์และอีเมล
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Camp Period */}
                                <div className="relative">
                                    <div className="flex items-center">
                                        <div className="w-1/2 pr-8 text-right">
                                            <h3 className="text-xl font-semibold text-white mb-2">วันค่าย</h3>
                                            <p className="text-orange-200">1-3 กรกฎาคม 2567</p>
                                        </div>
                                        <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white rounded-full"></div>
                                        <div className="w-1/2 pl-8">
                                            <p className="text-orange-200">
                                                กิจกรรมค่าย 3 วัน 2 คืน<br />
                                                ณ มหาวิทยาลัยเกษตรศาสตร์ บางเขน
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
   <div className="w-full py-16">
                    <div className="max-w-4xl mx-auto px-4">
                        <h1 className="text-4xl font-bold mb-8 text-center">
                            สถานที่จัดค่าย
                        </h1>
                        <div className="mb-6 text-center text-gray-600">
                            <p className="text-lg mb-2">มหาวิทยาลัยเกษตรศาสตร์ (วิทยาเขตบางเขน)</p>
                            <p>50 ถนนงามวงศ์วาน แขวงลาดยาว เขตจตุจักร กรุงเทพมหานคร 10900</p>
                        </div>
                        <div className="w-full h-[400px] rounded-lg overflow-hidden shadow-lg">
                            <iframe 
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3873.8154172904274!2d100.56824731483357!3d13.846973990291392!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30e29d2309b9f20b%3A0xd1c0b7e327d15e3a!2sKasetsart%20University!5e0!3m2!1sen!2sth!4v1647887558677!5m2!1sen!2sth" 
                                width="100%" 
                                height="100%" 
                                style={{ border: 0 }} 
                                allowFullScreen 
                                loading="lazy" 
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        </div>
                        <div className="mt-6 flex justify-center">
                            <a 
                                href="https://goo.gl/maps/QZFUEzk5WL5ZTRGWA" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="inline-flex items-center px-6 py-3 bg-[#b14418] text-white font-semibold rounded-lg hover:bg-[#943813] transition-colors"
                            >
                                เปิดใน Google Maps
                            </a>
                        </div>
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
                                <p className="text-lg text-gray-600"></p>
                            </div>
                        )}
                    </CardContent>
                </Card>

             
            </div>
        </div>
    )
}