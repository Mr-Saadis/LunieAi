// src/types/database.js
/**
 * @typedef {Object} Profile
 * @property {string} id - User ID
 * @property {string} email - User email
 * @property {string} full_name - User's full name
 * @property {string} avatar_url - Profile picture URL
 * @property {'free'|'starter'|'pro'|'enterprise'} subscription_plan - Subscription plan
 * @property {'active'|'cancelled'|'past_due'|'trialing'} subscription_status - Subscription status
 * @property {string} stripe_customer_id - Stripe customer ID
 * @property {string} api_key - User's API key
 * @property {number} usage_current_month - Current month's usage
 * @property {number} usage_limit - Monthly usage limit
 * @property {string} created_at - Creation timestamp
 * @property {string} updated_at - Last update timestamp
 */

/**
 * @typedef {Object} Chatbot
 * @property {string} id - Chatbot ID
 * @property {string} user_id - Owner user ID
 * @property {string} organization_id - Organization ID (optional)
 * @property {string} name - Chatbot name
 * @property {string} description - Chatbot description
 * @property {string} instructions - AI instructions/prompt
 * @property {'gpt-3.5-turbo'|'gpt-4'|'gpt-4o'|'gpt-4o-mini'|'gpt-4-turbo'|'gemini-pro'} ai_model - AI model
 * @property {number} temperature - AI temperature setting
 * @property {number} max_tokens - Max tokens per response
 * @property {string} theme_color - UI theme color
 * @property {string} welcome_message - Welcome message
 * @property {string} chat_icon_url - Chat icon URL
 * @property {string} avatar_url - Chatbot avatar URL
 * @property {Array} suggested_messages - Suggested conversation starters
 * @property {string} footer_text - Footer text
 * @property {string} fallback_message - Fallback message for unknown queries
 * @property {boolean} is_active - Whether chatbot is active
 * @property {boolean} is_public - Whether chatbot is publicly accessible
 * @property {boolean} collect_leads - Whether to collect lead information
 * @property {string} pinecone_namespace - Pinecone namespace for vectors
 * @property {number} total_conversations - Total conversation count
 * @property {number} total_messages - Total message count
 * @property {string} created_at - Creation timestamp
 * @property {string} updated_at - Last update timestamp
 */

/**
 * @typedef {Object} TrainingData
 * @property {string} id - Training data ID
 * @property {string} chatbot_id - Associated chatbot ID
 * @property {'file'|'website'|'text'|'qa'|'table'} type - Data type
 * @property {string} title - Data title
 * @property {string} content - Extracted text content
 * @property {string} source_url - Source URL (for website/file)
 * @property {string} file_path - Supabase storage path
 * @property {string} file_name - Original filename
 * @property {number} file_size - File size in bytes
 * @property {string} file_type - MIME type
 * @property {'pending'|'processing'|'completed'|'failed'} processing_status - Processing status
 * @property {string} error_message - Error message if processing failed
 * @property {number} chunk_count - Number of text chunks created
 * @property {Object} metadata - Additional metadata
 * @property {string} created_at - Creation timestamp
 * @property {string} updated_at - Last update timestamp
 */

/**
 * @typedef {Object} Conversation
 * @property {string} id - Conversation ID
 * @property {string} chatbot_id - Associated chatbot ID
 * @property {string} session_id - Session identifier
 * @property {string} visitor_id - Anonymous visitor ID
 * @property {Object} visitor_info - Visitor information (IP, user agent, etc.)
 * @property {'website'|'whatsapp'|'instagram'|'messenger'|'api'} channel - Communication channel
 * @property {Array} messages - Array of messages
 * @property {boolean} is_active - Whether conversation is active
 * @property {boolean} human_takeover - Whether human agent took over
 * @property {string} human_agent_id - Human agent ID
 * @property {boolean} lead_captured - Whether lead was captured
 * @property {Object} lead_data - Lead information
 * @property {number} message_count - Total message count
 * @property {string} first_message_at - First message timestamp
 * @property {string} last_message_at - Last message timestamp
 * @property {string} created_at - Creation timestamp
 * @property {string} updated_at - Last update timestamp
 */