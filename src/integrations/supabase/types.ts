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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ai_outputs: {
        Row: {
          content: string
          created_at: string
          id: string
          inputs: Json | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          inputs?: Json | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          inputs?: Json | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      boilerplates: {
        Row: {
          body: string
          client: string
          created_at: string
          generated: boolean
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          client: string
          created_at?: string
          generated?: boolean
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          client?: string
          created_at?: string
          generated?: boolean
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      calendar_posts: {
        Row: {
          caption: string
          channel: string
          client: string | null
          created_at: string
          id: string
          post_date: string
          post_time: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          caption: string
          channel?: string
          client?: string | null
          created_at?: string
          id?: string
          post_date?: string
          post_time?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          caption?: string
          channel?: string
          client?: string | null
          created_at?: string
          id?: string
          post_date?: string
          post_time?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          author: string | null
          body: string
          channel: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          author?: string | null
          body: string
          channel?: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          author?: string | null
          body?: string
          channel?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          contact_email: string | null
          created_at: string
          id: string
          industry: string | null
          name: string
          notes: string | null
          status: string
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          contact_email?: string | null
          created_at?: string
          id?: string
          industry?: string | null
          name: string
          notes?: string | null
          status?: string
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          contact_email?: string | null
          created_at?: string
          id?: string
          industry?: string | null
          name?: string
          notes?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      competitor_notes: {
        Row: {
          competitor: string
          created_at: string
          id: string
          note: string | null
          note_date: string | null
          source: string | null
          updated_at: string
          urgency: string
          user_id: string
        }
        Insert: {
          competitor: string
          created_at?: string
          id?: string
          note?: string | null
          note_date?: string | null
          source?: string | null
          updated_at?: string
          urgency?: string
          user_id: string
        }
        Update: {
          competitor?: string
          created_at?: string
          id?: string
          note?: string | null
          note_date?: string | null
          source?: string | null
          updated_at?: string
          urgency?: string
          user_id?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          beat: string | null
          created_at: string
          email: string | null
          id: string
          last_pitch: string | null
          name: string
          notes: string | null
          outlet: string | null
          relationship: string | null
          response: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          beat?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_pitch?: string | null
          name: string
          notes?: string | null
          outlet?: string | null
          relationship?: string | null
          response?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          beat?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_pitch?: string | null
          name?: string
          notes?: string | null
          outlet?: string | null
          relationship?: string | null
          response?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      coverage: {
        Row: {
          client: string | null
          client_id: string | null
          created_at: string
          date: string | null
          id: string
          outlet: string
          reach: string | null
          sentiment: string | null
          title: string
          type: string | null
          updated_at: string
          url: string | null
          user_id: string
        }
        Insert: {
          client?: string | null
          client_id?: string | null
          created_at?: string
          date?: string | null
          id?: string
          outlet: string
          reach?: string | null
          sentiment?: string | null
          title: string
          type?: string | null
          updated_at?: string
          url?: string | null
          user_id: string
        }
        Update: {
          client?: string | null
          client_id?: string | null
          created_at?: string
          date?: string | null
          id?: string
          outlet?: string
          reach?: string | null
          sentiment?: string | null
          title?: string
          type?: string | null
          updated_at?: string
          url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      deck_templates: {
        Row: {
          created_at: string
          fonts: Json
          id: string
          layout_definitions: Json
          name: string
          source_filename: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          fonts?: Json
          id?: string
          layout_definitions?: Json
          name: string
          source_filename?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          fonts?: Json
          id?: string
          layout_definitions?: Json
          name?: string
          source_filename?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      decks: {
        Row: {
          business_name: string | null
          created_at: string
          document_version: number
          generation_config: Json
          id: string
          slides: Json | null
          source_files: Json
          theme: string | null
          title: string
          tone: string | null
          topic: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          business_name?: string | null
          created_at?: string
          document_version?: number
          generation_config?: Json
          id?: string
          slides?: Json | null
          source_files?: Json
          theme?: string | null
          title: string
          tone?: string | null
          topic?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          business_name?: string | null
          created_at?: string
          document_version?: number
          generation_config?: Json
          id?: string
          slides?: Json | null
          source_files?: Json
          theme?: string | null
          title?: string
          tone?: string | null
          topic?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      kanban_cards: {
        Row: {
          client: string | null
          column_name: string
          contact: string | null
          created_at: string
          due_date: string | null
          id: string
          owner: string | null
          position: number | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          client?: string | null
          column_name?: string
          contact?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          owner?: string | null
          position?: number | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          client?: string | null
          column_name?: string
          contact?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          owner?: string | null
          position?: number | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          client_id: string | null
          contact: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          score: number | null
          source: string | null
          status: string
          updated_at: string
          user_id: string
          value: string | null
        }
        Insert: {
          client_id?: string | null
          contact?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          score?: number | null
          source?: string | null
          status?: string
          updated_at?: string
          user_id: string
          value?: string | null
        }
        Update: {
          client_id?: string | null
          contact?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          score?: number | null
          source?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          value?: string | null
        }
        Relationships: []
      }
      live_meetings: {
        Row: {
          ended_at: string | null
          host_id: string
          host_name: string | null
          id: string
          last_seen_at: string
          room_name: string
          started_at: string
          status: string
          title: string
        }
        Insert: {
          ended_at?: string | null
          host_id: string
          host_name?: string | null
          id?: string
          last_seen_at?: string
          room_name: string
          started_at?: string
          status?: string
          title?: string
        }
        Update: {
          ended_at?: string | null
          host_id?: string
          host_name?: string | null
          id?: string
          last_seen_at?: string
          room_name?: string
          started_at?: string
          status?: string
          title?: string
        }
        Relationships: []
      }
      mcp_connections: {
        Row: {
          auth_type: string
          config: Json
          created_at: string
          credential_hint: string | null
          id: string
          label: string | null
          status: string
          toolkit_name: string
          toolkit_slug: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auth_type: string
          config?: Json
          created_at?: string
          credential_hint?: string | null
          id?: string
          label?: string | null
          status?: string
          toolkit_name: string
          toolkit_slug: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auth_type?: string
          config?: Json
          created_at?: string
          credential_hint?: string | null
          id?: string
          label?: string | null
          status?: string
          toolkit_name?: string
          toolkit_slug?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      meeting_notes: {
        Row: {
          actions: Json
          attendees: string | null
          client: string | null
          created_at: string
          id: string
          meeting_date: string | null
          notes: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          actions?: Json
          attendees?: string | null
          client?: string | null
          created_at?: string
          id?: string
          meeting_date?: string | null
          notes?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          actions?: Json
          attendees?: string | null
          client?: string | null
          created_at?: string
          id?: string
          meeting_date?: string | null
          notes?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      meeting_participants: {
        Row: {
          display_name: string | null
          id: string
          joined_at: string
          last_seen_at: string
          left_at: string | null
          meeting_id: string
          user_id: string
        }
        Insert: {
          display_name?: string | null
          id?: string
          joined_at?: string
          last_seen_at?: string
          left_at?: string | null
          meeting_id: string
          user_id: string
        }
        Update: {
          display_name?: string | null
          id?: string
          joined_at?: string
          last_seen_at?: string
          left_at?: string | null
          meeting_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_participants_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "live_meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          msg: string | null
          priority: string | null
          read: boolean | null
          time: string | null
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          msg?: string | null
          priority?: string | null
          read?: boolean | null
          time?: string | null
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          msg?: string | null
          priority?: string | null
          read?: boolean | null
          time?: string | null
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          body: string | null
          client: string | null
          created_at: string
          id: string
          period: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body?: string | null
          client?: string | null
          created_at?: string
          id?: string
          period?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string | null
          client?: string | null
          created_at?: string
          id?: string
          period?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      roi_scenarios: {
        Row: {
          ad_value: number
          client: string | null
          created_at: string
          id: string
          months: number
          name: string
          retainer: number
          roi: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ad_value?: number
          client?: string | null
          created_at?: string
          id?: string
          months?: number
          name: string
          retainer?: number
          roi?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ad_value?: number
          client?: string | null
          created_at?: string
          id?: string
          months?: number
          name?: string
          retainer?: number
          roi?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      expire_stale_meetings: { Args: never; Returns: undefined }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
