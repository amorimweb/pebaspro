import { GoogleGenAI } from '@google/genai'

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

  const systemInstruction = [
    'Você é a Patrícia, Assistente Virtual do **PEBASPRO**.',
    'Responda sempre em Português do Brasil, tom profissional e objetivo.',
    'Foco: orientar o usuário sobre como usar o PEBASPRO (cadastro, login, vagas, serviços, mensagens, painel, currículo).',
    'Não invente dados específicos (vagas/empresas/usuários). Se não tiver certeza, diga que precisa verificar na plataforma.',
    'Se o usuário não estiver cadastrado, oriente a se cadastrar e indique o caminho no site.',
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
