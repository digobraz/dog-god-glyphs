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
      affiliates: {
        Row: {
          code: string
          created_at: string
          is_root: boolean
          points: number
          referral_count: number
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          is_root?: boolean
          points?: number
          referral_count?: number
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          is_root?: boolean
          points?: number
          referral_count?: number
          user_id?: string
        }
        Relationships: []
      }
      ainubis_config: {
        Row: {
          id: number
          knowledge_addendum: string | null
          model: string | null
          paused: boolean
          paused_message: string | null
          tone_addendum: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: number
          knowledge_addendum?: string | null
          model?: string | null
          paused?: boolean
          paused_message?: string | null
          tone_addendum?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          id?: number
          knowledge_addendum?: string | null
          model?: string | null
          paused?: boolean
          paused_message?: string | null
          tone_addendum?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      ainubis_conversations: {
        Row: {
          contact_id: string | null
          created_at: string
          entry_page: string | null
          id: string
          lang: string | null
          last_message_at: string
          member_email: string | null
          msg_count: number
          pack_number: number | null
          session_token: string
          status: string
          summary: string | null
          takeover: boolean
          triage: Json | null
          user_agent: string | null
          visitor_id: string | null
        }
        Insert: {
          contact_id?: string | null
          created_at?: string
          entry_page?: string | null
          id?: string
          lang?: string | null
          last_message_at?: string
          member_email?: string | null
          msg_count?: number
          pack_number?: number | null
          session_token: string
          status?: string
          summary?: string | null
          takeover?: boolean
          triage?: Json | null
          user_agent?: string | null
          visitor_id?: string | null
        }
        Update: {
          contact_id?: string | null
          created_at?: string
          entry_page?: string | null
          id?: string
          lang?: string | null
          last_message_at?: string
          member_email?: string | null
          msg_count?: number
          pack_number?: number | null
          session_token?: string
          status?: string
          summary?: string | null
          takeover?: boolean
          triage?: Json | null
          user_agent?: string | null
          visitor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ainubis_conversations_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      ainubis_messages: {
        Row: {
          content: string | null
          conversation_id: string
          created_at: string
          id: string
          image_path: string | null
          meta: Json | null
          role: string
          seen_by_user: boolean
          tg_message_id: number | null
        }
        Insert: {
          content?: string | null
          conversation_id: string
          created_at?: string
          id?: string
          image_path?: string | null
          meta?: Json | null
          role: string
          seen_by_user?: boolean
          tg_message_id?: number | null
        }
        Update: {
          content?: string | null
          conversation_id?: string
          created_at?: string
          id?: string
          image_path?: string | null
          meta?: Json | null
          role?: string
          seen_by_user?: boolean
          tg_message_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ainubis_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ainubis_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      app_votes: {
        Row: {
          platform_pref: string | null
          user_id: string
          voted_at: string
        }
        Insert: {
          platform_pref?: string | null
          user_id: string
          voted_at?: string
        }
        Update: {
          platform_pref?: string | null
          user_id?: string
          voted_at?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          council_status: string | null
          created_at: string | null
          email: string
          id: string
          message: string | null
          name: string
          role: string
          triage: Json | null
          type: string | null
        }
        Insert: {
          council_status?: string | null
          created_at?: string | null
          email: string
          id?: string
          message?: string | null
          name: string
          role: string
          triage?: Json | null
          type?: string | null
        }
        Update: {
          council_status?: string | null
          created_at?: string | null
          email?: string
          id?: string
          message?: string | null
          name?: string
          role?: string
          triage?: Json | null
          type?: string | null
        }
        Relationships: []
      }
      devotion_events: {
        Row: {
          created_at: string
          dog_id: string | null
          id: number
          idem_key: string
          kind: string
          meta: Json | null
          points: number
          user_id: string
        }
        Insert: {
          created_at?: string
          dog_id?: string | null
          id?: never
          idem_key: string
          kind: string
          meta?: Json | null
          points?: number
          user_id: string
        }
        Update: {
          created_at?: string
          dog_id?: string | null
          id?: never
          idem_key?: string
          kind?: string
          meta?: Json | null
          points?: number
          user_id?: string
        }
        Relationships: []
      }
      dogs: {
        Row: {
          allergies: string | null
          amount: number | null
          bill_city: string | null
          bill_country: string | null
          bill_name: string | null
          bill_street: string | null
          bill_zip: string | null
          birth_year: number | null
          breed: string | null
          cloudinary_extras: string[] | null
          cloudinary_main_url: string | null
          conditions: string | null
          country: string | null
          created_at: string | null
          death_date: string | null
          diet: string | null
          dog_name: string | null
          email: string | null
          email_sent_at: string | null
          first_landing: string | null
          first_referrer: string | null
          grid_message: string | null
          health_status: string | null
          heroglyph_code: string | null
          heroglyph_png_url: string | null
          id: string
          invoice_issued_at: string | null
          invoice_lang: string | null
          invoice_number: string | null
          is_tester: boolean
          life_status: string
          medication: string | null
          owner_name: string | null
          pack_number: number | null
          patron_svg: string | null
          patron_svg2: string | null
          payment_status: string | null
          pdf_cert_url: string | null
          pdf_horizontal_url: string | null
          pdf_invoice_url: string | null
          pdf_vertical_url: string | null
          referred_by_code: string | null
          selections: Json | null
          share_card_url: string | null
          stripe_session_id: string | null
          user_id: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          weight_kg: number | null
        }
        Insert: {
          allergies?: string | null
          amount?: number | null
          bill_city?: string | null
          bill_country?: string | null
          bill_name?: string | null
          bill_street?: string | null
          bill_zip?: string | null
          birth_year?: number | null
          breed?: string | null
          cloudinary_extras?: string[] | null
          cloudinary_main_url?: string | null
          conditions?: string | null
          country?: string | null
          created_at?: string | null
          death_date?: string | null
          diet?: string | null
          dog_name?: string | null
          email?: string | null
          email_sent_at?: string | null
          first_landing?: string | null
          first_referrer?: string | null
          grid_message?: string | null
          health_status?: string | null
          heroglyph_code?: string | null
          heroglyph_png_url?: string | null
          id?: string
          invoice_issued_at?: string | null
          invoice_lang?: string | null
          invoice_number?: string | null
          is_tester?: boolean
          life_status?: string
          medication?: string | null
          owner_name?: string | null
          pack_number?: number | null
          patron_svg?: string | null
          patron_svg2?: string | null
          payment_status?: string | null
          pdf_cert_url?: string | null
          pdf_horizontal_url?: string | null
          pdf_invoice_url?: string | null
          pdf_vertical_url?: string | null
          referred_by_code?: string | null
          selections?: Json | null
          share_card_url?: string | null
          stripe_session_id?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          weight_kg?: number | null
        }
        Update: {
          allergies?: string | null
          amount?: number | null
          bill_city?: string | null
          bill_country?: string | null
          bill_name?: string | null
          bill_street?: string | null
          bill_zip?: string | null
          birth_year?: number | null
          breed?: string | null
          cloudinary_extras?: string[] | null
          cloudinary_main_url?: string | null
          conditions?: string | null
          country?: string | null
          created_at?: string | null
          death_date?: string | null
          diet?: string | null
          dog_name?: string | null
          email?: string | null
          email_sent_at?: string | null
          first_landing?: string | null
          first_referrer?: string | null
          grid_message?: string | null
          health_status?: string | null
          heroglyph_code?: string | null
          heroglyph_png_url?: string | null
          id?: string
          invoice_issued_at?: string | null
          invoice_lang?: string | null
          invoice_number?: string | null
          is_tester?: boolean
          life_status?: string
          medication?: string | null
          owner_name?: string | null
          pack_number?: number | null
          patron_svg?: string | null
          patron_svg2?: string | null
          payment_status?: string | null
          pdf_cert_url?: string | null
          pdf_horizontal_url?: string | null
          pdf_invoice_url?: string | null
          pdf_vertical_url?: string | null
          referred_by_code?: string | null
          selections?: Json | null
          share_card_url?: string | null
          stripe_session_id?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          weight_kg?: number | null
        }
        Relationships: []
      }
      feature_votes: {
        Row: {
          feature_key: string
          user_id: string
          voted_at: string
        }
        Insert: {
          feature_key: string
          user_id: string
          voted_at?: string
        }
        Update: {
          feature_key?: string
          user_id?: string
          voted_at?: string
        }
        Relationships: []
      }
      hero_badges_earned: {
        Row: {
          badge_id: string
          earned_at: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          user_id?: string
        }
        Relationships: []
      }
      invoice_counter: {
        Row: {
          id: number
          last_seq: number
        }
        Insert: {
          id: number
          last_seq?: number
        }
        Update: {
          id?: number
          last_seq?: number
        }
        Relationships: []
      }
      map_api_usage: {
        Row: {
          at: string
          endpoint: string
          id: number
          ok: boolean
          points: number
          provider: string
          user_id: string | null
        }
        Insert: {
          at?: string
          endpoint: string
          id?: number
          ok: boolean
          points: number
          provider: string
          user_id?: string | null
        }
        Update: {
          at?: string
          endpoint?: string
          id?: number
          ok?: boolean
          points?: number
          provider?: string
          user_id?: string | null
        }
        Relationships: []
      }
      map_route_cache: {
        Row: {
          cache_key: string
          created_at: string
          from_lat: number
          from_lng: number
          geometry: Json
          hit_count: number
          id: number
          last_hit_at: string
          length_m: number
          snapped: boolean
          to_lat: number
          to_lng: number
        }
        Insert: {
          cache_key: string
          created_at?: string
          from_lat: number
          from_lng: number
          geometry: Json
          hit_count?: number
          id?: number
          last_hit_at?: string
          length_m: number
          snapped: boolean
          to_lat: number
          to_lng: number
        }
        Update: {
          cache_key?: string
          created_at?: string
          from_lat?: number
          from_lng?: number
          geometry?: Json
          hit_count?: number
          id?: number
          last_hit_at?: string
          length_m?: number
          snapped?: boolean
          to_lat?: number
          to_lng?: number
        }
        Relationships: []
      }
      mm_edges: {
        Row: {
          kind: string | null
          net_id: string
          source: string
          target: string
        }
        Insert: {
          kind?: string | null
          net_id: string
          source: string
          target: string
        }
        Update: {
          kind?: string | null
          net_id?: string
          source?: string
          target?: string
        }
        Relationships: [
          {
            foreignKeyName: "mm_edges_net_id_fkey"
            columns: ["net_id"]
            isOneToOne: false
            referencedRelation: "mm_networks"
            referencedColumns: ["slug"]
          },
        ]
      }
      mm_networks: {
        Row: {
          created_at: string | null
          slug: string
          sort: number | null
          title: string
        }
        Insert: {
          created_at?: string | null
          slug: string
          sort?: number | null
          title: string
        }
        Update: {
          created_at?: string | null
          slug?: string
          sort?: number | null
          title?: string
        }
        Relationships: []
      }
      mm_nodes: {
        Row: {
          grp: string | null
          key: string
          label: string
          net_id: string
          note: string | null
          parent: string | null
          status: string | null
          url: string | null
          x: number | null
          y: number | null
        }
        Insert: {
          grp?: string | null
          key: string
          label?: string
          net_id: string
          note?: string | null
          parent?: string | null
          status?: string | null
          url?: string | null
          x?: number | null
          y?: number | null
        }
        Update: {
          grp?: string | null
          key?: string
          label?: string
          net_id?: string
          note?: string | null
          parent?: string | null
          status?: string | null
          url?: string | null
          x?: number | null
          y?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "mm_nodes_net_id_fkey"
            columns: ["net_id"]
            isOneToOne: false
            referencedRelation: "mm_networks"
            referencedColumns: ["slug"]
          },
        ]
      }
      ops_watchdog_log: {
        Row: {
          created_at: string
          id: number
          kind: string
          signature: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          kind: string
          signature?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          kind?: string
          signature?: string | null
        }
        Relationships: []
      }
      pack_blocks: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string
        }
        Relationships: []
      }
      pack_conv_members: {
        Row: {
          conv_id: string
          joined_at: string
          last_read_at: string
          user_id: string
        }
        Insert: {
          conv_id: string
          joined_at?: string
          last_read_at?: string
          user_id: string
        }
        Update: {
          conv_id?: string
          joined_at?: string
          last_read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pack_conv_members_conv_id_fkey"
            columns: ["conv_id"]
            isOneToOne: false
            referencedRelation: "pack_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      pack_conversations: {
        Row: {
          created_at: string
          created_by: string | null
          dm_key: string | null
          id: string
          kind: string
          tag_id: string | null
          tag_kind: string | null
          tag_label: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          dm_key?: string | null
          id?: string
          kind?: string
          tag_id?: string | null
          tag_kind?: string | null
          tag_label?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          dm_key?: string | null
          id?: string
          kind?: string
          tag_id?: string | null
          tag_kind?: string | null
          tag_label?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      pack_counter: {
        Row: {
          current: number
          id: boolean
        }
        Insert: {
          current: number
          id?: boolean
        }
        Update: {
          current?: number
          id?: boolean
        }
        Relationships: []
      }
      pack_members: {
        Row: {
          created_at: string
          dog_name: string
          email: string | null
          id: string
          pack_number: number
          stripe_session_id: string | null
        }
        Insert: {
          created_at?: string
          dog_name?: string
          email?: string | null
          id?: string
          pack_number?: never
          stripe_session_id?: string | null
        }
        Update: {
          created_at?: string
          dog_name?: string
          email?: string | null
          id?: string
          pack_number?: never
          stripe_session_id?: string | null
        }
        Relationships: []
      }
      pack_messages: {
        Row: {
          body: string
          conv_id: string
          created_at: string
          id: string
          sender_id: string
        }
        Insert: {
          body: string
          conv_id: string
          created_at?: string
          id?: string
          sender_id: string
        }
        Update: {
          body?: string
          conv_id?: string
          created_at?: string
          id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pack_messages_conv_id_fkey"
            columns: ["conv_id"]
            isOneToOne: false
            referencedRelation: "pack_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      pack_reports: {
        Row: {
          created_at: string
          handled_at: string | null
          id: string
          note: string | null
          reason: string
          reporter_id: string
          status: string
          target_kind: string
          target_ref: string
          target_user_id: string | null
        }
        Insert: {
          created_at?: string
          handled_at?: string | null
          id?: string
          note?: string | null
          reason: string
          reporter_id: string
          status?: string
          target_kind: string
          target_ref: string
          target_user_id?: string | null
        }
        Update: {
          created_at?: string
          handled_at?: string | null
          id?: string
          note?: string | null
          reason?: string
          reporter_id?: string
          status?: string
          target_kind?: string
          target_ref?: string
          target_user_id?: string | null
        }
        Relationships: []
      }
      pack_trips: {
        Row: {
          ascent: number | null
          author_id: string | null
          country: string | null
          created_at: string
          id: string
          km: number | null
          payload: Json
          reviewed_at: string | null
          slug: string
          status: string
        }
        Insert: {
          ascent?: number | null
          author_id?: string | null
          country?: string | null
          created_at?: string
          id?: string
          km?: number | null
          payload: Json
          reviewed_at?: string | null
          slug: string
          status?: string
        }
        Update: {
          ascent?: number | null
          author_id?: string | null
          country?: string | null
          created_at?: string
          id?: string
          km?: number | null
          payload?: Json
          reviewed_at?: string | null
          slug?: string
          status?: string
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          bucket: string
          count: number
          window_start: string
        }
        Insert: {
          bucket: string
          count?: number
          window_start?: string
        }
        Update: {
          bucket?: string
          count?: number
          window_start?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          created_at: string
          id: string
          level: number
          points: number
          referred_dog_id: string
          referred_email: string | null
          referrer_user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          level?: number
          points?: number
          referred_dog_id: string
          referred_email?: string | null
          referrer_user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          level?: number
          points?: number
          referred_dog_id?: string
          referred_email?: string | null
          referrer_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_dog_id_fkey"
            columns: ["referred_dog_id"]
            isOneToOne: false
            referencedRelation: "dogs"
            referencedColumns: ["id"]
          },
        ]
      }
      social_account_stats: {
        Row: {
          account_id: string
          created_at: string
          followers: number | null
          id: string
          posts_count: number | null
          raw: Json | null
          reach: number | null
          snapshot_date: string
          views: number | null
        }
        Insert: {
          account_id: string
          created_at?: string
          followers?: number | null
          id?: string
          posts_count?: number | null
          raw?: Json | null
          reach?: number | null
          snapshot_date?: string
          views?: number | null
        }
        Update: {
          account_id?: string
          created_at?: string
          followers?: number | null
          id?: string
          posts_count?: number | null
          raw?: Json | null
          reach?: number | null
          snapshot_date?: string
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "social_account_stats_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "social_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      social_accounts: {
        Row: {
          active: boolean
          capabilities: Json
          created_at: string
          display_name: string | null
          external_id: string
          handle: string
          id: string
          market: string
          notes: string | null
          platform: string
          token_secret_key: string | null
        }
        Insert: {
          active?: boolean
          capabilities?: Json
          created_at?: string
          display_name?: string | null
          external_id: string
          handle: string
          id?: string
          market?: string
          notes?: string | null
          platform: string
          token_secret_key?: string | null
        }
        Update: {
          active?: boolean
          capabilities?: Json
          created_at?: string
          display_name?: string | null
          external_id?: string
          handle?: string
          id?: string
          market?: string
          notes?: string | null
          platform?: string
          token_secret_key?: string | null
        }
        Relationships: []
      }
      social_media_post_stats: {
        Row: {
          comments: number | null
          created_at: string
          id: string
          impressions: number | null
          interactions: number | null
          likes: number | null
          post_id: string
          raw: Json | null
          reach: number | null
          saves: number | null
          shares: number | null
          snapshot_date: string
          views: number | null
        }
        Insert: {
          comments?: number | null
          created_at?: string
          id?: string
          impressions?: number | null
          interactions?: number | null
          likes?: number | null
          post_id: string
          raw?: Json | null
          reach?: number | null
          saves?: number | null
          shares?: number | null
          snapshot_date?: string
          views?: number | null
        }
        Update: {
          comments?: number | null
          created_at?: string
          id?: string
          impressions?: number | null
          interactions?: number | null
          likes?: number | null
          post_id?: string
          raw?: Json | null
          reach?: number | null
          saves?: number | null
          shares?: number | null
          snapshot_date?: string
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "social_media_post_stats_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "social_media_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      social_media_posts: {
        Row: {
          account_id: string
          caption: string | null
          first_seen_at: string
          id: string
          media_type: string | null
          permalink: string | null
          platform_post_id: string
          published_at: string | null
          target_id: string | null
          thumbnail_url: string | null
          updated_at: string
        }
        Insert: {
          account_id: string
          caption?: string | null
          first_seen_at?: string
          id?: string
          media_type?: string | null
          permalink?: string | null
          platform_post_id: string
          published_at?: string | null
          target_id?: string | null
          thumbnail_url?: string | null
          updated_at?: string
        }
        Update: {
          account_id?: string
          caption?: string | null
          first_seen_at?: string
          id?: string
          media_type?: string | null
          permalink?: string | null
          platform_post_id?: string
          published_at?: string | null
          target_id?: string | null
          thumbnail_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_media_posts_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "social_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_media_posts_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "social_targets"
            referencedColumns: ["id"]
          },
        ]
      }
      social_post_variants: {
        Row: {
          body: string
          created_at: string
          extra: Json
          id: string
          lang: string | null
          market: string
          media_type: string
          media_url: string | null
          post_id: string
        }
        Insert: {
          body?: string
          created_at?: string
          extra?: Json
          id?: string
          lang?: string | null
          market: string
          media_type?: string
          media_url?: string | null
          post_id: string
        }
        Update: {
          body?: string
          created_at?: string
          extra?: Json
          id?: string
          lang?: string | null
          market?: string
          media_type?: string
          media_url?: string | null
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_post_variants_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "social_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      social_posts: {
        Row: {
          created_at: string
          id: string
          scheduled_for: string | null
          status: string
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          scheduled_for?: string | null
          status?: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          scheduled_for?: string | null
          status?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      social_target_stats: {
        Row: {
          comments: number | null
          created_at: string
          id: string
          impressions: number | null
          interactions: number | null
          likes: number | null
          raw: Json | null
          reach: number | null
          saves: number | null
          shares: number | null
          snapshot_date: string
          target_id: string
          views: number | null
        }
        Insert: {
          comments?: number | null
          created_at?: string
          id?: string
          impressions?: number | null
          interactions?: number | null
          likes?: number | null
          raw?: Json | null
          reach?: number | null
          saves?: number | null
          shares?: number | null
          snapshot_date?: string
          target_id: string
          views?: number | null
        }
        Update: {
          comments?: number | null
          created_at?: string
          id?: string
          impressions?: number | null
          interactions?: number | null
          likes?: number | null
          raw?: Json | null
          reach?: number | null
          saves?: number | null
          shares?: number | null
          snapshot_date?: string
          target_id?: string
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "social_target_stats_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "social_targets"
            referencedColumns: ["id"]
          },
        ]
      }
      social_targets: {
        Row: {
          account_id: string
          attempts: number
          created_at: string
          error: string | null
          id: string
          permalink: string | null
          platform_post_id: string | null
          published_at: string | null
          status: string
          upload_ref: string | null
          variant_id: string
        }
        Insert: {
          account_id: string
          attempts?: number
          created_at?: string
          error?: string | null
          id?: string
          permalink?: string | null
          platform_post_id?: string | null
          published_at?: string | null
          status?: string
          upload_ref?: string | null
          variant_id: string
        }
        Update: {
          account_id?: string
          attempts?: number
          created_at?: string
          error?: string | null
          id?: string
          permalink?: string | null
          platform_post_id?: string | null
          published_at?: string | null
          status?: string
          upload_ref?: string | null
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_targets_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "social_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_targets_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "social_post_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_events: {
        Row: {
          created_at: string
          event_id: string
          locked_at: string
          status: string
        }
        Insert: {
          created_at?: string
          event_id: string
          locked_at?: string
          status?: string
        }
        Update: {
          created_at?: string
          event_id?: string
          locked_at?: string
          status?: string
        }
        Relationships: []
      }
      trail_places: {
        Row: {
          created_at: string
          description: string | null
          id: string
          lat: number
          lng: number
          name: string
          place_type: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          lat: number
          lng: number
          name: string
          place_type?: string | null
          status?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          lat?: number
          lng?: number
          name?: string
          place_type?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      trail_ratings: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          stars: number
          trail_id: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          stars: number
          trail_id: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          stars?: number
          trail_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trail_ratings_trail_id_fkey"
            columns: ["trail_id"]
            isOneToOne: false
            referencedRelation: "trails"
            referencedColumns: ["id"]
          },
        ]
      }
      trails: {
        Row: {
          activities: string[] | null
          ascent_m: number | null
          cover_url: string | null
          created_at: string
          description: string | null
          difficulty: string | null
          distance_m: number | null
          id: string
          name: string
          path: Json
          region: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          activities?: string[] | null
          ascent_m?: number | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          distance_m?: number | null
          id?: string
          name: string
          path: Json
          region?: string | null
          status?: string
          user_id?: string | null
        }
        Update: {
          activities?: string[] | null
          ascent_m?: number | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          distance_m?: number | null
          id?: string
          name?: string
          path?: Json
          region?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      trip_events: {
        Row: {
          client_id: string
          closed: boolean
          created_at: string
          dates: string[]
          host_id: string
          id: string
          month: string | null
          socialization: string | null
          trip_slug: string
        }
        Insert: {
          client_id: string
          closed?: boolean
          created_at?: string
          dates?: string[]
          host_id: string
          id?: string
          month?: string | null
          socialization?: string | null
          trip_slug: string
        }
        Update: {
          client_id?: string
          closed?: boolean
          created_at?: string
          dates?: string[]
          host_id?: string
          id?: string
          month?: string | null
          socialization?: string | null
          trip_slug?: string
        }
        Relationships: []
      }
      trip_fav: {
        Row: {
          added_at: string
          trip_slug: string
          user_id: string
        }
        Insert: {
          added_at?: string
          trip_slug: string
          user_id: string
        }
        Update: {
          added_at?: string
          trip_slug?: string
          user_id?: string
        }
        Relationships: []
      }
      trip_questions: {
        Row: {
          body: string
          created_at: string
          id: string
          trip_slug: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          trip_slug: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          trip_slug?: string
          user_id?: string
        }
        Relationships: []
      }
      trip_requests: {
        Row: {
          created_at: string
          decided_at: string | null
          decline_reason: string | null
          from_user_id: string
          id: string
          organizer_id: string
          status: string
          trip_slug: string
        }
        Insert: {
          created_at?: string
          decided_at?: string | null
          decline_reason?: string | null
          from_user_id: string
          id?: string
          organizer_id: string
          status?: string
          trip_slug: string
        }
        Update: {
          created_at?: string
          decided_at?: string | null
          decline_reason?: string | null
          from_user_id?: string
          id?: string
          organizer_id?: string
          status?: string
          trip_slug?: string
        }
        Relationships: []
      }
      trip_reviews: {
        Row: {
          body: string | null
          created_at: string
          id: string
          paws: number
          trip_slug: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          paws: number
          trip_slug: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          paws?: number
          trip_slug?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      trip_votes: {
        Row: {
          at: string
          comment: string | null
          crowd: string | null
          difficulty: string | null
          hazards: string[]
          rating: number | null
          trip_slug: string
          user_id: string
          when_ym: string | null
        }
        Insert: {
          at?: string
          comment?: string | null
          crowd?: string | null
          difficulty?: string | null
          hazards?: string[]
          rating?: number | null
          trip_slug: string
          user_id: string
          when_ym?: string | null
        }
        Update: {
          at?: string
          comment?: string | null
          crowd?: string | null
          difficulty?: string | null
          hazards?: string[]
          rating?: number | null
          trip_slug?: string
          user_id?: string
          when_ym?: string | null
        }
        Relationships: []
      }
      trip_walked: {
        Row: {
          source: string
          trip_slug: string
          user_id: string
          walked_at: string
        }
        Insert: {
          source?: string
          trip_slug: string
          user_id: string
          walked_at?: string
        }
        Update: {
          source?: string
          trip_slug?: string
          user_id?: string
          walked_at?: string
        }
        Relationships: []
      }
      user_trips: {
        Row: {
          added_at: string
          openness: string
          status: string
          trip_date: string | null
          trip_slug: string
          user_id: string
        }
        Insert: {
          added_at?: string
          openness?: string
          status?: string
          trip_date?: string | null
          trip_slug: string
          user_id: string
        }
        Update: {
          added_at?: string
          openness?: string
          status?: string
          trip_date?: string | null
          trip_slug?: string
          user_id?: string
        }
        Relationships: []
      }
      vision_votes: {
        Row: {
          user_id: string
          vision_key: string
          vote: string
          voted_at: string
        }
        Insert: {
          user_id: string
          vision_key: string
          vote: string
          voted_at?: string
        }
        Update: {
          user_id?: string
          vision_key?: string
          vote?: string
          voted_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      ainubis_touch: { Args: { p_conversation_id: string }; Returns: undefined }
      assign_invoice_number: { Args: { p_dog_id: string }; Returns: string }
      award_referral_for_dog: { Args: { p_dog_id: string }; Returns: Json }
      block_conv_peer: {
        Args: { p_block?: boolean; p_conv_id: string }
        Returns: boolean
      }
      claim_stripe_event: {
        Args: { p_event_id: string; p_lease_min?: number }
        Returns: boolean
      }
      conv_has_block: {
        Args: { p_conv_id: string; p_user?: string }
        Returns: boolean
      }
      conv_peer: { Args: { p_conv_id: string }; Returns: string }
      dm_key_for: { Args: { p_a: string; p_b: string }; Returns: string }
      get_auth_user_by_email: {
        Args: { p_email: string }
        Returns: {
          id: string
          user_metadata: Json
        }[]
      }
      get_my_network: { Args: never; Returns: Json }
      get_or_create_my_affiliate: {
        Args: never
        Returns: {
          code: string
          points: number
          referral_count: number
        }[]
      }
      get_trip_party: {
        Args: { p_organizer?: string; p_trip_slug: string }
        Returns: {
          at: string
          dog_name: string
          dog_photo: string
          owner_first: string
          pack_number: number
          role: string
        }[]
      }
      is_blocked_pair: { Args: { p_a: string; p_b: string }; Returns: boolean }
      is_conv_member: {
        Args: { p_conv_id: string; p_user?: string }
        Returns: boolean
      }
      is_paid_member: { Args: never; Returns: boolean }
      is_trails_admin: { Args: never; Returns: boolean }
      link_my_dogs: { Args: never; Returns: number }
      list_my_conversations: {
        Args: never
        Returns: {
          blocked: boolean
          conv_id: string
          kind: string
          last_at: string
          last_body: string
          last_read_at: string
          last_sender_me: boolean
          other_dog: string
          other_first: string
          other_key: number
          other_photo: string
          tag_id: string
          tag_kind: string
          tag_label: string
          unread: number
          updated_at: string
        }[]
      }
      list_trip_questions: {
        Args: { p_trip_slug: string }
        Returns: {
          body: string
          created_at: string
          id: string
          is_mine: boolean
          owner_first: string
          pack_number: number
        }[]
      }
      list_trip_reviews: {
        Args: { p_trip_slug: string }
        Returns: {
          body: string
          created_at: string
          id: string
          is_mine: boolean
          owner_first: string
          pack_number: number
          paws: number
          updated_at: string
        }[]
      }
      map_monthly_mapy_credits: { Args: never; Returns: number }
      map_route_cache_touch: { Args: { p_key: string }; Returns: undefined }
      mark_conv_read: { Args: { p_conv_id: string }; Returns: undefined }
      paid_members_never_signed_in: {
        Args: { p_grace_hours?: number }
        Returns: {
          dogs: number
          email: string
        }[]
      }
      rate_limit_hit: {
        Args: { p_bucket: string; p_max: number; p_window_sec: number }
        Returns: boolean
      }
      report_content: {
        Args: {
          p_kind: string
          p_note?: string
          p_reason: string
          p_ref: string
        }
        Returns: string
      }
      seal_pack_number: { Args: { p_dog_id: string }; Returns: number }
      start_dm: {
        Args: {
          p_organizer: string
          p_pack_number?: number
          p_trip_slug: string
        }
        Returns: string
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
