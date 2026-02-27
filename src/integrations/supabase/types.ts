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
      activity_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      ai_predictions: {
        Row: {
          asset_id: string
          confidence: number | null
          created_at: string
          id: string
          model_used: string | null
          prediction_type: string
          result: Json
        }
        Insert: {
          asset_id: string
          confidence?: number | null
          created_at?: string
          id?: string
          model_used?: string | null
          prediction_type: string
          result: Json
        }
        Update: {
          asset_id?: string
          confidence?: number | null
          created_at?: string
          id?: string
          model_used?: string | null
          prediction_type?: string
          result?: Json
        }
        Relationships: []
      }
      alerts_history: {
        Row: {
          acknowledged: boolean
          acknowledged_by: string | null
          asset_id: string
          created_at: string
          failure_type: string | null
          id: string
          message: string
          resolved: boolean
          resolved_at: string | null
          rul_hours: number | null
          severity: string
        }
        Insert: {
          acknowledged?: boolean
          acknowledged_by?: string | null
          asset_id: string
          created_at?: string
          failure_type?: string | null
          id?: string
          message: string
          resolved?: boolean
          resolved_at?: string | null
          rul_hours?: number | null
          severity: string
        }
        Update: {
          acknowledged?: boolean
          acknowledged_by?: string | null
          asset_id?: string
          created_at?: string
          failure_type?: string | null
          id?: string
          message?: string
          resolved?: boolean
          resolved_at?: string | null
          rul_hours?: number | null
          severity?: string
        }
        Relationships: []
      }
      assets: {
        Row: {
          asset_id: string
          asset_type: Database["public"]["Enums"]["asset_type"]
          capacity: number | null
          created_at: string | null
          id: string
          installation_date: string | null
          location: string | null
          name: string
          updated_at: string | null
        }
        Insert: {
          asset_id: string
          asset_type: Database["public"]["Enums"]["asset_type"]
          capacity?: number | null
          created_at?: string | null
          id?: string
          installation_date?: string | null
          location?: string | null
          name: string
          updated_at?: string | null
        }
        Update: {
          asset_id?: string
          asset_type?: Database["public"]["Enums"]["asset_type"]
          capacity?: number | null
          created_at?: string | null
          id?: string
          installation_date?: string | null
          location?: string | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      maintenance_tasks: {
        Row: {
          actual_cost: number | null
          actual_hours: number | null
          asset_id: string
          assigned_to: string | null
          completed_date: string | null
          cost_estimate: number | null
          created_at: string
          created_by: string | null
          description: string | null
          estimated_hours: number | null
          id: string
          notes: string | null
          priority: string
          scheduled_date: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          actual_cost?: number | null
          actual_hours?: number | null
          asset_id: string
          assigned_to?: string | null
          completed_date?: string | null
          cost_estimate?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          estimated_hours?: number | null
          id?: string
          notes?: string | null
          priority?: string
          scheduled_date?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          actual_cost?: number | null
          actual_hours?: number | null
          asset_id?: string
          assigned_to?: string | null
          completed_date?: string | null
          cost_estimate?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          estimated_hours?: number | null
          id?: string
          notes?: string | null
          priority?: string
          scheduled_date?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          id: string
          theme_preference: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          theme_preference?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          theme_preference?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          file_url: string | null
          generated_by: string | null
          id: string
          parameters: Json | null
          report_type: string
          status: string
          title: string
        }
        Insert: {
          created_at?: string
          file_url?: string | null
          generated_by?: string | null
          id?: string
          parameters?: Json | null
          report_type: string
          status?: string
          title: string
        }
        Update: {
          created_at?: string
          file_url?: string | null
          generated_by?: string | null
          id?: string
          parameters?: Json | null
          report_type?: string
          status?: string
          title?: string
        }
        Relationships: []
      }
      sensor_readings: {
        Row: {
          ambient_temp: number
          asset_id: string
          asset_type: string
          confidence: number
          created_at: string
          failure_type: string
          gearbox_temp: number | null
          humidity: number
          id: string
          irradiance: number | null
          module_temp: number | null
          panel_current: number | null
          panel_voltage: number | null
          power_output: number
          rotor_speed: number | null
          rul_hours: number
          timestamp: string
          wind_speed: number | null
        }
        Insert: {
          ambient_temp: number
          asset_id: string
          asset_type: string
          confidence?: number
          created_at?: string
          failure_type?: string
          gearbox_temp?: number | null
          humidity: number
          id?: string
          irradiance?: number | null
          module_temp?: number | null
          panel_current?: number | null
          panel_voltage?: number | null
          power_output: number
          rotor_speed?: number | null
          rul_hours?: number
          timestamp?: string
          wind_speed?: number | null
        }
        Update: {
          ambient_temp?: number
          asset_id?: string
          asset_type?: string
          confidence?: number
          created_at?: string
          failure_type?: string
          gearbox_temp?: number | null
          humidity?: number
          id?: string
          irradiance?: number | null
          module_temp?: number | null
          panel_current?: number | null
          panel_voltage?: number | null
          power_output?: number
          rotor_speed?: number | null
          rul_hours?: number
          timestamp?: string
          wind_speed?: number | null
        }
        Relationships: []
      }
      spare_parts: {
        Row: {
          category: string
          compatible_asset_type: string
          created_at: string
          id: string
          lead_time_days: number | null
          name: string
          part_number: string
          quantity_in_stock: number
          reorder_level: number
          supplier: string | null
          unit_cost: number
          updated_at: string
        }
        Insert: {
          category: string
          compatible_asset_type: string
          created_at?: string
          id?: string
          lead_time_days?: number | null
          name: string
          part_number: string
          quantity_in_stock?: number
          reorder_level?: number
          supplier?: string | null
          unit_cost?: number
          updated_at?: string
        }
        Update: {
          category?: string
          compatible_asset_type?: string
          created_at?: string
          id?: string
          lead_time_days?: number | null
          name?: string
          part_number?: string
          quantity_in_stock?: number
          reorder_level?: number
          supplier?: string | null
          unit_cost?: number
          updated_at?: string
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
      app_role: "admin" | "operator" | "technician"
      asset_type: "wind" | "solar"
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
      app_role: ["admin", "operator", "technician"],
      asset_type: ["wind", "solar"],
    },
  },
} as const
