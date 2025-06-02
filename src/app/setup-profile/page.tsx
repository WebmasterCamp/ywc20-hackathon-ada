"use client";

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import Image from 'next/image'
import { AcademicCapIcon, CommandLineIcon } from "@heroicons/react/24/outline";

interface CamperProfile {
  first_name: string
  last_name: string
  nickname: string
  birth_date: string
  gender: 'male' | 'female' | 'other'
  strengths: string
  past_activities: string
  profile_url: string
  email: string
}

export default function SetupProfile() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [formData, setFormData] = useState<CamperProfile>({
    first_name: '',
    last_name: '',
    nickname: '',
    birth_date: '',
    gender: 'male',
    strengths: '',
    past_activities: '',
    profile_url: '',
    email: ''
  })

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
      setUser(session.user)
    }
    checkUser()
    const fetchProfile = async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        console.error("Auth error:", authError);
        router.push("/login");
        return;
      }



      const { data, error } = await supabase
        .from("campers")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!error) {
        router.push("/"); // ไปที่หน้า Setup Profile ถ้าไม่มีโปรไฟล์
        return;
      }

 
    };

    fetchProfile();
  }, [router])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setProfileImage(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      let profile_url = formData.profile_url

      if (profileImage) {
        // Upload image to Supabase Storage
        const fileExt = profileImage.name.split('.').pop()
        const fileName = `${user.id}-${Math.random()}.${fileExt}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('camper')
          .upload(fileName, profileImage)

        if (uploadError) throw uploadError

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('camper')
          .getPublicUrl(fileName)

        profile_url = publicUrl
      }

      // Insert profile data
      const { error: insertError } = await supabase
        .from('campers')
        .insert([
          {
            id: user.id,
            ...formData,
            profile_url,
            created_at: new Date().toISOString()
          }
        ])

      if (insertError) throw insertError

      router.push('/dashboard')
    } catch (error) {
      console.error('Error:', error)
      alert('Error saving profile!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur opacity-20"></div>
              <div className="relative bg-white p-4 rounded-full">
                <div className="flex items-center justify-center w-20 h-20">
                  <AcademicCapIcon className="w-12 h-12 text-blue-600" />
                  <CommandLineIcon className="w-8 h-8 text-purple-600 -ml-4 -mt-4" />
                </div>
              </div>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">ตั้งค่าโปรไฟล์</h2>
          <p className="mt-2 text-gray-600">กรอกข้อมูลของคุณเพื่อเริ่มต้นใช้งาน</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {/* Profile Image Upload */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-50 border-2 border-gray-100">
              {imagePreview ? (
                <Image
                  src={imagePreview}
                  alt="Profile preview"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                  <span className="text-gray-400">ไม่มีรูปภาพ</span>
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
            />
          </div>

          {/* Personal Information */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">ชื่อ</label>
              <input
                type="text"
                name="first_name"
                required
                value={formData.first_name}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-xl bg-white border border-gray-200 text-gray-900 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">นามสกุล</label>
              <input
                type="text"
                name="last_name"
                required
                value={formData.last_name}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-xl bg-white border border-gray-200 text-gray-900 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">ชื่อเล่น</label>
              <input
                type="text"
                name="nickname"
                required
                value={formData.nickname}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-xl bg-white border border-gray-200 text-gray-900 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">อีเมล</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-xl bg-white border border-gray-200 text-gray-900 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">วันเกิด</label>
              <input
                type="date"
                name="birth_date"
                required
                value={formData.birth_date}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-xl bg-white border border-gray-200 text-gray-900 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">เพศ</label>
              <select
                name="gender"
                required
                value={formData.gender}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-xl bg-white border border-gray-200 text-gray-900 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="male">ชาย</option>
                <option value="female">หญิง</option>
                <option value="other">อื่นๆ</option>
              </select>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">จุดแข็ง</label>
              <textarea
                name="strengths"
                required
                value={formData.strengths}
                onChange={handleInputChange}
                rows={3}
                className="mt-1 block w-full rounded-xl bg-white border border-gray-200 text-gray-900 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">ประสบการณ์ที่ผ่านมา</label>
              <textarea
                name="past_activities"
                required
                value={formData.past_activities}
                onChange={handleInputChange}
                rows={3}
                className="mt-1 block w-full rounded-xl bg-white border border-gray-200 text-gray-900 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center space-x-3 transition-all duration-200 shadow-sm hover:shadow disabled:opacity-70"
            >
              {loading ? (
                <div className="flex items-center space-x-3">
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                  <span>กำลังบันทึก...</span>
                </div>
              ) : (
                <span>บันทึกข้อมูล</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
