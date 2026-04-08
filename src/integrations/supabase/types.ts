export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      file_hashes: {
        Row: {
          created_at: string
          file_name: string
          file_size: number
          id: string
          sha256: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size: number
          id?: string
          sha256: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size?: number
          id?: string
          sha256?: string
        }
        Relationships: []
      }
      job_files: {
        Row: {
          created_at: string
          error_message: string | null
          file_hash: string
          file_name: string
          id: string
          job_id: string
          leads_found: number | null
          processed_pages: number | null
          status: string
          total_pages: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          file_hash: string
          file_name: string
          id?: string
          job_id: string
          leads_found?: number | null
          processed_pages?: number | null
          status?: string
          total_pages?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          file_hash?: string
          file_name?: string
          id?: string
          job_id?: string
          leads_found?: number | null
          processed_pages?: number | null
          status?: string
          total_pages?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_files_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "processing_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          address: string
          address_key: string
          analysis_reason: string | null
          created_at: string
          has_history_data: boolean
          has_tax_data: boolean
          id: string
          last_recording_date: string | null
          list: string
          mailing_address_1: string | null
          mailing_address_2: string | null
          off_market_date: string | null
          owner_last_name: string | null
          sale_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          address: string
          address_key: string
          analysis_reason?: string | null
          created_at?: string
          has_history_data?: boolean
          has_tax_data?: boolean
          id?: string
          last_recording_date?: string | null
          list?: string
          mailing_address_1?: string | null
          mailing_address_2?: string | null
          off_market_date?: string | null
          owner_last_name?: string | null
          sale_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          address?: string
          address_key?: string
          analysis_reason?: string | null
          created_at?: string
          has_history_data?: boolean
          has_tax_data?: boolean
          id?: string
          last_recording_date?: string | null
          list?: string
          mailing_address_1?: string | null
          mailing_address_2?: string | null
          off_market_date?: string | null
          owner_last_name?: string | null
          sale_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      processing_jobs: {
        Row: {
          completed_files: number
          created_at: string
          failed_files: number
          id: string
          status: string
          total_files: number
          updated_at: string
        }
        Insert: {
          completed_files?: number
          created_at?: string
          failed_files?: number
          id?: string
          status?: string
          total_files?: number
          updated_at?: string
        }
        Update: {
          completed_files?: number
          created_at?: string
          failed_files?: number
          id?: string
          status?: string
          total_files?: number
          updated_at?: string
        }
        Relationships: []
      }
      processing_logs: {
        Row: {
          created_at: string
          error_message: string | null
          extracted_data: Json | null
          id: string
          job_file_id: string
          page_number: number
          source_address: string | null
          status: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          extracted_data?: Json | null
          id?: string
          job_file_id: string
          page_number: number
          source_address?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          extracted_data?: Json | null
          id?: string
          job_file_id?: string
          page_number?: number
          source_address?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "processing_logs_job_file_id_fkey"
            columns: ["job_file_id"]
            isOneToOne: false
            referencedRelation: "job_files"
            referencedColumns: ["id"]
          },
        ]
      }
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
