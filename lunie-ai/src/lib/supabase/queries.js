// src/lib/supabase/queries.js
import { createClient } from './client'
import { NotFoundError, ValidationError, PermissionError } from '../utils/errors'

// =============================================================================
// USER & PROFILE QUERIES
// =============================================================================

export const getUserProfile = async (userId) => {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      throw new NotFoundError('User profile')
    }
    throw error
  }

  return data
}

export const getCurrentUser = async () => {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    throw new Error('Not authenticated')
  }
  
  return user
}

export const getCurrentUserWithProfile = async () => {
  const user = await getCurrentUser()
  const profile = await getUserProfile(user.id)
  
  return { user, profile }
}

// =============================================================================
// CHATBOT QUERIES
// =============================================================================

export const getUserChatbots = async (userId, options = {}) => {
  const supabase = createClient()
  const { limit = 50, offset = 0, search = '', sortBy = 'created_at', sortOrder = 'desc' } = options

  let query = supabase
    .from('chatbots')
    .select('*')
    .eq('user_id', userId)
    .order(sortBy, { ascending: sortOrder === 'asc' })
    .range(offset, offset + limit - 1)

  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
  }

  const { data, error, count } = await query

  if (error) throw error

  return {
    chatbots: data || [],
    totalCount: count || 0
  }
}

export const getChatbotById = async (chatbotId, userId) => {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('chatbots')
    .select('*')
    .eq('id', chatbotId)
    .eq('user_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      throw new NotFoundError('Chatbot')
    }
    throw error
  }

  return data
}

export const getChatbotStats = async (chatbotId, userId) => {
  const supabase = createClient()
  
  // First verify ownership
  await getChatbotById(chatbotId, userId)
  
  const [
    { count: totalConversations },
    { count: totalMessages },
    { count: trainingItems }
  ] = await Promise.all([
    supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('chatbot_id', chatbotId),
    supabase.from('messages').select('*', { count: 'exact', head: true }),
    supabase.from('training_data').select('*', { count: 'exact', head: true }).eq('chatbot_id', chatbotId)
  ])

  return {
    totalConversations: totalConversations || 0,
    totalMessages: totalMessages || 0,
    trainingItems: trainingItems || 0,
    activeConversations: 0
  }
}

// =============================================================================
// TRAINING DATA QUERIES
// =============================================================================

export const getTrainingData = async (chatbotId, userId, options = {}) => {
  const supabase = createClient()
  const { type = null, status = null, limit = 50, offset = 0 } = options

  // Verify chatbot ownership
  await getChatbotById(chatbotId, userId)

  let query = supabase
    .from('training_data')
    .select('*')
    .eq('chatbot_id', chatbotId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (type) {
    query = query.eq('type', type)
  }

  if (status) {
    query = query.eq('processing_status', status)
  }

  const { data, error } = await query

  if (error) throw error

  return data || []
}

export const getTrainingDataById = async (trainingDataId, userId) => {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('training_data')
    .select(`
      *,
      chatbots!inner(user_id)
    `)
    .eq('id', trainingDataId)
    .eq('chatbots.user_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      throw new NotFoundError('Training data')
    }
    throw error
  }

  return data
}

// =============================================================================
// CONVERSATION QUERIES
// =============================================================================

export const getConversations = async (chatbotId, userId, options = {}) => {
  const supabase = createClient()
  const { limit = 50, offset = 0, channel = null, dateFrom = null, dateTo = null } = options

  // Verify chatbot ownership
  await getChatbotById(chatbotId, userId)

  let query = supabase
    .from('conversations')
    .select('*')
    .eq('chatbot_id', chatbotId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (channel) {
    query = query.eq('channel', channel)
  }

  if (dateFrom) {
    query = query.gte('created_at', dateFrom)
  }

  if (dateTo) {
    query = query.lte('created_at', dateTo)
  }

  const { data, error } = await query

  if (error) throw error

  return data || []
}

export const getConversationById = async (conversationId, userId) => {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      chatbots!inner(user_id),
      messages(*)
    `)
    .eq('id', conversationId)
    .eq('chatbots.user_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      throw new NotFoundError('Conversation')
    }
    throw error
  }

  return data
}

// =============================================================================
// ANALYTICS QUERIES
// =============================================================================

export const getDashboardStats = async (userId) => {
  const supabase = createClient()
  
  const [
    { count: totalChatbots },
    { count: totalConversations },
    { count: totalMessages },
    { count: totalTrainingData }
  ] = await Promise.all([
    // Total chatbots
    supabase
      .from('chatbots')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId),
    
    // Conversations - simplified count
    supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true }),
    
    // Messages - simplified count
    supabase
      .from('messages')
      .select('*', { count: 'exact', head: true }),
    
    // Training data count - simplified  
    supabase
      .from('training_data')
      .select('*', { count: 'exact', head: true })
  ])

  return {
    totalChatbots: totalChatbots || 0,
    totalConversations: totalConversations || 0,
    totalMessages: totalMessages || 0,
    totalTrainingData: totalTrainingData || 0
  }
}

// =============================================================================
// SEARCH QUERIES
// =============================================================================

export const searchUserContent = async (userId, query, options = {}) => {
  const supabase = createClient()
  const { limit = 20, types = ['chatbots', 'training_data'] } = options

  const results = {}

  if (types.includes('chatbots')) {
    const { data: chatbots } = await supabase
      .from('chatbots')
      .select('id, name, description, created_at')
      .eq('user_id', userId)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(limit)

    results.chatbots = chatbots || []
  }

  if (types.includes('training_data')) {
    const { data: trainingData } = await supabase
      .from('training_data')
      .select(`
        id, title, type, created_at,
        chatbots!inner(id, name, user_id)
      `)
      .eq('chatbots.user_id', userId)
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .limit(limit)

    results.trainingData = trainingData || []
  }

  return results
}