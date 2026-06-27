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
      arsip: {
        Row: {
          bucket_name: string | null
          created_at: string
          created_by: string | null
          deskripsi: string | null
          file_name: string | null
          file_size: number | null
          id: string
          jenis: string
          judul: string
          kategori: string
          lokasi_fisik: string | null
          mime_type: string | null
          nomor_surat: string
          pdf_url: string | null
          status: string
          storage_path: string | null
          storage_provider: string | null
          tahun: number
          updated_at: string
        }
        Insert: {
          bucket_name?: string | null
          created_at?: string
          created_by?: string | null
          deskripsi?: string | null
          file_name?: string | null
          file_size?: number | null
          id?: string
          jenis: string
          judul: string
          kategori: string
          lokasi_fisik?: string | null
          mime_type?: string | null
          nomor_surat: string
          pdf_url?: string | null
          status?: string
          storage_path?: string | null
          storage_provider?: string | null
          tahun: number
          updated_at?: string
        }
        Update: {
          bucket_name?: string | null
          created_at?: string
          created_by?: string | null
          deskripsi?: string | null
          file_name?: string | null
          file_size?: number | null
          id?: string
          jenis?: string
          judul?: string
          kategori?: string
          lokasi_fisik?: string | null
          mime_type?: string | null
          nomor_surat?: string
          pdf_url?: string | null
          status?: string
          storage_path?: string | null
          storage_provider?: string | null
          tahun?: number
          updated_at?: string
        }
        Relationships: []
      }
      backup: {
        Row: {
          created_at: string
          id: string
          name: string
          scope: string
          size: string
          status: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          scope?: string
          size?: string
          status?: string
          type?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          scope?: string
          size?: string
          status?: string
          type?: string
        }
        Relationships: []
      }
      kategori: {
        Row: {
          created_at: string
          deskripsi: string | null
          id: string
          jumlah_arsip: number
          kode: string
          nama: string
          status: string
        }
        Insert: {
          created_at?: string
          deskripsi?: string | null
          id?: string
          jumlah_arsip?: number
          kode: string
          nama: string
          status?: string
        }
        Update: {
          created_at?: string
          deskripsi?: string | null
          id?: string
          jumlah_arsip?: number
          kode?: string
          nama?: string
          status?: string
        }
        Relationships: []
      }
      log_aktivitas: {
        Row: {
          action: string
          at: string
          detail: string | null
          id: string
          source: string
          status: string
          target_id: string | null
          tool_name: string | null
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          action: string
          at?: string
          detail?: string | null
          id?: string
          source?: string
          status?: string
          target_id?: string | null
          tool_name?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          action?: string
          at?: string
          detail?: string | null
          id?: string
          source?: string
          status?: string
          target_id?: string | null
          tool_name?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: []
      }
      lokasi: {
        Row: {
          created_at: string
          deskripsi: string | null
          id: string
          jumlah_arsip: number
          kode: string
          nama: string
          rak: string | null
          ruangan: string | null
          status: string
        }
        Insert: {
          created_at?: string
          deskripsi?: string | null
          id?: string
          jumlah_arsip?: number
          kode: string
          nama: string
          rak?: string | null
          ruangan?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          deskripsi?: string | null
          id?: string
          jumlah_arsip?: number
          kode?: string
          nama?: string
          rak?: string | null
          ruangan?: string | null
          status?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          last_login: string | null
          name: string
          status: string
        }
        Insert: {
          created_at?: string
          email?: string
          id: string
          last_login?: string | null
          name?: string
          status?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          last_login?: string | null
          name?: string
          status?: string
        }
        Relationships: []
      }
      qr_code: {
        Row: {
          arsip_id: string | null
          created_at: string
          id: string
          nama_arsip: string | null
          nomor_surat: string | null
          public_link: string
          status: string
          total_scan: number
        }
        Insert: {
          arsip_id?: string | null
          created_at?: string
          id?: string
          nama_arsip?: string | null
          nomor_surat?: string | null
          public_link: string
          status?: string
          total_scan?: number
        }
        Update: {
          arsip_id?: string | null
          created_at?: string
          id?: string
          nama_arsip?: string | null
          nomor_surat?: string | null
          public_link?: string
          status?: string
          total_scan?: number
        }
        Relationships: [
          {
            foreignKeyName: "qr_code_arsip_id_fkey"
            columns: ["arsip_id"]
            isOneToOne: false
            referencedRelation: "arsip"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_security_settings: {
        Row: {
          failed_attempts: number
          last_failed_at: string | null
          security_code_hash: string
          updated_at: string
          user_id: string
        }
        Insert: {
          failed_attempts?: number
          last_failed_at?: string | null
          security_code_hash: string
          updated_at?: string
          user_id: string
        }
        Update: {
          failed_attempts?: number
          last_failed_at?: string | null
          security_code_hash?: string
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
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
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
      app_role: "admin" | "staff_tu" | "viewer"
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
      app_role: ["admin", "staff_tu", "viewer"],
    },
  },
} as const
