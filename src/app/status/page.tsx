'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

interface CampRegistration {
  id: string
  first_name: string
  last_name: string
  nickname: string
  gender: string
  birth_date: string
  question1: string
  question2: string
  question3: string
  status: 'pending' | 'approve' | 'decline'
  comment: string
}

export default function Status() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [registration, setRegistration] = useState<CampRegistration | null>(null)

  useEffect(() => {
    checkUserAndFetchRegistration()
  }, [])

  const checkUserAndFetchRegistration = async () => {
    try {
      // Get current user
      const { data: { session }, error: authError } = await supabase.auth.getSession()
      
      if (authError || !session) {
        router.push('/login')
        return
      }

      // Fetch registration details
      const { data, error } = await supabase
        .from('camp_registrations')
        .select('*')
        .eq('camper_id', session.user.id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No registration found
          setRegistration(null)
        } else {
          throw error
        }
      } else {
        setRegistration(data)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error fetching registration status')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approve':
        return 'bg-green-100 text-green-800'
      case 'decline':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!registration) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white shadow-lg rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Registration Found</h2>
            <p className="text-gray-600 mb-6">You haven't registered for the camp yet.</p>
            <button
              onClick={() => router.push('/register')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Register Now
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Registration Status</h2>
            
            <div className="space-y-6">
              {/* Status Badge */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
                <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${getStatusColor(registration.status)}`}>
                  {registration.status.charAt(0).toUpperCase() + registration.status.slice(1)}
                </span>
              </div>

              {/* Personal Information */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Full Name</h3>
                  <p className="text-lg text-gray-900">{registration.first_name} {registration.last_name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Nickname</h3>
                  <p className="text-lg text-gray-900">{registration.nickname}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Gender</h3>
                  <p className="text-lg text-gray-900">{registration.gender}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Birth Date</h3>
                  <p className="text-lg text-gray-900">{new Date(registration.birth_date).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Questions and Answers */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Question 1</h3>
                  <p className="text-gray-900">{registration.question1}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Question 2</h3>
                  <p className="text-gray-900">{registration.question2}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Question 3</h3>
                  <p className="text-gray-900">{registration.question3}</p>
                </div>
              </div>

              {/* Comments */}
              {registration.comment && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Comments from Staff</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-900">{registration.comment}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}