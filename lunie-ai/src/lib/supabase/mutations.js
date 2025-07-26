// src/lib/supabase/mutations.js
import { createClient } from './client'
import { createServerClient } from './server'
import { ValidationError, PermissionError, NotFoundError } from '../utils/errors'
import { validateChatbotName, validateUrl } from '../utils/validation'
import { PLAN_LIMITS } from '../utils/constants'
import { getChatbotById, getUserProfile, getUserChatbots } from './queries'

// =============================================================================
// PROFILE MUTATIONS  
// =============================================================================

export const updateUserProfile = async (userId, updates) => {
  const supabase = createClient()
  
  const allowedFields = ['full_name', 'avatar_url']
  const filteredUpdates = Object.keys(updates)
    .filter(key => allowedFields.includes(key))
    .reduce((obj, key) => {
      obj[key] = updates[key]
      return obj
    }, {})

  if (Object.keys(filteredUpdates).length === 0) {
    throw new ValidationError('No valid fields to update')
  }

  filteredUpdates.updated_at = new Date().toISOString()

  const { data, error } = await supabase
    .from('profiles')
    .update(filteredUpdates)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error

  return data
}

export const updateUserUsage = async (userId, increment = 1) => {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .rpc('increment_usage', {
      user_id: userId,
      increment_by: increment
    })

  if (error) throw error

  return data
}

// =============================================================================
// CHATBOT MUTATIONS
// =============================================================================

export const createChatbot = async (userId, chatbotData) => {
  const supabase = createClient()
  
  // Validate required fields
  const validation = validateChatbotName(chatbotData.name)
  if (!validation.isValid) {
    throw new ValidationError(validation.error, 'name')
  }

  // Check plan limits
  const profile = await getUserProfile(userId)
  const { chatbots } = await getUserChatbots(userId, { limit: 1000 })
  const planLimits = PLAN_LIMITS[profile.subscription_plan] || PLAN_LIMITS.free
  
  if (planLimits.chatbots !== -1 && chatbots.length >= planLimits.chatbots) {
    throw new ValidationError(`You've reached your plan limit of ${planLimits.chatbots} chatbot${planLimits.chatbots !== 1 ? 's' : ''}. Upgrade to create more.`)
  }

  // Generate unique pinecone namespace
  const pineconeNamespace = `user_${userId}_${Date.now()}`

  const newChatbot = {
    user_id: userId,
    name: chatbotData.name.trim(),
    description: chatbotData.description?.trim() || null,
    instructions: chatbotData.instructions?.trim() || 'You are a helpful AI assistant. Answer questions based on the provided context.',
    ai_model: chatbotData.ai_model || 'gpt-3.5-turbo',
    temperature: chatbotData.temperature || 0.7,
    max_tokens: chatbotData.max_tokens || 1000,
    theme_color: chatbotData.theme_color || '#3b82f6',
    welcome_message: chatbotData.welcome_message?.trim() || 'Hello! How can I help you today?',
    suggested_messages: chatbotData.suggested_messages || [],
    footer_text: chatbotData.footer_text?.trim() || null,
    fallback_message: chatbotData.fallback_message?.trim() || 'I apologize, but I don\'t have enough information to answer that question.',
    collect_leads: chatbotData.collect_leads || false,
    pinecone_namespace: pineconeNamespace,
    is_active: true
  }

  const { data, error } = await supabase
    .from('chatbots')
    .insert(newChatbot)
    .select()
    .single()

  if (error) throw error

  return data
}

export const updateChatbot = async (chatbotId, userId, updates) => {
  const supabase = createClient()
  
  // Verify ownership
  await getChatbotById(chatbotId, userId)

  // Validate updates
  if (updates.name) {
    const validation = validateChatbotName(updates.name)
    if (!validation.isValid) {
      throw new ValidationError(validation.error, 'name')
    }
  }

  const allowedFields = [
    'name', 'description', 'instructions', 'ai_model', 'temperature', 
    'max_tokens', 'theme_color', 'welcome_message', 'chat_icon_url', 
    'avatar_url', 'suggested_messages', 'footer_text', 'fallback_message',
    'is_active', 'is_public', 'collect_leads'
  ]

  const filteredUpdates = Object.keys(updates)
    .filter(key => allowedFields.includes(key) && updates[key] !== undefined)
    .reduce((obj, key) => {
      obj[key] = updates[key]
      return obj
    }, {})

  if (Object.keys(filteredUpdates).length === 0) {
    throw new ValidationError('No valid fields to update')
  }

  filteredUpdates.updated_at = new Date().toISOString()

  const { data, error } = await supabase
    .from('chatbots')
    .update(filteredUpdates)
    .eq('id', chatbotId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error

  return data
}

export const deleteChatbot = async (chatbotId, userId) => {
  const supabase = createClient()
  
  // Verify ownership
  await getChatbotById(chatbotId, userId)

  const { error } = await supabase
    .from('chatbots')
    .delete()
    .eq('id', chatbotId)
    .eq('user_id', userId)

  if (error) throw error

  return { success: true }
}

export const duplicateChatbot = async (chatbotId, userId, newName) => {
  const supabase = createClient()
  
  // Get original chatbot
  const originalChatbot = await getChatbotById(chatbotId, userId)

  // Validate new name
  const validation = validateChatbotName(newName)
  if (!validation.isValid) {
    throw new ValidationError(validation.error, 'name')
  }

  // Check plan limits
  const profile = await getUserProfile(userId)
  const { chatbots } = await getUserChatbots(userId, { limit: 1000 })
  const planLimits = PLAN_LIMITS[profile.subscription_plan] || PLAN_LIMITS.free
  
  if (planLimits.chatbots !== -1 && chatbots.length >= planLimits.chatbots) {
    throw new ValidationError(`You've reached your plan limit of ${planLimits.chatbots} chatbot${planLimits.chatbots !== 1 ? 's' : ''}. Upgrade to create more.`)
  }

  // Create duplicate
  const duplicateData = {
    ...originalChatbot,
    id: undefined, // Let database generate new ID
    name: newName.trim(),
    pinecone_namespace: `user_${userId}_${Date.now()}`,
    total_conversations: 0,
    total_messages: 0,
    created_at: undefined,
    updated_at: undefined
  }

  // Remove computed fields
  delete duplicateData.training_data
  delete duplicateData.conversations
  delete duplicateData.qa_pairs

  const { data, error } = await supabase
    .from('chatbots')
    .insert(duplicateData)
    .select()
    .single()

  if (error) throw error

  return data
}

// =============================================================================
// TRAINING DATA MUTATIONS
// =============================================================================

export const createTrainingData = async (chatbotId, userId, trainingData) => {
  const supabase = createClient()
  
  // Verify chatbot ownership
  await getChatbotById(chatbotId, userId)

  // Validate URL if provided
  if (trainingData.source_url) {
    const urlValidation = validateUrl(trainingData.source_url)
    if (!urlValidation.isValid) {
      throw new ValidationError(urlValidation.error, 'source_url')
    }
  }

  const newTrainingData = {
    chatbot_id: chatbotId,
    type: trainingData.type,
    title: trainingData.title.trim(),
    content: trainingData.content?.trim() || null,
    source_url: trainingData.source_url || null,
    file_path: trainingData.file_path || null,
    file_name: trainingData.file_name || null,
    file_size: trainingData.file_size || null,
    file_type: trainingData.file_type || null,
    processing_status: 'pending',
    metadata: trainingData.metadata || {}
  }

  const { data, error } = await supabase
    .from('training_data')
    .insert(newTrainingData)
    .select()
    .single()

  if (error) throw error

  return data
}

export const updateTrainingData = async (trainingDataId, userId, updates) => {
  const supabase = createClient()
  
  // Verify ownership through chatbot
  const trainingData = await supabase
    .from('training_data')
    .select(`
      *,
      chatbots!inner(user_id)
    `)
    .eq('id', trainingDataId)
    .eq('chatbots.user_id', userId)
    .single()

  if (trainingData.error) {
    throw new NotFoundError('Training data')
  }

  const allowedFields = [
    'title', 'content', 'processing_status', 'error_message', 
    'chunk_count', 'metadata'
  ]

  const filteredUpdates = Object.keys(updates)
    .filter(key => allowedFields.includes(key) && updates[key] !== undefined)
    .reduce((obj, key) => {
      obj[key] = updates[key]
      return obj
    }, {})

  if (Object.keys(filteredUpdates).length === 0) {
    throw new ValidationError('No valid fields to update')
  }

  filteredUpdates.updated_at = new Date().toISOString()

  const { data, error } = await supabase
    .from('training_data')
    .update(filteredUpdates)
    .eq('id', trainingDataId)
    .select()
    .single()

  if (error) throw error

  return data
}

export const deleteTrainingData = async (trainingDataId, userId) => {
  const supabase = createClient()
  
  // Verify ownership through chatbot
  const trainingData = await supabase
    .from('training_data')
    .select(`
      *,
      chatbots!inner(user_id)
    `)
    .eq('id', trainingDataId)
    .eq('chatbots.user_id', userId)
    .single()

  if (trainingData.error) {
    throw new NotFoundError('Training data')
  }

  const { error } = await supabase
    .from('training_data')
    .delete()
    .eq('id', trainingDataId)

  if (error) throw error

  return { success: true }
}

// =============================================================================
// QA PAIRS MUTATIONS
// =============================================================================

export const createQAPair = async (chatbotId, userId, qaData) => {
  const supabase = createClient()
  
  // Verify chatbot ownership
  await getChatbotById(chatbotId, userId)

  if (!qaData.question?.trim() || !qaData.answer?.trim()) {
    throw new ValidationError('Question and answer are required')
  }

  const newQAPair = {
    chatbot_id: chatbotId,
    question: qaData.question.trim(),
    answer: qaData.answer.trim(),
    category: qaData.category?.trim() || null,
    is_active: qaData.is_active !== undefined ? qaData.is_active : true
  }

  const { data, error } = await supabase
    .from('qa_pairs')
    .insert(newQAPair)
    .select()
    .single()

  if (error) throw error

  return data
}

export const updateQAPair = async (qaPairId, userId, updates) => {
  const supabase = createClient()
  
  // Verify ownership through chatbot
  const qaPair = await supabase
    .from('qa_pairs')
    .select(`
      *,
      chatbots!inner(user_id)
    `)
    .eq('id', qaPairId)
    .eq('chatbots.user_id', userId)
    .single()

  if (qaPair.error) {
    throw new NotFoundError('Q&A pair')
  }

  const allowedFields = ['question', 'answer', 'category', 'is_active']

  const filteredUpdates = Object.keys(updates)
    .filter(key => allowedFields.includes(key) && updates[key] !== undefined)
    .reduce((obj, key) => {
      obj[key] = updates[key]
      return obj
    }, {})

  if (Object.keys(filteredUpdates).length === 0) {
    throw new ValidationError('No valid fields to update')
  }

  filteredUpdates.updated_at = new Date().toISOString()

  const { data, error } = await supabase
    .from('qa_pairs')
    .update(filteredUpdates)
    .eq('id', qaPairId)
    .select()
    .single()

  if (error) throw error

  return data
}

export const deleteQAPair = async (qaPairId, userId) => {
  const supabase = createClient()
  
  // Verify ownership through chatbot
  const qaPair = await supabase
    .from('qa_pairs')
    .select(`
      *,
      chatbots!inner(user_id)
    `)
    .eq('id', qaPairId)
    .eq('chatbots.user_id', userId)
    .single()

  if (qaPair.error) {
    throw new NotFoundError('Q&A pair')
  }

  const { error } = await supabase
    .from('qa_pairs')
    .delete()
    .eq('id', qaPairId)

  if (error) throw error

  return { success: true }
}

// =============================================================================
// CONVERSATION MUTATIONS
// =============================================================================

export const createConversation = async (chatbotId, conversationData) => {
  const supabase = createClient()
  
  // Note: This can be called by anonymous users, so no user verification
  const newConversation = {
    chatbot_id: chatbotId,
    session_id: conversationData.session_id,
    visitor_id: conversationData.visitor_id || null,
    visitor_info: conversationData.visitor_info || {},
    channel: conversationData.channel || 'website',
    messages: conversationData.messages || [],
    is_active: true,
    first_message_at: new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('conversations')
    .insert(newConversation)
    .select()
    .single()

  if (error) throw error

  return data
}

export const updateConversation = async (conversationId, userId, updates) => {
  const supabase = createClient()
  
  // Verify ownership through chatbot
  const conversation = await supabase
    .from('conversations')
    .select(`
      *,
      chatbots!inner(user_id)
    `)
    .eq('id', conversationId)
    .eq('chatbots.user_id', userId)
    .single()

  if (conversation.error) {
    throw new NotFoundError('Conversation')
  }

  const allowedFields = [
    'is_active', 'human_takeover', 'human_agent_id', 
    'lead_captured', 'lead_data', 'messages'
  ]

  const filteredUpdates = Object.keys(updates)
    .filter(key => allowedFields.includes(key) && updates[key] !== undefined)
    .reduce((obj, key) => {
      obj[key] = updates[key]
      return obj
    }, {})

  if (Object.keys(filteredUpdates).length === 0) {
    throw new ValidationError('No valid fields to update')
  }

  filteredUpdates.updated_at = new Date().toISOString()
  filteredUpdates.last_message_at = new Date().toISOString()

  const { data, error } = await supabase
    .from('conversations')
    .update(filteredUpdates)
    .eq('id', conversationId)
    .select()
    .single()

  if (error) throw error

  return data
}

export const deleteConversation = async (conversationId, userId) => {
  const supabase = createClient()
  
  // Verify ownership through chatbot
  const conversation = await supabase
    .from('conversations')
    .select(`
      *,
      chatbots!inner(user_id)
    `)
    .eq('id', conversationId)
    .eq('chatbots.user_id', userId)
    .single()

  if (conversation.error) {
    throw new NotFoundError('Conversation')
  }

  const { error } = await supabase
    .from('conversations')
    .delete()
    .eq('id', conversationId)

  if (error) throw error

  return { success: true }
}

// =============================================================================
// MESSAGE MUTATIONS
// =============================================================================

export const createMessage = async (conversationId, messageData) => {
  const supabase = createClient()
  
  const newMessage = {
    conversation_id: conversationId,
    type: messageData.type, // 'user', 'assistant', 'system'
    content: messageData.content,
    metadata: messageData.metadata || {},
    ai_model: messageData.ai_model || null,
    prompt_tokens: messageData.prompt_tokens || null,
    completion_tokens: messageData.completion_tokens || null,
    response_time_ms: messageData.response_time_ms || null
  }

  const { data, error } = await supabase
    .from('messages')
    .insert(newMessage)
    .select()
    .single()

  if (error) throw error

  // Update conversation message count and last message time
  await supabase
    .from('conversations')
    .update({
      message_count: supabase.raw('message_count + 1'),
      last_message_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', conversationId)

  return data
}

// =============================================================================
// BATCH OPERATIONS
// =============================================================================

export const batchCreateTrainingData = async (chatbotId, userId, trainingDataArray) => {
  const supabase = createClient()
  
  // Verify chatbot ownership
  await getChatbotById(chatbotId, userId)

  const newTrainingData = trainingDataArray.map(data => ({
    chatbot_id: chatbotId,
    type: data.type,
    title: data.title.trim(),
    content: data.content?.trim() || null,
    source_url: data.source_url || null,
    file_path: data.file_path || null,
    file_name: data.file_name || null,
    file_size: data.file_size || null,
    file_type: data.file_type || null,
    processing_status: 'pending',
    metadata: data.metadata || {}
  }))

  const { data, error } = await supabase
    .from('training_data')
    .insert(newTrainingData)
    .select()

  if (error) throw error

  return data
}

export const batchDeleteTrainingData = async (trainingDataIds, userId) => {
  const supabase = createClient()
  
  // Verify ownership for all items
  const { data: trainingData, error: selectError } = await supabase
    .from('training_data')
    .select(`
      id,
      chatbots!inner(user_id)
    `)
    .in('id', trainingDataIds)
    .eq('chatbots.user_id', userId)

  if (selectError) throw selectError

  if (trainingData.length !== trainingDataIds.length) {
    throw new PermissionError('Some training data items not found or access denied')
  }

  const { error } = await supabase
    .from('training_data')
    .delete()
    .in('id', trainingDataIds)

  if (error) throw error

  return { success: true, deletedCount: trainingDataIds.length }
}