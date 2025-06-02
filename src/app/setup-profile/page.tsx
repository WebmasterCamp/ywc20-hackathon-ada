"use client";

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import Image from 'next/image'

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
    <div className="min-h-screen bg-gradient-to-br from-green-400 to-blue-500 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-white/20">
        <h2 className="text-3xl font-bold text-white text-center mb-8">Setup Your Profile</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Image Upload */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-100">
              {imagePreview ? (
                <Image
                  src={imagePreview}
                  alt="Profile preview"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">No image</span>
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="text-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-white file:text-gray-700 hover:file:bg-gray-50"
            />
          </div>

          {/* Personal Information */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-white">First Name</label>
              <input
                type="text"
                name="first_name"
                required
                value={formData.first_name}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md bg-white/10 border border-white/20 text-white px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white">Last Name</label>
              <input
                type="text"
                name="last_name"
                required
                value={formData.last_name}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md bg-white/10 border border-white/20 text-white px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white">Nickname</label>
              <input
                type="text"
                name="nickname"
                required
                value={formData.nickname}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md bg-white/10 border border-white/20 text-white px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white">Email</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md bg-white/10 border border-white/20 text-white px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white">Birth Date</label>
              <input
                type="date"
                name="birth_date"
                required
                value={formData.birth_date}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md bg-white/10 border border-white/20 text-white px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white">Gender</label>
              <select
                name="gender"
                required
                value={formData.gender}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md bg-white/10 border border-white/20 text-white px-3 py-2"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white">Strengths</label>
              <textarea
                name="strengths"
                required
                value={formData.strengths}
                onChange={handleInputChange}
                rows={3}
                className="mt-1 block w-full rounded-md bg-white/10 border border-white/20 text-white px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white">Past Activities</label>
              <textarea
                name="past_activities"
                required
                value={formData.past_activities}
                onChange={handleInputChange}
                rows={3}
                className="mt-1 block w-full rounded-md bg-white/10 border border-white/20 text-white px-3 py-2"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
