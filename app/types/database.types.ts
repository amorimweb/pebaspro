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
      categorias: {
        Row: {
          id: string
          nome: string
          slug: string
          icone: string | null
          descricao: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          nome: string
          slug: string
          icone?: string | null
          descricao?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          nome?: string
          slug?: string
          icone?: string | null
          descricao?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      conversas: {
        Row: {
          id: string
          participante1_id: string
          participante2_id: string
          ultima_mensagem: string | null
          updated_at: string
          created_at: string
        }
        Insert: {
          id?: string
          participante1_id: string
          participante2_id: string
          ultima_mensagem?: string | null
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          participante1_id?: string
          participante2_id?: string
          ultima_mensagem?: string | null
          updated_at?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversas_participante1_id_fkey"
            columns: ["participante1_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversas_participante2_id_fkey"
            columns: ["participante2_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          }
        ]
      }
      mensagens: {
        Row: {
          id: string
          conversa_id: string
          remetente_id: string
          conteudo: string
          lida: boolean
          created_at: string
        }
        Insert: {
          id?: string
          conversa_id: string
          remetente_id: string
          conteudo: string
          lida?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          conversa_id?: string
          remetente_id?: string
          conteudo?: string
          lida?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mensagens_conversa_id_fkey"
            columns: ["conversa_id"]
            isOneToOne: false
            referencedRelation: "conversas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mensagens_remetente_id_fkey"
            columns: ["remetente_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          }
        ]
      }
      servicos: {
        Row: {
          id: string
          prestador_id: string
          categoria_id: string | null
          titulo: string
          descricao: string | null
          preco_inicial: number | null
          ativo: boolean
          created_at: string
        }
        Insert: {
          id?: string
          prestador_id: string
          categoria_id?: string | null
          titulo: string
          descricao?: string | null
          preco_inicial?: number | null
          ativo?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          prestador_id?: string
          categoria_id?: string | null
          titulo?: string
          descricao?: string | null
          preco_inicial?: number | null
          ativo?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "servicos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "servicos_prestador_id_fkey"
            columns: ["prestador_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          }
        ]
      }
      solicitacoes_orcamento: {
        Row: {
          id: string
          servico_id: string
          cliente_id: string
          mensagem: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          servico_id: string
          cliente_id: string
          mensagem: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          servico_id?: string
          cliente_id?: string
          mensagem?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "solicitacoes_orcamento_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solicitacoes_orcamento_servico_id_fkey"
            columns: ["servico_id"]
            isOneToOne: false
            referencedRelation: "servicos"
            referencedColumns: ["id"]
          }
        ]
      }
      avaliacoes: {
        Row: {
          id: string
          servico_id: string
          autor_id: string
          prestador_id: string
          nota: number
          comentario: string | null
          created_at: string
        }
        Insert: {
          id?: string
          servico_id: string
          autor_id: string
          prestador_id: string
          nota: number
          comentario?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          servico_id?: string
          autor_id?: string
          prestador_id?: string
          nota?: number
          comentario?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "avaliacoes_autor_id_fkey"
            columns: ["autor_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_prestador_id_fkey"
            columns: ["prestador_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_servico_id_fkey"
            columns: ["servico_id"]
            isOneToOne: false
            referencedRelation: "servicos"
            referencedColumns: ["id"]
          }
        ]
      }
      curriculos: {
        Row: {
          id: string
          user_id: string
          objetivo_profissional: string | null
          biografia: string | null
          habilidades: string[] | null
          experiencia_profissional: Json | null
          formacao_academica: Json | null
          latitude: number | null
          longitude: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          objetivo_profissional?: string | null
          biografia?: string | null
          habilidades?: string[] | null
          experiencia_profissional?: Json | null
          formacao_academica?: Json | null
          latitude?: number | null
          longitude?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          objetivo_profissional?: string | null
          biografia?: string | null
          habilidades?: string[] | null
          experiencia_profissional?: Json | null
          formacao_academica?: Json | null
          latitude?: number | null
          longitude?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "curriculos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      favoritos: {
        Row: {
          id: string
          usuario_id: string
          servico_id: string | null
          favorito_usuario_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          usuario_id: string
          servico_id?: string | null
          favorito_usuario_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          usuario_id?: string
          servico_id?: string | null
          favorito_usuario_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "favoritos_servico_id_fkey"
            columns: ["servico_id"]
            isOneToOne: false
            referencedRelation: "servicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favoritos_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favoritos_favorito_usuario_id_fkey"
            columns: ["favorito_usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          }
        ]
      }
      usuarios: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          nome: string | null
          email: string | null
          documento: string | null
          telefone: string | null
          endereco: string | null
          profissao: string | null
          regiao: string | null
          sobre_mim: string | null
          status: string | null
          tipo_conta: string | null
          biografia: string | null
          cadastro_completo: boolean | null
          foto: string | null
          experiencia_profissional: Json | null
          formacao_academica: Json | null
          habilidades: string[] | null
          objetivo_profissional: string | null
          latitude: number | null
          longitude: number | null
          role: string
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          nome?: string | null
          email?: string | null
          documento?: string | null
          telefone?: string | null
          endereco?: string | null
          profissao?: string | null
          regiao?: string | null
          sobre_mim?: string | null
          status?: string | null
          tipo_conta?: string | null
          biografia?: string | null
          cadastro_completo?: boolean | null
          foto?: string | null
          experiencia_profissional?: Json | null
          formacao_academica?: Json | null
          habilidades?: string[] | null
          objetivo_profissional?: string | null
          latitude?: number | null
          longitude?: number | null
          role?: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          nome?: string | null
          email?: string | null
          documento?: string | null
          telefone?: string | null
          endereco?: string | null
          profissao?: string | null
          regiao?: string | null
          sobre_mim?: string | null
          status?: string | null
          tipo_conta?: string | null
          biografia?: string | null
          cadastro_completo?: boolean | null
          foto?: string | null
          experiencia_profissional?: Json | null
          formacao_academica?: Json | null
          habilidades?: string[] | null
          objetivo_profissional?: string | null
          latitude?: number | null
          longitude?: number | null
          role?: string
        }
        Relationships: []
      }
      vagas: {
        Row: {
          id: string
          empresa_id: string
          titulo: string
          descricao: string | null
          requisitos: string | null
          beneficios: string | null
          modalidade: string | null
          tipo: string | null
          jornada: string | null
          salario: string | null
          local: string | null
          whatsapp: string | null
          data_publicacao: string
          encerramento: string | null
          updated_at: string
          categoria_id: string | null
          habilidades_exigidas: string[] | null
          latitude: number | null
          longitude: number | null
          nivel_experiencia: string | null
          email: string | null
          tipo_contato: string | null
        }
        Insert: {
          id?: string
          empresa_id: string
          titulo: string
          descricao?: string | null
          requisitos?: string | null
          beneficios?: string | null
          modalidade?: string | null
          tipo?: string | null
          jornada?: string | null
          salario?: string | null
          local?: string | null
          whatsapp?: string | null
          data_publicacao?: string
          encerramento?: string | null
          updated_at?: string
          categoria_id?: string | null
          habilidades_exigidas?: string[] | null
          latitude?: number | null
          longitude?: number | null
          nivel_experiencia?: string | null
        }
        Update: {
          id?: string
          empresa_id?: string
          titulo?: string
          descricao?: string | null
          requisitos?: string | null
          beneficios?: string | null
          modalidade?: string | null
          tipo?: string | null
          jornada?: string | null
          salario?: string | null
          local?: string | null
          whatsapp?: string | null
          data_publicacao?: string
          encerramento?: string | null
          updated_at?: string
          categoria_id?: string | null
          habilidades_exigidas?: string[] | null
          latitude?: number | null
          longitude?: number | null
          nivel_experiencia?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vagas_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vagas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          }
        ]
      }
      notificacoes: {
        Row: {
          id: string
          user_id: string
          titulo: string
          mensagem: string
          tipo: string
          lida: boolean
          link: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          titulo: string
          mensagem: string
          tipo?: string
          lida?: boolean
          link?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          titulo?: string
          mensagem?: string
          tipo?: string
          lida?: boolean
          link?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notificacoes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      visualizacoes_vitrine: {
        Row: {
          id: string
          vitrine_id: string
          visitante_id: string | null
          ip_address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          vitrine_id: string
          visitante_id?: string | null
          ip_address?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          vitrine_id?: string
          visitante_id?: string | null
          ip_address?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "visualizacoes_vitrine_vitrine_id_fkey"
            columns: ["vitrine_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visualizacoes_vitrine_visitante_id_fkey"
            columns: ["visitante_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      talento_curriculos: {
        Row: {
          id: string
          nome: string | null
          email: string | null
          foto: string | null
          telefone: string | null
          endereco: string | null
          profissao: string | null
          regiao: string | null
          cadastro_completo: boolean | null
          status: string | null
          tipo_conta: string | null
          created_at: string
          updated_at: string
          objetivo_profissional: string | null
          biografia: string | null
          habilidades: string[] | null
          experiencia_profissional: Json | null
          formacao_academica: Json | null
          latitude: number | null
          longitude: number | null
        }
        Relationships: []
      }
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

export type Tables<
  PublicTableNameOrOptions extends
  | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
    Database[PublicTableNameOrOptions["schema"]]["Views"])
  : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
    Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
  ? R
  : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
    Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
    Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
  ? R
  : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
  | keyof Database["public"]["Tables"]
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
  : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I
  }
  ? I
  : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
    Insert: infer I
  }
  ? I
  : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
  | keyof Database["public"]["Tables"]
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
  : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U
  }
  ? U
  : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
    Update: infer U
  }
  ? U
  : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
  | keyof Database["public"]["Enums"]
  | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
  : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never

// Shorthand types for convenience
export type Categoria = Tables<"categorias">
export type Conversa = Tables<"conversas">
export type Mensagem = Tables<"mensagens">
export type Servico = Tables<"servicos">
export type SolicitacaoOrcamento = Tables<"solicitacoes_orcamento">
export type Avaliacao = Tables<"avaliacoes">
export type Favorito = Tables<"favoritos">
export type Usuario = Tables<"usuarios"> & {
  curriculo?: Curriculo | null
}
export type Vaga = Tables<"vagas">
export type Curriculo = Tables<"curriculos">
