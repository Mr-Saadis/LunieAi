// src/lib/ai/prompt-engineer.js
/**
 * Prompt Engineering System
 * Creates optimized prompts for different use cases and industries
 */

class PromptEngineer {
  constructor() {
    this.templates = this.loadTemplates();
    this.industryPrompts = this.loadIndustryPrompts();
  }

  /**
   * Load prompt templates
   */
  loadTemplates() {
    return {
      default: {
        system: `You are a helpful AI assistant. Follow these guidelines:
1. Provide accurate, helpful, and concise responses
2. If you don't know something, say so honestly
3. Be professional and friendly in tone
4. Format responses for clarity using markdown when appropriate
5. Consider the context provided to give relevant answers`,
        
        ragContext: `Answer the user's question based on the following context. 
If the answer cannot be found in the context, say so politely.

Context:
{context}

Instructions: {instructions}

User Question: {question}`,

        conversation: `Continue this conversation naturally while maintaining context.
Previous messages provide background - refer to them when relevant.
Instructions: {instructions}`
      },

      customerSupport: {
        system: `You are a professional customer support representative. Guidelines:
1. Be empathetic and understanding
2. Provide clear solutions to problems
3. Escalate when necessary
4. Maintain a positive, helpful tone
5. Follow company policies: {policies}`,

        greeting: `Hello! I'm here to help you today. How can I assist you?`,
        
        resolution: `I understand your concern about {issue}. Let me help you resolve this.`
      },

      sales: {
        system: `You are a knowledgeable sales assistant. Your role:
1. Understand customer needs through questions
2. Recommend appropriate products/services
3. Highlight benefits, not just features
4. Handle objections professionally
5. Guide towards a decision without being pushy

Product Information: {products}`,

        qualification: `To better assist you, could you tell me more about {topic}?`,
        
        recommendation: `Based on what you've told me, I'd recommend {product} because {reasons}.`
      },

      education: {
        system: `You are an educational assistant. Your approach:
1. Explain concepts clearly at the appropriate level
2. Use examples and analogies
3. Encourage questions
4. Check understanding
5. Provide additional resources when helpful

Subject Area: {subject}
Student Level: {level}`,

        explanation: `Let me explain {concept} in a way that makes sense.`,
        
        checkUnderstanding: `Does this explanation make sense? Would you like me to clarify anything?`
      },

      technical: {
        system: `You are a technical support specialist. Guidelines:
1. Provide accurate technical information
2. Use appropriate technical terminology
3. Offer step-by-step solutions
4. Include code examples when relevant
5. Suggest best practices

Technical Stack: {stack}
Expertise Level: {expertise}`,

        troubleshooting: `Let's troubleshoot {issue} step by step.`,
        
        solution: `Here's how to solve {problem}:
{steps}`
      }
    };
  }

  /**
   * Load industry-specific prompts
   */
  loadIndustryPrompts() {
    return {
      healthcare: {
        disclaimer: `I can provide general health information, but cannot diagnose or prescribe. 
Always consult with a healthcare professional for medical advice.`,
        
        system: `Provide health information while being clear about limitations.
Never diagnose conditions or recommend treatments.`
      },

      finance: {
        disclaimer: `This is general financial information, not personalized advice.
Consult a financial advisor for decisions.`,
        
        system: `Provide financial information accurately.
Include relevant disclaimers and risk warnings.`
      },

      legal: {
        disclaimer: `This is general legal information, not legal advice.
Consult an attorney for legal matters.`,
        
        system: `Provide general legal information only.
Always recommend consulting with a qualified attorney.`
      },

      ecommerce: {
        system: `Help customers find products, answer questions, and facilitate purchases.
Be knowledgeable about inventory, policies, and promotions.`
      },

      hospitality: {
        system: `Provide warm, welcoming assistance for guests.
Help with bookings, amenities, and local information.`
      },

      realestate: {
        system: `Assist with property information, scheduling viewings, and answering questions.
Be knowledgeable about listings, neighborhoods, and the buying/selling process.`
      }
    };
  }

  /**
   * Build a complete prompt with context
   */
  buildPrompt({
    template = 'default',
    industry = null,
    instructions = '',
    context = '',
    question = '',
    chatbotName = 'Assistant',
    variables = {}
  }) {
    // Get base template
    let systemPrompt = this.templates[template]?.system || this.templates.default.system;
    
    // Add industry-specific elements
    if (industry && this.industryPrompts[industry]) {
      const industryConfig = this.industryPrompts[industry];
      systemPrompt = `${industryConfig.system}\n\n${systemPrompt}`;
      
      if (industryConfig.disclaimer) {
        systemPrompt += `\n\nImportant: ${industryConfig.disclaimer}`;
      }
    }

    // Personalize with chatbot name
    systemPrompt = systemPrompt.replace(/You are/g, `You are ${chatbotName},`);

    // Add custom instructions
    if (instructions) {
      systemPrompt = systemPrompt.replace('{instructions}', instructions);
    }

    // Build the complete prompt
    let completePrompt = systemPrompt;

    // Add context for RAG
    if (context) {
      const ragTemplate = this.templates[template]?.ragContext || this.templates.default.ragContext;
      completePrompt = ragTemplate
        .replace('{context}', context)
        .replace('{instructions}', instructions)
        .replace('{question}', question);
    }

    // Replace any remaining variables
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`{${key}}`, 'g');
      completePrompt = completePrompt.replace(regex, variables[key]);
    });

    return completePrompt;
  }

  /**
   * Create a conversation prompt with memory
   */
  buildConversationPrompt({
    history = [],
    instructions = '',
    maxHistoryTokens = 2000,
    question = ''
  }) {
    // Summarize old history if too long
    const recentHistory = this.truncateHistory(history, maxHistoryTokens);
    
    // Format history
    const formattedHistory = recentHistory
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');

    return {
      system: this.templates.default.conversation.replace('{instructions}', instructions),
      context: formattedHistory,
      current: question
    };
  }

  /**
   * Truncate history to fit token limit
   */
  truncateHistory(history, maxTokens) {
    let totalTokens = 0;
    const truncated = [];
    
    // Start from most recent
    for (let i = history.length - 1; i >= 0; i--) {
      const messageTokens = Math.ceil(history[i].content.length / 3.5);
      
      if (totalTokens + messageTokens > maxTokens) {
        break;
      }
      
      truncated.unshift(history[i]);
      totalTokens += messageTokens;
    }

    // Add summary if we truncated
    if (truncated.length < history.length) {
      truncated.unshift({
        role: 'system',
        content: `[Previous ${history.length - truncated.length} messages summarized for context]`
      });
    }

    return truncated;
  }

  /**
   * Optimize prompt for specific model
   */
  optimizeForModel(prompt, model) {
    const optimizations = {
      'gemini-1.5-flash': {
        maxLength: 30000,
        style: 'conversational'
      },
      'gemini-1.5-pro': {
        maxLength: 50000,
        style: 'detailed'
      },
      'gemini-pro': {
        maxLength: 15000,
        style: 'concise'
      }
    };

    const config = optimizations[model] || optimizations['gemini-1.5-flash'];
    
    // Truncate if needed
    if (prompt.length > config.maxLength) {
      prompt = prompt.substring(0, config.maxLength) + '...';
    }

    // Adjust style
    if (config.style === 'concise') {
      prompt += '\n\nProvide a concise response.';
    } else if (config.style === 'detailed') {
      prompt += '\n\nProvide a comprehensive, detailed response.';
    }

    return prompt;
  }

  /**
   * Generate follow-up questions
   */
  generateFollowUps(context, response) {
    return [
      "Would you like more details about any part of this?",
      "Is there anything specific you'd like me to clarify?",
      "Do you have any other questions on this topic?"
    ];
  }

  /**
   * Create a prompt for specific task types
   */
  createTaskPrompt(taskType, data) {
    const taskPrompts = {
      summarize: `Summarize the following text concisely:\n\n${data.text}`,
      
      translate: `Translate the following from ${data.from} to ${data.to}:\n\n${data.text}`,
      
      analyze: `Analyze the following and provide insights:\n\n${data.text}`,
      
      extract: `Extract ${data.extractType} from the following:\n\n${data.text}`,
      
      rewrite: `Rewrite the following in a ${data.style} style:\n\n${data.text}`,
      
      answer: `Answer this question based on the context:\nContext: ${data.context}\nQuestion: ${data.question}`,
      
      classify: `Classify the following into categories ${data.categories}:\n\n${data.text}`,
      
      generate: `Generate ${data.type} about ${data.topic}${data.requirements ? ` with these requirements: ${data.requirements}` : ''}`
    };

    return taskPrompts[taskType] || `Process the following:\n\n${JSON.stringify(data)}`;
  }
}

// Singleton instance
let instance = null;

export const getPromptEngineer = () => {
  if (!instance) {
    instance = new PromptEngineer();
  }
  return instance;
};

export default PromptEngineer;