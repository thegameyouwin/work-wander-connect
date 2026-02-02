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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      applications: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          paid_amount: number | null
          payment_plan: Database["public"]["Enums"]["payment_plan_type"] | null
          status: Database["public"]["Enums"]["application_status"]
          total_fee: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          paid_amount?: number | null
          payment_plan?: Database["public"]["Enums"]["payment_plan_type"] | null
          status?: Database["public"]["Enums"]["application_status"]
          total_fee?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          paid_amount?: number | null
          payment_plan?: Database["public"]["Enums"]["payment_plan_type"] | null
          status?: Database["public"]["Enums"]["application_status"]
          total_fee?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          admin_notes: string | null
          application_id: string
          document_type: string
          file_url: string | null
          id: string
          name: string
          reviewed_at: string | null
          status: Database["public"]["Enums"]["document_status"]
          uploaded_at: string
        }
        Insert: {
          admin_notes?: string | null
          application_id: string
          document_type: string
          file_url?: string | null
          id?: string
          name: string
          reviewed_at?: string | null
          status?: Database["public"]["Enums"]["document_status"]
          uploaded_at?: string
        }
        Update: {
          admin_notes?: string | null
          application_id?: string
          document_type?: string
          file_url?: string | null
          id?: string
          name?: string
          reviewed_at?: string | null
          status?: Database["public"]["Enums"]["document_status"]
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      job_applications: {
        Row: {
          applied_at: string
          cover_letter: string | null
          id: string
          job_id: string
          status: Database["public"]["Enums"]["job_application_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          applied_at?: string
          cover_letter?: string | null
          id?: string
          job_id: string
          status?: Database["public"]["Enums"]["job_application_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          applied_at?: string
          cover_letter?: string | null
          id?: string
          job_id?: string
          status?: Database["public"]["Enums"]["job_application_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          benefits: string[] | null
          category: string | null
          company: string
          created_at: string
          description: string | null
          id: string
          is_featured: boolean | null
          job_type: string | null
          location: string
          requirements: string[] | null
          salary_max: number | null
          salary_min: number | null
          title: string
          updated_at: string
          visa_sponsorship: boolean | null
        }
        Insert: {
          benefits?: string[] | null
          category?: string | null
          company: string
          created_at?: string
          description?: string | null
          id?: string
          is_featured?: boolean | null
          job_type?: string | null
          location: string
          requirements?: string[] | null
          salary_max?: number | null
          salary_min?: number | null
          title: string
          updated_at?: string
          visa_sponsorship?: boolean | null
        }
        Update: {
          benefits?: string[] | null
          category?: string | null
          company?: string
          created_at?: string
          description?: string | null
          id?: string
          is_featured?: boolean | null
          job_type?: string | null
          location?: string
          requirements?: string[] | null
          salary_max?: number | null
          salary_min?: number | null
          title?: string
          updated_at?: string
          visa_sponsorship?: boolean | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          link: string | null
          message: string
          read: boolean | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          link?: string | null
          message: string
          read?: boolean | null
          title: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          link?: string | null
          message?: string
          read?: boolean | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          application_id: string
          created_at: string
          id: string
          milestone_name: string | null
          paid_at: string | null
          payment_method: string | null
          status: Database["public"]["Enums"]["payment_status"]
          transaction_id: string | null
        }
        Insert: {
          amount: number
          application_id: string
          created_at?: string
          id?: string
          milestone_name?: string | null
          paid_at?: string | null
          payment_method?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          transaction_id?: string | null
        }
        Update: {
          amount?: number
          application_id?: string
          created_at?: string
          id?: string
          milestone_name?: string | null
          paid_at?: string | null
          payment_method?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          country_of_origin: string | null
          created_at: string
          desired_destination: string | null
          email: string
          full_name: string
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          country_of_origin?: string | null
          created_at?: string
          desired_destination?: string | null
          email: string
          full_name: string
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          country_of_origin?: string | null
          created_at?: string
          desired_destination?: string | null
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          created_at: string
          current_location: string
          id: string
          image_url: string | null
          is_featured: boolean | null
          name: string
          origin_country: string
          quote: string
          rating: number
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_location: string
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          name: string
          origin_country: string
          quote: string
          rating?: number
          role: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_location?: string
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          name?: string
          origin_country?: string
          quote?: string
          rating?: number
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      transportation: {
        Row: {
          application_id: string
          created_at: string
          flight_details: Json | null
          id: string
          milestone_payment_id: string | null
          notes: string | null
          status: Database["public"]["Enums"]["transportation_status"]
          ticket_booked: boolean | null
          updated_at: string
        }
        Insert: {
          application_id: string
          created_at?: string
          flight_details?: Json | null
          id?: string
          milestone_payment_id?: string | null
          notes?: string | null
          status?: Database["public"]["Enums"]["transportation_status"]
          ticket_booked?: boolean | null
          updated_at?: string
        }
        Update: {
          application_id?: string
          created_at?: string
          flight_details?: Json | null
          id?: string
          milestone_payment_id?: string | null
          notes?: string | null
          status?: Database["public"]["Enums"]["transportation_status"]
          ticket_booked?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transportation_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: true
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transportation_milestone_payment_id_fkey"
            columns: ["milestone_payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "applicant"
      application_status:
        | "submitted"
        | "under_review"
        | "pending_documents"
        | "approved"
        | "job_matched"
        | "visa_process"
        | "completed"
      document_status: "pending" | "approved" | "missing" | "rejected"
      job_application_status:
        | "applied"
        | "accepted"
        | "rejected"
        | "pending"
        | "interviewing"
      notification_type:
        | "application"
        | "document"
        | "payment"
        | "job"
        | "system"
      payment_plan_type: "milestone" | "full_upfront" | "deferred"
      payment_status: "pending" | "completed" | "failed" | "refunded"
      transportation_status: "pending" | "booked" | "completed" | "cancelled"
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
    Enums: {
      app_role: ["admin", "moderator", "applicant"],
      application_status: [
        "submitted",
        "under_review",
        "pending_documents",
        "approved",
        "job_matched",
        "visa_process",
        "completed",
      ],
      document_status: ["pending", "approved", "missing", "rejected"],
      job_application_status: [
        "applied",
        "accepted",
        "rejected",
        "pending",
        "interviewing",
      ],
      notification_type: [
        "application",
        "document",
        "payment",
        "job",
        "system",
      ],
      payment_plan_type: ["milestone", "full_upfront", "deferred"],
      payment_status: ["pending", "completed", "failed", "refunded"],
      transportation_status: ["pending", "booked", "completed", "cancelled"],
    },
  },
} as const
