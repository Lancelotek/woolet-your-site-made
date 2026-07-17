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
      ad_spend_snapshots: {
        Row: {
          clicks: number
          created_at: string
          id: string
          impressions: number
          platform: string
          snapshot_date: string
          spend: number
        }
        Insert: {
          clicks?: number
          created_at?: string
          id?: string
          impressions?: number
          platform: string
          snapshot_date: string
          spend?: number
        }
        Update: {
          clicks?: number
          created_at?: string
          id?: string
          impressions?: number
          platform?: string
          snapshot_date?: string
          spend?: number
        }
        Relationships: []
      }
      bespoke_ai_previews: {
        Row: {
          created_at: string
          description: string | null
          finish: string | null
          front_color: string | null
          id: string
          image_url: string
          selection_key: string
          shape: string | null
          temple_color: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          finish?: string | null
          front_color?: string | null
          id?: string
          image_url: string
          selection_key: string
          shape?: string | null
          temple_color?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          finish?: string | null
          front_color?: string | null
          id?: string
          image_url?: string
          selection_key?: string
          shape?: string | null
          temple_color?: string | null
          user_id?: string
        }
        Relationships: []
      }
      bespoke_configs: {
        Row: {
          config: Json
          created_at: string
          id: string
          is_current: boolean
          name: string | null
          pricing_total_eur: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          config: Json
          created_at?: string
          id?: string
          is_current?: boolean
          name?: string | null
          pricing_total_eur?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          config?: Json
          created_at?: string
          id?: string
          is_current?: boolean
          name?: string | null
          pricing_total_eur?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      bespoke_orders: {
        Row: {
          ai_bridge_width_mm: number | null
          ai_face_width_mm: number | null
          ai_notes: string | null
          ai_pd_mm: number | null
          ai_preview_url: string | null
          ai_temple_to_temple_mm: number | null
          amount_cents: number | null
          created_at: string
          currency: string | null
          customer_email: string
          customer_name: string | null
          engraving_text: string | null
          environment: string
          finish_id: string | null
          frame_id: string | null
          frame_name: string | null
          front_code: string | null
          id: string
          lens_type: string | null
          manual_bridge_width_mm: number | null
          manual_ear_to_ear_mm: number | null
          manual_face_width_mm: number | null
          manual_head_circumference_mm: number | null
          manual_notes: string | null
          manual_pd_mm: number | null
          manual_temple_length_mm: number | null
          manual_temple_to_temple_mm: number | null
          measurements_submitted_at: string | null
          metadata: Json | null
          stripe_payment_intent_id: string | null
          stripe_session_id: string
          temple_code: string | null
          updated_at: string
        }
        Insert: {
          ai_bridge_width_mm?: number | null
          ai_face_width_mm?: number | null
          ai_notes?: string | null
          ai_pd_mm?: number | null
          ai_preview_url?: string | null
          ai_temple_to_temple_mm?: number | null
          amount_cents?: number | null
          created_at?: string
          currency?: string | null
          customer_email: string
          customer_name?: string | null
          engraving_text?: string | null
          environment?: string
          finish_id?: string | null
          frame_id?: string | null
          frame_name?: string | null
          front_code?: string | null
          id?: string
          lens_type?: string | null
          manual_bridge_width_mm?: number | null
          manual_ear_to_ear_mm?: number | null
          manual_face_width_mm?: number | null
          manual_head_circumference_mm?: number | null
          manual_notes?: string | null
          manual_pd_mm?: number | null
          manual_temple_length_mm?: number | null
          manual_temple_to_temple_mm?: number | null
          measurements_submitted_at?: string | null
          metadata?: Json | null
          stripe_payment_intent_id?: string | null
          stripe_session_id: string
          temple_code?: string | null
          updated_at?: string
        }
        Update: {
          ai_bridge_width_mm?: number | null
          ai_face_width_mm?: number | null
          ai_notes?: string | null
          ai_pd_mm?: number | null
          ai_preview_url?: string | null
          ai_temple_to_temple_mm?: number | null
          amount_cents?: number | null
          created_at?: string
          currency?: string | null
          customer_email?: string
          customer_name?: string | null
          engraving_text?: string | null
          environment?: string
          finish_id?: string | null
          frame_id?: string | null
          frame_name?: string | null
          front_code?: string | null
          id?: string
          lens_type?: string | null
          manual_bridge_width_mm?: number | null
          manual_ear_to_ear_mm?: number | null
          manual_face_width_mm?: number | null
          manual_head_circumference_mm?: number | null
          manual_notes?: string | null
          manual_pd_mm?: number | null
          manual_temple_length_mm?: number | null
          manual_temple_to_temple_mm?: number | null
          measurements_submitted_at?: string | null
          metadata?: Json | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string
          temple_code?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      bespoke_scan_profiles: {
        Row: {
          asymmetry_mm: number | null
          capture_method: string
          confidence: Json
          created_at: string
          email: string | null
          face_width_mm: number | null
          id: string
          nose_bridge_height_mm: number | null
          nose_bridge_width_mm: number | null
          pantoscopic_angle_deg: number | null
          pd_mm: number | null
          raw_frames: Json
          status: string
          temple_length_left_mm: number | null
          temple_length_right_mm: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          asymmetry_mm?: number | null
          capture_method?: string
          confidence?: Json
          created_at?: string
          email?: string | null
          face_width_mm?: number | null
          id?: string
          nose_bridge_height_mm?: number | null
          nose_bridge_width_mm?: number | null
          pantoscopic_angle_deg?: number | null
          pd_mm?: number | null
          raw_frames?: Json
          status?: string
          temple_length_left_mm?: number | null
          temple_length_right_mm?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          asymmetry_mm?: number | null
          capture_method?: string
          confidence?: Json
          created_at?: string
          email?: string | null
          face_width_mm?: number | null
          id?: string
          nose_bridge_height_mm?: number | null
          nose_bridge_width_mm?: number | null
          pantoscopic_angle_deg?: number | null
          pd_mm?: number | null
          raw_frames?: Json
          status?: string
          temple_length_left_mm?: number | null
          temple_length_right_mm?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      founding_members: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          email: string
          environment: string
          id: string
          metadata: Json | null
          recommended_sku: string | null
          stripe_payment_intent_id: string | null
          stripe_session_id: string
          user_id: string | null
        }
        Insert: {
          amount_cents?: number
          created_at?: string
          currency?: string
          email: string
          environment?: string
          id?: string
          metadata?: Json | null
          recommended_sku?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id: string
          user_id?: string | null
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          email?: string
          environment?: string
          id?: string
          metadata?: Json | null
          recommended_sku?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      ga4_channel_snapshots: {
        Row: {
          channel: string
          conversions: number
          created_at: string
          id: string
          sessions: number
          snapshot_date: string
          updated_at: string
        }
        Insert: {
          channel: string
          conversions?: number
          created_at?: string
          id?: string
          sessions?: number
          snapshot_date: string
          updated_at?: string
        }
        Update: {
          channel?: string
          conversions?: number
          created_at?: string
          id?: string
          sessions?: number
          snapshot_date?: string
          updated_at?: string
        }
        Relationships: []
      }
      ga4_lp_snapshots: {
        Row: {
          conversions: number
          created_at: string
          id: string
          landing_page: string
          sessions: number
          snapshot_date: string
        }
        Insert: {
          conversions?: number
          created_at?: string
          id?: string
          landing_page: string
          sessions?: number
          snapshot_date: string
        }
        Update: {
          conversions?: number
          created_at?: string
          id?: string
          landing_page?: string
          sessions?: number
          snapshot_date?: string
        }
        Relationships: []
      }
      gsc_snapshots: {
        Row: {
          clicks: number
          created_at: string
          ctr: number
          id: string
          impressions: number
          page_path: string
          position: number
          query: string
          snapshot_date: string
          threshold_ctr: number | null
          threshold_met: boolean | null
        }
        Insert: {
          clicks?: number
          created_at?: string
          ctr?: number
          id?: string
          impressions?: number
          page_path: string
          position?: number
          query: string
          snapshot_date: string
          threshold_ctr?: number | null
          threshold_met?: boolean | null
        }
        Update: {
          clicks?: number
          created_at?: string
          ctr?: number
          id?: string
          impressions?: number
          page_path?: string
          position?: number
          query?: string
          snapshot_date?: string
          threshold_ctr?: number | null
          threshold_met?: boolean | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          locale: string | null
          marketing_opt_in: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          locale?: string | null
          marketing_opt_in?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          locale?: string | null
          marketing_opt_in?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      reservation_leads: {
        Row: {
          created_at: string
          email: string
          id: string
          locale: string | null
          notes: string | null
          phone: string | null
          product: string
          referrer: string | null
          user_agent: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          locale?: string | null
          notes?: string | null
          phone?: string | null
          product: string
          referrer?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          locale?: string | null
          notes?: string | null
          phone?: string | null
          product?: string
          referrer?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      scan_sessions: {
        Row: {
          access_token: string | null
          confidence: string | null
          created_at: string
          email: string
          face_width_mm: number | null
          id: string
          nose_width_mm: number | null
          recommendation_type: string | null
          status: string
          updated_at: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          access_token?: string | null
          confidence?: string | null
          created_at?: string
          email: string
          face_width_mm?: number | null
          id?: string
          nose_width_mm?: number | null
          recommendation_type?: string | null
          status?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          access_token?: string | null
          confidence?: string | null
          created_at?: string
          email?: string
          face_width_mm?: number | null
          id?: string
          nose_width_mm?: number | null
          recommendation_type?: string | null
          status?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      server_event_log: {
        Row: {
          client_ip: string | null
          created_at: string
          custom_data: Json | null
          destinations: Json | null
          email_hash: string | null
          error: string | null
          event_id: string | null
          event_name: string
          event_source_url: string | null
          external_id_hash: string | null
          fbc: string | null
          fbp: string | null
          id: string
          phone_hash: string | null
          rdt_uuid: string | null
          request_summary: Json | null
          source: string
          status: string | null
          ttclid: string | null
          user_agent: string | null
          user_data_hashed: Json | null
        }
        Insert: {
          client_ip?: string | null
          created_at?: string
          custom_data?: Json | null
          destinations?: Json | null
          email_hash?: string | null
          error?: string | null
          event_id?: string | null
          event_name: string
          event_source_url?: string | null
          external_id_hash?: string | null
          fbc?: string | null
          fbp?: string | null
          id?: string
          phone_hash?: string | null
          rdt_uuid?: string | null
          request_summary?: Json | null
          source: string
          status?: string | null
          ttclid?: string | null
          user_agent?: string | null
          user_data_hashed?: Json | null
        }
        Update: {
          client_ip?: string | null
          created_at?: string
          custom_data?: Json | null
          destinations?: Json | null
          email_hash?: string | null
          error?: string | null
          event_id?: string | null
          event_name?: string
          event_source_url?: string | null
          external_id_hash?: string | null
          fbc?: string | null
          fbp?: string | null
          id?: string
          phone_hash?: string | null
          rdt_uuid?: string | null
          request_summary?: Json | null
          source?: string
          status?: string | null
          ttclid?: string | null
          user_agent?: string | null
          user_data_hashed?: Json | null
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      waitlist_attribution: {
        Row: {
          created_at: string
          email: string
          event_source_url: string | null
          extra: Json | null
          fbc: string | null
          fbp: string | null
          ip_address: string | null
          meta_event_id: string | null
          rdt_uuid: string | null
          ttclid: string | null
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          email: string
          event_source_url?: string | null
          extra?: Json | null
          fbc?: string | null
          fbp?: string | null
          ip_address?: string | null
          meta_event_id?: string | null
          rdt_uuid?: string | null
          ttclid?: string | null
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          event_source_url?: string | null
          extra?: Json | null
          fbc?: string | null
          fbp?: string | null
          ip_address?: string | null
          meta_event_id?: string | null
          rdt_uuid?: string | null
          ttclid?: string | null
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      email_queue_dispatch: { Args: never; Returns: undefined }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      founding_members_count: { Args: { check_env?: string }; Returns: number }
      link_user_data_by_email: { Args: never; Returns: Json }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
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
