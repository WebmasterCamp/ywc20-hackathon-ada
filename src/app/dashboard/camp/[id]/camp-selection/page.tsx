'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface CampApplication {
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
  certificate: boolean
  certificate_url: string
}

export default function CampSelection() {
  const [applications, setApplications] = useState<CampApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editComment, setEditComment] = useState('')
  const [bulkCertificate, setBulkCertificate] = useState(false)
  const [uploadingTemplate, setUploadingTemplate] = useState(false)
  const [templateFile, setTemplateFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('camp_registrations')
        .select('*')
        .order('submitted_at', { ascending: false })

      if (error) throw error
      setApplications(data || [])
    } catch (error) {
      console.error('Error fetching applications:', error)
      alert('Error fetching applications')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string, status: 'pending' | 'approve' | 'decline') => {
    try {
      const { error } = await supabase
        .from('camp_registrations')
        .update({ status })
        .eq('id', id)

      if (error) throw error
      fetchApplications()
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Error updating status')
    }
  }

  const updateComment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('camp_registrations')
        .update({ comment: editComment })
        .eq('id', id)

      if (error) throw error
      setEditingId(null)
      setEditComment('')
      fetchApplications()
    } catch (error) {
      console.error('Error updating comment:', error)
      alert('Error updating comment')
    }
  }

  const updateCertificateUrl = async (id: string, url: string) => {
    try {
      const { error } = await supabase
        .from('camp_registrations')
        .update({ certificate_url: url })
        .eq('id', id)

      if (error) throw error
      fetchApplications()
    } catch (error) {
      console.error('Error updating certificate URL:', error)
      alert('Error updating certificate URL')
    }
  }

  const toggleBulkCertificate = async () => {
    try {
      const { error } = await supabase
        .from('camp_registrations')
        .update({ 
          certificate: !bulkCertificate,
          submitted_at: new Date().toISOString()
        })
        .not('id', 'is', null)

      if (error) throw error
      setBulkCertificate(!bulkCertificate)
      fetchApplications()
    } catch (error) {
      console.error('Error updating bulk certificate:', error)
      alert('Error updating bulk certificate')
    }
  }

  const handleTemplateFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file (JPG, PNG, etc)')
        return
      }
      setTemplateFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const uploadTemplateAndUpdateUrls = async () => {
    if (!templateFile) return

    setUploadingTemplate(true)
    try {
      // Upload template to Supabase Storage
      const fileExt = templateFile.name.split('.').pop()
      const fileName = `certificate-template-${Date.now()}.${fileExt}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('certificates')
        .upload(`templates/${fileName}`, templateFile)

      if (uploadError) throw uploadError

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('certificates')
        .getPublicUrl(`templates/${fileName}`)

      // Update all applications with the new template URL
      const { error: updateError } = await supabase
        .from('camp_registrations')
        .update({ 
          certificate_url: publicUrl,
          submitted_at: new Date().toISOString()
        })
        .not('id', 'is', null) // Better way to select all rows

      if (updateError) throw updateError

      // Refresh the applications list
      fetchApplications()
      
      // Clear the file input
      setTemplateFile(null)
      setPreviewUrl('')
      
      alert('Certificate template updated successfully!')
    } catch (error) {
      console.error('Error uploading template:', error)
      alert('Error uploading certificate template')
    } finally {
      setUploadingTemplate(false)
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

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Camp Applications</h1>
          <div className="flex flex-wrap gap-4 items-start bg-white p-4 rounded-lg shadow">
            <div className="flex-1 min-w-[300px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Certificate Template (Image)</label>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleTemplateFileChange}
                    className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <button
                    onClick={uploadTemplateAndUpdateUrls}
                    disabled={!templateFile || uploadingTemplate}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {uploadingTemplate ? 'Uploading...' : 'Upload & Apply'}
                  </button>
                </div>
                {previewUrl && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 mb-1">Selected template:</p>
                    <div className="flex items-center gap-2">
                      <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm text-gray-700">{templateFile?.name}</span>
                      <button
                        onClick={() => {
                          setTemplateFile(null)
                          setPreviewUrl('')
                        }}
                        className="text-xs text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={toggleBulkCertificate}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
              >
                {bulkCertificate ? 'Disable All Certificates' : 'Enable All Certificates'}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Certificate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {applications.map((app) => (
                  <tr key={app.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{app.first_name} {app.last_name}</div>
                      <div className="text-sm text-gray-500">{app.nickname}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{app.gender}</div>
                      <div className="text-sm text-gray-500">{new Date(app.birth_date).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(app.status)}`}>
                        {app.status}
                      </span>
                      <div className="mt-2 space-x-2">
                        <button
                          onClick={() => updateStatus(app.id, 'approve')}
                          className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateStatus(app.id, 'decline')}
                          className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => updateStatus(app.id, 'pending')}
                          className="text-xs bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                        >
                          Pending
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {editingId === app.id ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={editComment}
                            onChange={(e) => setEditComment(e.target.value)}
                            className="border rounded px-2 py-1 text-sm"
                          />
                          <button
                            onClick={() => updateComment(app.id)}
                            className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingId(null)
                              setEditComment('')
                            }}
                            className="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-900">{app.comment || '-'}</span>
                          <button
                            onClick={() => {
                              setEditingId(app.id)
                              setEditComment(app.comment)
                            }}
                            className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded hover:bg-gray-200"
                          >
                            Edit
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={app.certificate}
                          onChange={async () => {
                            try {
                              const { error } = await supabase
                                .from('camp_registrations')
                                .update({ certificate: !app.certificate })
                                .eq('id', app.id)
                              if (error) throw error
                              fetchApplications()
                            } catch (error) {
                              console.error('Error updating certificate status:', error)
                              alert('Error updating certificate status')
                            }
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          alert(`
Questions and Answers:
Q1: ${app.question1}
Q2: ${app.question2}
Q3: ${app.question3}
                          `)
                        }}
                        className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-200"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
} 