export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      // Add your Supabase tables here
      // Example:
      // users: {
      //   Row: {
      //     id: string
      //     email: string
      //     name: string | null
      //   }
      //   Insert: {
      //     id: string
      //     email: string
      //     name?: string | null
      //   }
      //   Update: {
      //     id?: string
      //     email?: string
      //     name?: string | null
      //   }
      // }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 