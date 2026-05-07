import { GoogleGenAI } from '@google/genai'
import { getPatriciaKnowledgeFor } from '../../utils/patriciaKnowledge'

type ChatMessage = { role: 'user' | 'model'; text: string }

export default defineEventHandler(async (event) => {
  const body = await readBody<{ messages?: ChatMessage[]; userContext?: any }>(event)
  const messages = body?.messages || []
  const userContext = body?.userContext || {}

  const apiKey = process.env.GEMINI_API_KEY || ''
  if (!apiKey) {
    throw createError({ statusCode: 500, message: 'GEMINI_API_KEY não configurada' })
  }

  const ai = new GoogleGenAI({ apiKey })
  const latestUserMessage = [...messages].reverse().find((m) => m.role === 'user')?.text || ''
  const relevantKnowledge = getPatriciaKnowledgeFor(latestUserMessage, userContext?.role || 'visitante')

  const systemInstruction = [
    'Você é a Patrícia, Assistente Virtual do **PEBASPRO**.',
    'Use a base de conhecimento abaixo como fonte principal para orientar o usuário dentro da plataforma.',
    'Responda sempre em Português do Brasil, com tom profissional, acolhedor e objetivo.',
    'Dê caminhos práticos com nomes de telas e rotas quando isso ajudar.',
    'Não invente dados específicos de vagas, empresas, usuários, documentos, mensagens, pagamentos ou aprovações.',
    'Quando não tiver acesso ao dado em tempo real, explique como o usuário pode verificar na própria plataforma.',
    'Se o usuário não estiver cadastrado, oriente a se cadastrar e indique o caminho no site.',
    relevantKnowledge,
    userContext?.name ? `Contexto: Nome do usuário = ${userContext.name}.` : '',
    userContext?.role ? `Contexto: Perfil = ${userContext.role}.` : '',
  ].filter(Boolean).join('\n')

  const contents = messages.map((m) => ({
    role: m.role,
    parts: [{ text: m.text || ' ' }],
  }))

  const resp = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents,
    config: { temperature: 0.2, systemInstruction },
  })

  return { text: resp.text || '' }
})
