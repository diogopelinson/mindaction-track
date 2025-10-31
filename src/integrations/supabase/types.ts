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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          badge_type: string
          created_at: string | null
          earned_at: string | null
          id: string
          milestone_value: number | null
          user_id: string
        }
        Insert: {
          badge_type: string
          created_at?: string | null
          earned_at?: string | null
          id?: string
          milestone_value?: number | null
          user_id: string
        }
        Update: {
          badge_type?: string
          created_at?: string | null
          earned_at?: string | null
          id?: string
          milestone_value?: number | null
          user_id?: string
        }
        Relationships: []
      }
      admin_notes: {
        Row: {
          admin_id: string
          created_at: string | null
          id: string
          is_private: boolean | null
          mentee_id: string
          note: string
        }
        Insert: {
          admin_id: string
          created_at?: string | null
          id?: string
          is_private?: boolean | null
          mentee_id: string
          note: string
        }
        Update: {
          admin_id?: string
          created_at?: string | null
          id?: string
          is_private?: boolean | null
          mentee_id?: string
          note?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_notes_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_notes_mentee_id_fkey"
            columns: ["mentee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_requests: {
        Row: {
          cpf: string
          created_at: string | null
          email: string
          full_name: string
          id: string
          phone: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cpf: string
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          phone: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cpf?: string
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          phone?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ai_chat_history: {
        Row: {
          content: string
          created_at: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          resource_id: string | null
          resource_type: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type?: string
          user_id?: string
        }
        Relationships: []
      }
      generated_reports: {
        Row: {
          created_at: string | null
          file_url: string | null
          id: string
          period_end: string | null
          period_start: string | null
          report_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          file_url?: string | null
          id?: string
          period_end?: string | null
          period_start?: string | null
          report_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          file_url?: string | null
          id?: string
          period_end?: string | null
          period_start?: string | null
          report_type?: string
          user_id?: string
        }
        Relationships: []
      }
      intermediate_goals: {
        Row: {
          achieved: boolean | null
          achieved_at: string | null
          created_at: string | null
          id: string
          target_date: string | null
          target_weight: number
          user_id: string
        }
        Insert: {
          achieved?: boolean | null
          achieved_at?: string | null
          created_at?: string | null
          id?: string
          target_date?: string | null
          target_weight: number
          user_id: string
        }
        Update: {
          achieved?: boolean | null
          achieved_at?: string | null
          created_at?: string | null
          id?: string
          target_date?: string | null
          target_weight?: number
          user_id?: string
        }
        Relationships: []
      }
      mentee_tags: {
        Row: {
          created_at: string | null
          id: string
          mentee_id: string
          tag_color: string | null
          tag_name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          mentee_id: string
          tag_color?: string | null
          tag_name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          mentee_id?: string
          tag_color?: string | null
          tag_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentee_tags_mentee_id_fkey"
            columns: ["mentee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          created_at: string | null
          from_id: string
          id: string
          message: string
          read: boolean | null
          subject: string
          to_id: string
        }
        Insert: {
          created_at?: string | null
          from_id: string
          id?: string
          message: string
          read?: boolean | null
          subject: string
          to_id: string
        }
        Update: {
          created_at?: string | null
          from_id?: string
          id?: string
          message?: string
          read?: boolean | null
          subject?: string
          to_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_from_id_fkey"
            columns: ["from_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_to_id_fkey"
            columns: ["to_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          age: number
          avatar_url: string | null
          cpf: string | null
          created_at: string
          email: string
          full_name: string
          goal_subtype: string | null
          goal_type: string | null
          height: number
          id: string
          initial_weight: number
          phone: string | null
          sex: Database["public"]["Enums"]["user_sex"]
          target_weight: number | null
          updated_at: string
        }
        Insert: {
          age: number
          avatar_url?: string | null
          cpf?: string | null
          created_at?: string
          email: string
          full_name: string
          goal_subtype?: string | null
          goal_type?: string | null
          height: number
          id: string
          initial_weight: number
          phone?: string | null
          sex: Database["public"]["Enums"]["user_sex"]
          target_weight?: number | null
          updated_at?: string
        }
        Update: {
          age?: number
          avatar_url?: string | null
          cpf?: string | null
          created_at?: string
          email?: string
          full_name?: string
          goal_subtype?: string | null
          goal_type?: string | null
          height?: number
          id?: string
          initial_weight?: number
          phone?: string | null
          sex?: Database["public"]["Enums"]["user_sex"]
          target_weight?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      user_goals: {
        Row: {
          created_at: string
          goal_type: Database["public"]["Enums"]["goal_type"]
          id: string
          start_date: string
          target_weight: number
          total_weeks: number
          updated_at: string
          user_id: string
          weekly_variation_percent: number
        }
        Insert: {
          created_at?: string
          goal_type: Database["public"]["Enums"]["goal_type"]
          id?: string
          start_date?: string
          target_weight: number
          total_weeks?: number
          updated_at?: string
          user_id: string
          weekly_variation_percent: number
        }
        Update: {
          created_at?: string
          goal_type?: Database["public"]["Enums"]["goal_type"]
          id?: string
          start_date?: string
          target_weight?: number
          total_weeks?: number
          updated_at?: string
          user_id?: string
          weekly_variation_percent?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string | null
          email_enabled: boolean | null
          notification_day: number | null
          notification_time: string | null
          push_enabled: boolean | null
          theme: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email_enabled?: boolean | null
          notification_day?: number | null
          notification_time?: string | null
          push_enabled?: boolean | null
          theme?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email_enabled?: boolean | null
          notification_day?: number | null
          notification_time?: string | null
          push_enabled?: boolean | null
          theme?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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
      weekly_updates: {
        Row: {
          body_fat_percentage: number | null
          created_at: string
          hip_circumference: number | null
          id: string
          neck_circumference: number | null
          notes: string | null
          photo_url: string | null
          updated_at: string
          user_id: string
          waist_circumference: number | null
          week_number: number
          weight: number
        }
        Insert: {
          body_fat_percentage?: number | null
          created_at?: string
          hip_circumference?: number | null
          id?: string
          neck_circumference?: number | null
          notes?: string | null
          photo_url?: string | null
          updated_at?: string
          user_id: string
          waist_circumference?: number | null
          week_number: number
          weight: number
        }
        Update: {
          body_fat_percentage?: number | null
          created_at?: string
          hip_circumference?: number | null
          id?: string
          neck_circumference?: number | null
          notes?: string | null
          photo_url?: string | null
          updated_at?: string
          user_id?: string
          waist_circumference?: number | null
          week_number?: number
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "weekly_updates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_body_fat_navy: {
        Args: {
          p_height: number
          p_hip?: number
          p_neck: number
          p_sex: Database["public"]["Enums"]["user_sex"]
          p_waist: number
        }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "mentee" | "admin"
      goal_type: "weight_loss" | "muscle_gain"
      user_role: "mentee" | "mentor"
      user_sex: "male" | "female"
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
      app_role: ["mentee", "admin"],
      goal_type: ["weight_loss", "muscle_gain"],
      user_role: ["mentee", "mentor"],
      user_sex: ["male", "female"],
    },
  },
} as const
