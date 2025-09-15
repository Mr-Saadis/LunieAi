// // public/widget.js - Standalone widget script for external websites
// (function() {
//   'use strict';

//   // Prevent duplicate initialization
//   if (window.LunieAiWidget) return;

//   class LunieAiWidget {
//     constructor() {
//       this.config = null;
//       this.isInitialized = false;
//       this.shadowRoot = null;
//       this.conversations = new Map();
//       this.currentConversationId = null;
//     }

//     async init(config) {
//       if (this.isInitialized) return;
      
//       this.config = {
//         position: 'bottom-right',
//         theme: 'default',
//         primaryColor: '#3B82F6',
//         welcomeMessage: 'Hi! How can I help you today?',
//         placeholder: 'Type your message...',
//         showPoweredBy: true,
//         maxHeight: '500px',
//         maxWidth: '400px',
//         ...config
//       };

//       try {
//         // Validate chatbot access
//         // const isValid = await this.validateAccess();
//         const isValid = true; // Development bypass
//         if (!isValid) {
//           console.warn('Lunie-Ai Widget: Access denied for this domain');
//           return;
//         }

//         // Fetch widget configuration
//         const widgetConfig = await this.fetchConfig();
//         this.config = { ...this.config, ...widgetConfig };

//         // Create widget container
//         this.createWidget();
//         this.isInitialized = true;

//         console.log('Lunie-Ai Widget initialized successfully');
//       } catch (error) {
//         console.error('Lunie-Ai Widget initialization failed:', error);
//         this.showError('Failed to initialize chat widget');
//       }
//     }

//     async validateAccess() {
//       try {
//         const response = await fetch(`${this.config.apiUrl}/api/widget/validate/${this.config.chatbotId}`, {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({
//             origin: window.location.origin
//           })
//         });

//         const result = await response.json();
//         return result.valid;
//       } catch (error) {
//         console.error('Widget validation error:', error);
//         return false;
//       }
//     }

//     async fetchConfig() {
//       try {
//         const response = await fetch(`${this.config.apiUrl}/api/widget/config/${this.config.chatbotId}`, {
//           headers: {
//             'Origin': window.location.origin
//           }
//         });

//         if (!response.ok) {
//           throw new Error('Failed to fetch widget configuration');
//         }

//         return await response.json();
//       } catch (error) {
//         console.error('Widget config fetch error:', error);
//         return {};
//       }
//     }

//     createWidget() {
//       // Create widget container with shadow DOM for style isolation
//       const container = document.createElement('div');
//       container.id = 'lunieai-widget-container';
//       container.style.cssText = `
//         position: fixed;
//         z-index: 999999;
//         ${this.getPositionStyles()}
//         font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
//         pointer-events: none;
//       `;

//       // Create shadow DOM for style isolation
//       this.shadowRoot = container.attachShadow({ mode: 'open' });
      
//       // Add styles to shadow DOM
//       const styles = this.createStyles();
//       this.shadowRoot.appendChild(styles);

//       // Create widget elements
//       const widget = this.createWidgetElements();
//       this.shadowRoot.appendChild(widget);

//       // Add to page
//       document.body.appendChild(container);

//       // Bind events
//       this.bindEvents();
//     }

//     getPositionStyles() {
//       switch (this.config.position) {
//         case 'bottom-left':
//           return 'bottom: 20px; left: 20px;';
//         case 'bottom-right':
//           return 'bottom: 20px; right: 20px;';
//         case 'top-right':
//           return 'top: 20px; right: 20px;';
//         case 'top-left':
//           return 'top: 20px; left: 20px;';
//         default:
//           return 'bottom: 20px; right: 20px;';
//       }
//     }

//     createStyles() {
//       const style = document.createElement('style');
//       style.textContent = `
//         * {
//           box-sizing: border-box;
//         }

//         .widget-container {
//           pointer-events: auto;
//         }

//         .widget-button {
//           width: 60px;
//           height: 60px;
//           border-radius: 50%;
//           background: ${this.config.primaryColor};
//           border: none;
//           cursor: pointer;
//           box-shadow: 0 4px 12px rgba(0,0,0,0.15);
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           transition: all 0.3s ease;
//           color: white;
//           position: relative;
//         }
        
//         .widget-button:hover {
//           transform: translateY(-2px);
//           box-shadow: 0 6px 20px rgba(0,0,0,0.2);
//         }

//         .notification-dot {
//           position: absolute;
//           top: -2px;
//           right: -2px;
//           width: 12px;
//           height: 12px;
//           background: #ef4444;
//           border-radius: 50%;
//           border: 2px solid white;
//           animation: pulse 2s infinite;
//         }

//         @keyframes pulse {
//           0% { transform: scale(1); opacity: 1; }
//           50% { transform: scale(1.1); opacity: 0.7; }
//           100% { transform: scale(1); opacity: 1; }
//         }

//         .widget-chat {
//           position: absolute;
//           bottom: 80px;
//           right: 0;
//           width: 350px;
//           height: 500px;
//           background: white;
//           border-radius: 12px;
//           box-shadow: 0 8px 30px rgba(0,0,0,0.12);
//           display: none;
//           flex-direction: column;
//           overflow: hidden;
//           max-width: 90vw;
//           max-height: 80vh;
//           border: 1px solid #e5e7eb;
//         }

//         .widget-chat.open {
//           display: flex;
//           animation: slideUp 0.3s ease;
//         }

//         @keyframes slideUp {
//           from { opacity: 0; transform: translateY(20px); }
//           to { opacity: 1; transform: translateY(0); }
//         }

//         .chat-header {
//           background: ${this.config.primaryColor};
//           color: white;
//           padding: 16px;
//           display: flex;
//           align-items: center;
//           justify-content: space-between;
//           border-radius: 12px 12px 0 0;
//         }

//         .chat-header h3 {
//           margin: 0;
//           font-size: 16px;
//           font-weight: 600;
//         }

//         .chat-header p {
//           margin: 4px 0 0 0;
//           font-size: 12px;
//           opacity: 0.9;
//         }

//         .close-button {
//           background: none;
//           border: none;
//           color: white;
//           cursor: pointer;
//           padding: 4px;
//           border-radius: 4px;
//           opacity: 0.8;
//           transition: opacity 0.2s;
//         }

//         .close-button:hover {
//           opacity: 1;
//           background: rgba(255,255,255,0.1);
//         }

//         .chat-messages {
//           flex: 1;
//           overflow-y: auto;
//           padding: 16px;
//           background: #f9fafb;
//           display: flex;
//           flex-direction: column;
//           gap: 16px;
//         }

//         .chat-messages::-webkit-scrollbar {
//           width: 4px;
//         }

//         .chat-messages::-webkit-scrollbar-track {
//           background: #f1f1f1;
//         }

//         .chat-messages::-webkit-scrollbar-thumb {
//           background: #c1c1c1;
//           border-radius: 4px;
//         }

//         .welcome-message {
//           text-align: center;
//           padding: 20px;
//           color: #6b7280;
//         }

//         .welcome-message h4 {
//           margin: 0 0 8px 0;
//           color: #374151;
//           font-size: 16px;
//         }

//         .welcome-message p {
//           margin: 0;
//           font-size: 14px;
//           line-height: 1.5;
//         }

//         .chat-input {
//           padding: 16px;
//           border-top: 1px solid #e5e7eb;
//           background: white;
//           border-radius: 0 0 12px 12px;
//         }

//         .input-container {
//           display: flex;
//           gap: 8px;
//           align-items: center;
//         }

//         .input-field {
//           flex: 1;
//           padding: 12px 16px;
//           border: 1px solid #d1d5db;
//           border-radius: 24px;
//           outline: none;
//           font-size: 14px;
//           font-family: inherit;
//           resize: none;
//           max-height: 100px;
//         }

//         .input-field:focus {
//           border-color: ${this.config.primaryColor};
//           box-shadow: 0 0 0 3px ${this.config.primaryColor}20;
//         }

//         .send-button {
//           width: 40px;
//           height: 40px;
//           border-radius: 50%;
//           background: ${this.config.primaryColor};
//           border: none;
//           color: white;
//           cursor: pointer;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           transition: all 0.2s;
//           flex-shrink: 0;
//         }

//         .send-button:hover:not(:disabled) {
//           background: ${this.adjustColor(this.config.primaryColor, -20)};
//           transform: scale(1.05);
//         }

//         .send-button:disabled {
//           opacity: 0.5;
//           cursor: not-allowed;
//         }

//         .message {
//           display: flex;
//           align-items: flex-start;
//           gap: 8px;
//           max-width: 100%;
//         }

//         .message.user {
//           flex-direction: row-reverse;
//         }

//         .message-bubble {
//           max-width: 85%;
//           padding: 12px 16px;
//           border-radius: 18px;
//           font-size: 14px;
//           line-height: 1.4;
//           word-wrap: break-word;
//         }

//         .message.user .message-bubble {
//           background: ${this.config.primaryColor};
//           color: white;
//           border-bottom-right-radius: 4px;
//         }

//         .message.assistant .message-bubble {
//           background: white;
//           color: #374151;
//           border: 1px solid #e5e7eb;
//           border-bottom-left-radius: 4px;
//         }

//         .message.error .message-bubble {
//           background: #fef2f2;
//           color: #dc2626;
//           border: 1px solid #fecaca;
//         }

//         .avatar {
//           width: 32px;
//           height: 32px;
//           border-radius: 50%;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           font-size: 12px;
//           font-weight: 600;
//           flex-shrink: 0;
//         }

//         .user-avatar {
//           background: #f3f4f6;
//           color: #6b7280;
//         }

//         .bot-avatar {
//           background: ${this.config.primaryColor};
//           color: white;
//         }

//         .typing-indicator {
//           display: flex;
//           gap: 4px;
//           padding: 12px 16px;
//           align-items: center;
//         }

//         .typing-dot {
//           width: 8px;
//           height: 8px;
//           border-radius: 50%;
//           background: #9ca3af;
//           animation: typing 1.4s infinite;
//         }

//         .typing-dot:nth-child(2) { animation-delay: 0.2s; }
//         .typing-dot:nth-child(3) { animation-delay: 0.4s; }

//         @keyframes typing {
//           0%, 60%, 100% { transform: translateY(0); }
//           30% { transform: translateY(-6px); }
//         }

//         .powered-by {
//           text-align: center;
//           margin-top: 8px;
//         }

//         .powered-by a {
//           color: #9ca3af;
//           text-decoration: none;
//           font-size: 11px;
//           transition: color 0.2s;
//         }

//         .powered-by a:hover {
//           color: #6b7280;
//         }

//         .error-message {
//           background: #fef2f2;
//           border: 1px solid #fecaca;
//           color: #dc2626;
//           padding: 12px;
//           border-radius: 8px;
//           margin: 8px;
//           font-size: 13px;
//           text-align: center;
//         }

//         @media (max-width: 768px) {
//           .widget-chat {
//             width: 320px;
//             height: 450px;
//             bottom: 70px;
//           }
          
//           .widget-button {
//             width: 50px;
//             height: 50px;
//           }
//         }

//         @media (max-width: 480px) {
//           .widget-chat {
//             width: 90vw;
//             height: 70vh;
//             left: 5vw;
//             right: auto;
//             bottom: 70px;
//           }
//         }
//       `;
//       return style;
//     }

//     adjustColor(color, amount) {
//       // Simple color adjustment function
//       const num = parseInt(color.replace("#", ""), 16);
//       const amt = Math.round(2.55 * amount);
//       const R = (num >> 16) + amt;
//       const G = (num >> 8 & 0x00FF) + amt;
//       const B = (num & 0x0000FF) + amt;
//       return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
//         (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
//         (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
//     }

//     createWidgetElements() {
//       const widget = document.createElement('div');
//       widget.className = 'widget-container';
//       widget.innerHTML = `
//         <button class="widget-button" id="widget-toggle">
//           <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
//             <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
//           </svg>
//           <div class="notification-dot" id="notification-dot" style="display: none;"></div>
//         </button>

//         <div class="widget-chat" id="widget-chat">
//           <div class="chat-header">
//             <div>
//               <h3>${this.config.name || 'Chat Assistant'}</h3>
//               <p>We typically reply instantly</p>
//             </div>
//             <button id="close-chat" class="close-button">
//               <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
//                 <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
//               </svg>
//             </button>
//           </div>

//           <div class="chat-messages" id="chat-messages">
//             <div class="welcome-message">
//               <h4>👋 Welcome!</h4>
//               <p>${this.config.welcomeMessage || 'Hi! How can I help you today?'}</p>
//             </div>
//           </div>

//           <div class="chat-input">
//             <div class="input-container">
//               <textarea 
//                 class="input-field" 
//                 id="message-input"
//                 placeholder="${this.config.placeholder || 'Type your message...'}"
//                 maxlength="1000"
//                 rows="1"
//               ></textarea>
//               <button class="send-button" id="send-button">
//                 <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
//                   <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
//                 </svg>
//               </button>
//             </div>
//           </div>
//         </div>

//         ${this.config.showPoweredBy ? `
//           <div class="powered-by">
//             <a href="http://localhost:3000" target="_blank" rel="noopener noreferrer">
//               Powered by Lunie-Ai
//             </a>
//           </div>
//         ` : ''}
//       `;

//       return widget;
//     }

//     bindEvents() {
//       const toggleButton = this.shadowRoot.getElementById('widget-toggle');
//       const closeButton = this.shadowRoot.getElementById('close-chat');
//       const chatContainer = this.shadowRoot.getElementById('widget-chat');
//       const messageInput = this.shadowRoot.getElementById('message-input');
//       const sendButton = this.shadowRoot.getElementById('send-button');
//       const notificationDot = this.shadowRoot.getElementById('notification-dot');

//       let isOpen = false;

//       toggleButton.addEventListener('click', () => {
//         isOpen = !isOpen;
//         if (isOpen) {
//           chatContainer.classList.add('open');
//           messageInput.focus();
//           notificationDot.style.display = 'none';
//           toggleButton.innerHTML = `
//             <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
//               <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
//             </svg>
//           `;
//         } else {
//           chatContainer.classList.remove('open');
//           toggleButton.innerHTML = `
//             <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
//               <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
//             </svg>
//           `;
//         }
//       });

//       closeButton.addEventListener('click', () => {
//         isOpen = false;
//         chatContainer.classList.remove('open');
//         toggleButton.innerHTML = `
//           <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
//             <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
//           </svg>
//         `;
//       });

//       sendButton.addEventListener('click', () => {
//         this.sendMessage();
//       });

//       messageInput.addEventListener('keypress', (e) => {
//         if (e.key === 'Enter' && !e.shiftKey) {
//           e.preventDefault();
//           this.sendMessage();
//         }
//       });

//       // Auto-resize textarea
//       messageInput.addEventListener('input', () => {
//         messageInput.style.height = 'auto';
//         messageInput.style.height = Math.min(messageInput.scrollHeight, 100) + 'px';
//       });

//       // Show notification dot when chat is closed and new message comes
//       this.showNotification = () => {
//         if (!isOpen) {
//           notificationDot.style.display = 'block';
//         }
//       };
//     }

//     async sendMessage() {
//       const messageInput = this.shadowRoot.getElementById('message-input');
//       const messagesContainer = this.shadowRoot.getElementById('chat-messages');
//       const sendButton = this.shadowRoot.getElementById('send-button');
//       const message = messageInput.value.trim();

//       if (!message) return;

//       // Disable send button
//       sendButton.disabled = true;

//       // Add user message to UI
//       this.addMessage('user', message);
//       messageInput.value = '';
//       messageInput.style.height = 'auto';

//       // Show typing indicator
//       this.showTypingIndicator();

//       try {
//         // Send message to API
//         const response = await fetch(`${this.config.apiUrl}/api/chat`, {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({
//             message,
//             chatbotId: this.config.chatbotId,
//             conversationId: this.currentConversationId,
//             context: {
//               origin: window.location.origin,
//               userAgent: navigator.userAgent,
//               timestamp: new Date().toISOString(),
//               sessionId: this.generateSessionId()
//             }
//           }),
//         });

//         const data = await response.json();

//         if (!response.ok) {
//           throw new Error(data.error || 'Failed to send message');
//         }

//         // Update conversation ID
//         if (data.data?.conversationId) {
//           this.currentConversationId = data.data.conversationId;
//         }

//         // Remove typing indicator and add response
//         this.hideTypingIndicator();
//         this.addMessage('assistant', data.data?.message || data.message || 'I received your message.');

//         // Show notification if chat is closed
//         this.showNotification();

//       } catch (error) {
//         console.error('Message send error:', error);
//         this.hideTypingIndicator();
//         this.addMessage('error', 'Sorry, I encountered an error. Please try again.');
//       } finally {
//         sendButton.disabled = false;
//       }
//     }

//     addMessage(role, content) {
//       const messagesContainer = this.shadowRoot.getElementById('chat-messages');
//       const messageElement = document.createElement('div');
//       messageElement.className = `message ${role}`;

//       const avatarClass = role === 'user' ? 'user-avatar' : 'bot-avatar';
//       const avatarText = role === 'user' ? 'U' : 'AI';

//       messageElement.innerHTML = `
//         <div class="avatar ${avatarClass}">${avatarText}</div>
//         <div class="message-bubble">${this.sanitizeHtml(content)}</div>
//       `;

//       messagesContainer.appendChild(messageElement);
//       messagesContainer.scrollTop = messagesContainer.scrollHeight;
//     }

//     showTypingIndicator() {
//       const messagesContainer = this.shadowRoot.getElementById('chat-messages');
//       const typingElement = document.createElement('div');
//       typingElement.className = 'message assistant';
//       typingElement.id = 'typing-indicator';
//       typingElement.innerHTML = `
//         <div class="avatar bot-avatar">AI</div>
//         <div class="message-bubble">
//           <div class="typing-indicator">
//             <div class="typing-dot"></div>
//             <div class="typing-dot"></div>
//             <div class="typing-dot"></div>
//           </div>
//         </div>
//       `;

//       messagesContainer.appendChild(typingElement);
//       messagesContainer.scrollTop = messagesContainer.scrollHeight;
//     }

//     hideTypingIndicator() {
//       const typingElement = this.shadowRoot.getElementById('typing-indicator');
//       if (typingElement) {
//         typingElement.remove();
//       }
//     }

//     showError(message) {
//       if (!this.shadowRoot) {
//         // Create simple error display
//         const errorDiv = document.createElement('div');
//         errorDiv.style.cssText = `
//           position: fixed;
//           bottom: 20px;
//           right: 20px;
//           background: #fef2f2;
//           border: 1px solid #fecaca;
//           color: #dc2626;
//           padding: 12px;
//           border-radius: 8px;
//           font-size: 13px;
//           z-index: 999999;
//           max-width: 300px;
//         `;
//         errorDiv.textContent = message;
//         document.body.appendChild(errorDiv);

//         // Auto remove after 5 seconds
//         setTimeout(() => {
//           if (errorDiv.parentNode) {
//             errorDiv.parentNode.removeChild(errorDiv);
//           }
//         }, 5000);
//       }
//     }

//     sanitizeHtml(content) {
//       const div = document.createElement('div');
//       div.textContent = content;
//       return div.innerHTML;
//     }

//     generateSessionId() {
//       return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
//     }
//   }

//   // Initialize widget
//   window.LunieAiWidget = new LunieAiWidget();

//   // Auto-initialize if config is already available
//   if (window.LunieAiConfig) {
//     window.LunieAiWidget.init(window.LunieAiConfig);
//   }
// })();

// // Widget CSS (to be served as separate file: public/widget.css)
// /* 
// This CSS can be included inline in the script above or served as a separate file.
// If serving separately, add this to public/widget.css:

// @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

// .lunieai-widget-container * {
//   font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
// }

// // Additional global styles can be added here if needed
// */



// public/widget.js - Standalone widget script with automatic config fetching



// (function() {
//   'use strict';

//   // Prevent duplicate initialization
//   if (window.LunieAiWidget) return;

//   class LunieAiWidget {
//     constructor() {
//       this.config = null;
//       this.isInitialized = false;
//       this.shadowRoot = null;
//       this.conversations = new Map();
//       this.currentConversationId = null;
//     }

//     async init(config) {
//       if (this.isInitialized) return;
      
//       // Default config - will be overridden by database settings
//       this.config = {
//         position: 'bottom-right',
//         theme: 'default',
//         primaryColor: '#3B82F6',
//         welcomeMessage: 'Hi! How can I help you today?',
//         placeholder: 'Type your message...',
//         showPoweredBy: true,
//         maxHeight: '500px',
//         maxWidth: '400px',
//         name: 'Chat Assistant',
//         ...config
//       };

//       try {
//         // STEP 1: Fetch chatbot-specific configuration from database
//         console.log('Fetching chatbot configuration...');
//         const chatbotConfig = await this.fetchChatbotConfig();
        
//         // Override defaults with database settings
//         if (chatbotConfig) {
//           this.config = {
//             ...this.config,
//             primaryColor: chatbotConfig.primaryColor || chatbotConfig.theme_color || this.config.primaryColor,
//             welcomeMessage: chatbotConfig.welcomeMessage || chatbotConfig.welcome_message || this.config.welcomeMessage,
//             name: chatbotConfig.name || this.config.name,
//             customIconUrl: chatbotConfig.chat_icon_url,
//             placeholder: chatbotConfig.placeholder || this.config.placeholder
//           };
//           console.log('Database config applied:', this.config);
//         }

//         // STEP 2: Validate access (bypassed for development)
//         const isValid = true; // Development bypass
//         if (!isValid) {
//           console.warn('Lunie-Ai Widget: Access denied for this domain');
//           return;
//         }

//         // STEP 3: Create widget with final configuration
//         this.createWidget();
//         this.isInitialized = true;

//         console.log('Lunie-Ai Widget initialized successfully');
//       } catch (error) {
//         console.error('Lunie-Ai Widget initialization failed:', error);
//         // Fallback: Create widget with default settings
//         this.createWidget();
//         this.isInitialized = true;
//       }
//     }

//     /**
//      * NEW: Fetch chatbot configuration from database
//      */
//     async fetchChatbotConfig() {
//       try {
//         const response = await fetch(`${this.config.apiUrl}/api/widget/config/${this.config.chatbotId}`, {
//           headers: {
//             'Origin': window.location.origin
//           }
//         });

//         if (!response.ok) {
//           console.warn('Could not fetch chatbot config, using defaults');
//           return null;
//         }

//         const config = await response.json();
//         console.log('Fetched chatbot config:', config);
//         return config;
//       } catch (error) {
//         console.error('Error fetching chatbot config:', error);
//         return null;
//       }
//     }

//     async validateAccess() {
//       try {
//         const response = await fetch(`${this.config.apiUrl}/api/widget/validate/${this.config.chatbotId}`, {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({
//             origin: window.location.origin
//           })
//         });

//         const result = await response.json();
//         return result.valid;
//       } catch (error) {
//         console.error('Widget validation error:', error);
//         return false;
//       }
//     }

//     createWidget() {
//       // Create widget container with shadow DOM for style isolation
//       const container = document.createElement('div');
//       container.id = 'lunieai-widget-container';
//       container.style.cssText = `
//         position: fixed;
//         z-index: 999999;
//         ${this.getPositionStyles()}
//         font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
//         pointer-events: none;
//       `;

//       // Create shadow DOM for style isolation
//       this.shadowRoot = container.attachShadow({ mode: 'open' });
      
//       // Add styles to shadow DOM
//       const styles = this.createStyles();
//       this.shadowRoot.appendChild(styles);

//       // Create widget elements
//       const widget = this.createWidgetElements();
//       this.shadowRoot.appendChild(widget);

//       // Add to page
//       document.body.appendChild(container);

//       // Bind events
//       this.bindEvents();
//     }

//     getPositionStyles() {
//       switch (this.config.position) {
//         case 'bottom-left':
//           return 'bottom: 20px; left: 20px;';
//         case 'bottom-right':
//           return 'bottom: 20px; right: 20px;';
//         case 'top-right':
//           return 'top: 20px; right: 20px;';
//         case 'top-left':
//           return 'top: 20px; left: 20px;';
//         default:
//           return 'bottom: 20px; right: 20px;';
//       }
//     }

//     createStyles() {
//       const style = document.createElement('style');
//       style.textContent = `
//         * {
//           box-sizing: border-box;
//         }

//         .widget-container {
//           pointer-events: auto;
//         }

//         .widget-button {
//           width: 60px;
//           height: 60px;
//           border-radius: 50%;
//           background: ${this.config.primaryColor};
//           border: none;
//           cursor: pointer;
//           box-shadow: 0 4px 12px rgba(0,0,0,0.15);
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           transition: all 0.3s ease;
//           color: white;
//           position: relative;
//           overflow: hidden;
//         }
        
//         .widget-button:hover {
//           transform: translateY(-2px);
//           box-shadow: 0 6px 20px rgba(0,0,0,0.2);
//         }

//         .custom-icon {
//           width: 32px;
//           height: 32px;
//           border-radius: 50%;
//           object-fit: cover;
//         }

//         .notification-dot {
//           position: absolute;
//           top: -2px;
//           right: -2px;
//           width: 12px;
//           height: 12px;
//           background: #ef4444;
//           border-radius: 50%;
//           border: 2px solid white;
//           animation: pulse 2s infinite;
//         }

//         @keyframes pulse {
//           0% { transform: scale(1); opacity: 1; }
//           50% { transform: scale(1.1); opacity: 0.7; }
//           100% { transform: scale(1); opacity: 1; }
//         }

//         .widget-chat {
//           position: absolute;
//           bottom: 80px;
//           right: 0;
//           width: 350px;
//           height: 500px;
//           background: white;
//           border-radius: 12px;
//           box-shadow: 0 8px 30px rgba(0,0,0,0.12);
//           display: none;
//           flex-direction: column;
//           overflow: hidden;
//           max-width: 90vw;
//           max-height: 80vh;
//           border: 1px solid #e5e7eb;
//         }

//         .widget-chat.open {
//           display: flex;
//           animation: slideUp 0.3s ease;
//         }

//         @keyframes slideUp {
//           from { opacity: 0; transform: translateY(20px); }
//           to { opacity: 1; transform: translateY(0); }
//         }

//         .chat-header {
//           background: ${this.config.primaryColor};
//           color: white;
//           padding: 16px;
//           display: flex;
//           align-items: center;
//           justify-content: space-between;
//           border-radius: 12px 12px 0 0;
//         }

//         .chat-header h3 {
//           margin: 0;
//           font-size: 16px;
//           font-weight: 600;
//         }

//         .chat-header p {
//           margin: 4px 0 0 0;
//           font-size: 12px;
//           opacity: 0.9;
//         }

//         .close-button {
//           background: none;
//           border: none;
//           color: white;
//           cursor: pointer;
//           padding: 4px;
//           border-radius: 4px;
//           opacity: 0.8;
//           transition: opacity 0.2s;
//         }

//         .close-button:hover {
//           opacity: 1;
//           background: rgba(255,255,255,0.1);
//         }

//         .chat-messages {
//           flex: 1;
//           overflow-y: auto;
//           padding: 16px;
//           background: #f9fafb;
//           display: flex;
//           flex-direction: column;
//           gap: 16px;
//         }

//         .chat-messages::-webkit-scrollbar {
//           width: 4px;
//         }

//         .chat-messages::-webkit-scrollbar-track {
//           background: #f1f1f1;
//         }

//         .chat-messages::-webkit-scrollbar-thumb {
//           background: #c1c1c1;
//           border-radius: 4px;
//         }

//         .welcome-message {
//           text-align: center;
//           padding: 20px;
//           color: #6b7280;
//         }

//         .welcome-message h4 {
//           margin: 0 0 8px 0;
//           color: #374151;
//           font-size: 16px;
//         }

//         .welcome-message p {
//           margin: 0;
//           font-size: 14px;
//           line-height: 1.5;
//         }

//         .chat-input {
//           padding: 16px;
//           border-top: 1px solid #e5e7eb;
//           background: white;
//           border-radius: 0 0 12px 12px;
//         }

//         .input-container {
//           display: flex;
//           gap: 8px;
//           align-items: center;
//         }

//         .input-field {
//           flex: 1;
//           padding: 12px 16px;
//           border: 1px solid #d1d5db;
//           border-radius: 24px;
//           outline: none;
//           font-size: 14px;
//           font-family: inherit;
//           resize: none;
//           max-height: 100px;
//         }

//         .input-field:focus {
//           border-color: ${this.config.primaryColor};
//           box-shadow: 0 0 0 3px ${this.config.primaryColor}20;
//         }

//         .send-button {
//           width: 40px;
//           height: 40px;
//           border-radius: 50%;
//           background: ${this.config.primaryColor};
//           border: none;
//           color: white;
//           cursor: pointer;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           transition: all 0.2s;
//           flex-shrink: 0;
//         }

//         .send-button:hover:not(:disabled) {
//           background: ${this.adjustColor(this.config.primaryColor, -20)};
//           transform: scale(1.05);
//         }

//         .send-button:disabled {
//           opacity: 0.5;
//           cursor: not-allowed;
//         }

//         .message {
//           display: flex;
//           align-items: flex-start;
//           gap: 8px;
//           max-width: 100%;
//         }

//         .message.user {
//           flex-direction: row-reverse;
//         }

//         .message-bubble {
//           max-width: 85%;
//           padding: 12px 16px;
//           border-radius: 18px;
//           font-size: 14px;
//           line-height: 1.4;
//           word-wrap: break-word;
//         }

//         .message.user .message-bubble {
//           background: ${this.config.primaryColor};
//           color: white;
//           border-bottom-right-radius: 4px;
//         }

//         .message.assistant .message-bubble {
//           background: white;
//           color: #374151;
//           border: 1px solid #e5e7eb;
//           border-bottom-left-radius: 4px;
//         }

//         .message.error .message-bubble {
//           background: #fef2f2;
//           color: #dc2626;
//           border: 1px solid #fecaca;
//         }

//         .avatar {
//           width: 32px;
//           height: 32px;
//           border-radius: 50%;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           font-size: 12px;
//           font-weight: 600;
//           flex-shrink: 0;
//           overflow: hidden;
//         }

//         .user-avatar {
//           background: #f3f4f6;
//           color: #6b7280;
//         }

//         .bot-avatar {
//           background: ${this.config.primaryColor};
//           color: white;
//         }

//         .avatar-image {
//           width: 100%;
//           height: 100%;
//           object-fit: cover;
//         }

//         .typing-indicator {
//           display: flex;
//           gap: 4px;
//           padding: 12px 16px;
//           align-items: center;
//         }

//         .typing-dot {
//           width: 8px;
//           height: 8px;
//           border-radius: 50%;
//           background: #9ca3af;
//           animation: typing 1.4s infinite;
//         }

//         .typing-dot:nth-child(2) { animation-delay: 0.2s; }
//         .typing-dot:nth-child(3) { animation-delay: 0.4s; }

//         @keyframes typing {
//           0%, 60%, 100% { transform: translateY(0); }
//           30% { transform: translateY(-6px); }
//         }

//         .powered-by {
//           text-align: center;
//           margin-top: 8px;
//         }

//         .powered-by a {
//           color: #9ca3af;
//           text-decoration: none;
//           font-size: 11px;
//           transition: color 0.2s;
//         }

//         .powered-by a:hover {
//           color: #6b7280;
//         }

//         .error-message {
//           background: #fef2f2;
//           border: 1px solid #fecaca;
//           color: #dc2626;
//           padding: 12px;
//           border-radius: 8px;
//           margin: 8px;
//           font-size: 13px;
//           text-align: center;
//         }

//         @media (max-width: 768px) {
//           .widget-chat {
//             width: 320px;
//             height: 450px;
//             bottom: 70px;
//           }
          
//           .widget-button {
//             width: 50px;
//             height: 50px;
//           }
//         }

//         @media (max-width: 480px) {
//           .widget-chat {
//             width: 90vw;
//             height: 70vh;
//             left: 5vw;
//             right: auto;
//             bottom: 70px;
//           }
//         }
//       `;
//       return style;
//     }

//     adjustColor(color, amount) {
//       // Simple color adjustment function
//       const num = parseInt(color.replace("#", ""), 16);
//       const amt = Math.round(2.55 * amount);
//       const R = (num >> 16) + amt;
//       const G = (num >> 8 & 0x00FF) + amt;
//       const B = (num & 0x0000FF) + amt;
//       return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
//         (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
//         (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
//     }

//     createWidgetElements() {
//       const widget = document.createElement('div');
//       widget.className = 'widget-container';
      
//       // Determine button content - custom icon or default SVG
//       const buttonContent = this.config.customIconUrl 
//         ? `<img src="${this.config.customIconUrl}" alt="Chat" class="custom-icon" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
//            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style="display: none;">
//              <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
//            </svg>`
//         : `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
//              <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
//            </svg>`;

//       // Create avatar content for bot messages
//       const botAvatarContent = this.config.customIconUrl
//         ? `<img src="${this.config.customIconUrl}" alt="AI" class="avatar-image" onerror="this.style.display='none'; this.parentNode.innerHTML='AI';">`
//         : 'AI';

//       widget.innerHTML = `
//         <button class="widget-button" id="widget-toggle">
//           ${buttonContent}
//           <div class="notification-dot" id="notification-dot" style="display: none;"></div>
//         </button>

//         <div class="widget-chat" id="widget-chat">
//           <div class="chat-header">
//             <div>
//               <h3>${this.config.name}</h3>
//               <p>We typically reply instantly</p>
//             </div>
//             <button id="close-chat" class="close-button">
//               <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
//                 <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
//               </svg>
//             </button>
//           </div>

//           <div class="chat-messages" id="chat-messages">
//             <div class="welcome-message">
//               <h4>👋 Welcome!</h4>
//               <p>${this.config.welcomeMessage}</p>
//             </div>
//           </div>

//           <div class="chat-input">
//             <div class="input-container">
//               <textarea 
//                 class="input-field" 
//                 id="message-input"
//                 placeholder="${this.config.placeholder}"
//                 maxlength="1000"
//                 rows="1"
//               ></textarea>
//               <button class="send-button" id="send-button">
//                 <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
//                   <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
//                 </svg>
//               </button>
//             </div>
//           </div>
//         </div>

//         ${this.config.showPoweredBy ? `
//           <div class="powered-by">
//             <a href="http://localhost:3000" target="_blank" rel="noopener noreferrer">
//               Powered by Lunie-Ai
//             </a>
//           </div>
//         ` : ''}
//       `;

//       return widget;
//     }

//     bindEvents() {
//       const toggleButton = this.shadowRoot.getElementById('widget-toggle');
//       const closeButton = this.shadowRoot.getElementById('close-chat');
//       const chatContainer = this.shadowRoot.getElementById('widget-chat');
//       const messageInput = this.shadowRoot.getElementById('message-input');
//       const sendButton = this.shadowRoot.getElementById('send-button');
//       const notificationDot = this.shadowRoot.getElementById('notification-dot');

//       let isOpen = false;

//       toggleButton.addEventListener('click', () => {
//         isOpen = !isOpen;
//         if (isOpen) {
//           chatContainer.classList.add('open');
//           messageInput.focus();
//           notificationDot.style.display = 'none';
//           toggleButton.innerHTML = `
//             <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
//               <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
//             </svg>
//           `;
//         } else {
//           chatContainer.classList.remove('open');
//           // Restore original button content
//           const buttonContent = this.config.customIconUrl 
//             ? `<img src="${this.config.customIconUrl}" alt="Chat" class="custom-icon" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
//                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style="display: none;">
//                  <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
//                </svg>`
//             : `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
//                  <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
//                </svg>`;
//           toggleButton.innerHTML = buttonContent + '<div class="notification-dot" id="notification-dot" style="display: none;"></div>';
//         }
//       });

//       closeButton.addEventListener('click', () => {
//         isOpen = false;
//         chatContainer.classList.remove('open');
//         const buttonContent = this.config.customIconUrl 
//           ? `<img src="${this.config.customIconUrl}" alt="Chat" class="custom-icon" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
//              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style="display: none;">
//                <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
//              </svg>`
//           : `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
//                <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
//              </svg>`;
//         toggleButton.innerHTML = buttonContent + '<div class="notification-dot" id="notification-dot" style="display: none;"></div>';
//       });

//       sendButton.addEventListener('click', () => {
//         this.sendMessage();
//       });

//       messageInput.addEventListener('keypress', (e) => {
//         if (e.key === 'Enter' && !e.shiftKey) {
//           e.preventDefault();
//           this.sendMessage();
//         }
//       });

//       // Auto-resize textarea
//       messageInput.addEventListener('input', () => {
//         messageInput.style.height = 'auto';
//         messageInput.style.height = Math.min(messageInput.scrollHeight, 100) + 'px';
//       });

//       // Show notification dot when chat is closed and new message comes
//       this.showNotification = () => {
//         if (!isOpen) {
//           const dot = this.shadowRoot.getElementById('notification-dot');
//           if (dot) dot.style.display = 'block';
//         }
//       };
//     }

//     async sendMessage() {
//       const messageInput = this.shadowRoot.getElementById('message-input');
//       const messagesContainer = this.shadowRoot.getElementById('chat-messages');
//       const sendButton = this.shadowRoot.getElementById('send-button');
//       const message = messageInput.value.trim();

//       if (!message) return;

//       // Disable send button
//       sendButton.disabled = true;

//       // Add user message to UI
//       this.addMessage('user', message);
//       messageInput.value = '';
//       messageInput.style.height = 'auto';

//       // Show typing indicator
//       this.showTypingIndicator();

//       try {
//         // Send message to API
//         const response = await fetch(`${this.config.apiUrl}/api/chat`, {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({
//             message,
//             chatbotId: this.config.chatbotId,
//             conversationId: this.currentConversationId,
//             context: {
//               origin: window.location.origin,
//               userAgent: navigator.userAgent,
//               timestamp: new Date().toISOString(),
//               sessionId: this.generateSessionId()
//             }
//           }),
//         });

//         const data = await response.json();

//         if (!response.ok) {
//           throw new Error(data.error || 'Failed to send message');
//         }

//         // Update conversation ID
//         if (data.data?.conversationId) {
//           this.currentConversationId = data.data.conversationId;
//         }

//         // Remove typing indicator and add response
//         this.hideTypingIndicator();
//         this.addMessage('assistant', data.data?.message || data.message || 'I received your message.');

//         // Show notification if chat is closed
//         this.showNotification();

//       } catch (error) {
//         console.error('Message send error:', error);
//         this.hideTypingIndicator();
//         this.addMessage('error', 'Sorry, I encountered an error. Please try again.');
//       } finally {
//         sendButton.disabled = false;
//       }
//     }

//     addMessage(role, content) {
//       const messagesContainer = this.shadowRoot.getElementById('chat-messages');
//       const messageElement = document.createElement('div');
//       messageElement.className = `message ${role}`;

//       const avatarClass = role === 'user' ? 'user-avatar' : 'bot-avatar';
//       let avatarContent = role === 'user' ? 'U' : 'AI';
      
//       // Use custom icon for bot avatar if available
//       if (role === 'assistant' && this.config.customIconUrl) {
//         avatarContent = `<img src="${this.config.customIconUrl}" alt="AI" class="avatar-image" onerror="this.style.display='none'; this.parentNode.innerHTML='AI';">`;
//       }

//       messageElement.innerHTML = `
//         <div class="avatar ${avatarClass}">${avatarContent}</div>
//         <div class="message-bubble">${this.sanitizeHtml(content)}</div>
//       `;

//       messagesContainer.appendChild(messageElement);
//       messagesContainer.scrollTop = messagesContainer.scrollHeight;
//     }

//     showTypingIndicator() {
//       const messagesContainer = this.shadowRoot.getElementById('chat-messages');
//       const typingElement = document.createElement('div');
//       typingElement.className = 'message assistant';
//       typingElement.id = 'typing-indicator';
      
//       let avatarContent = 'AI';
//       if (this.config.customIconUrl) {
//         avatarContent = `<img src="${this.config.customIconUrl}" alt="AI" class="avatar-image" onerror="this.style.display='none'; this.parentNode.innerHTML='AI';">`;
//       }

//       typingElement.innerHTML = `
//         <div class="avatar bot-avatar">${avatarContent}</div>
//         <div class="message-bubble">
//           <div class="typing-indicator">
//             <div class="typing-dot"></div>
//             <div class="typing-dot"></div>
//             <div class="typing-dot"></div>
//           </div>
//         </div>
//       `;

//       messagesContainer.appendChild(typingElement);
//       messagesContainer.scrollTop = messagesContainer.scrollHeight;
//     }

//     hideTypingIndicator() {
//       const typingElement = this.shadowRoot.getElementById('typing-indicator');
//       if (typingElement) {
//         typingElement.remove();
//       }
//     }

//     showError(message) {
//       if (!this.shadowRoot) {
//         // Create simple error display
//         const errorDiv = document.createElement('div');
//         errorDiv.style.cssText = `
//           position: fixed;
//           bottom: 20px;
//           right: 20px;
//           background: #fef2f2;
//           border: 1px solid #fecaca;
//           color: #dc2626;
//           padding: 12px;
//           border-radius: 8px;
//           font-size: 13px;
//           z-index: 999999;
//           max-width: 300px;
//         `;
//         errorDiv.textContent = message;
//         document.body.appendChild(errorDiv);

//         // Auto remove after 5 seconds
//         setTimeout(() => {
//           if (errorDiv.parentNode) {
//             errorDiv.parentNode.removeChild(errorDiv);
//           }
//         }, 5000);
//       }
//     }

//     sanitizeHtml(content) {
//       const div = document.createElement('div');
//       div.textContent = content;
//       return div.innerHTML;
//     }

//     generateSessionId() {
//       return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
//     }
//   }

//   // Initialize widget
//   window.LunieAiWidget = new LunieAiWidget();

//   // Auto-initialize if config is already available
//   if (window.LunieAiConfig) {
//     window.LunieAiWidget.init(window.LunieAiConfig);
//   }
// })();

/**
 * LunieAI Enhanced Chat Widget - UI Improved + Database Icon Integration
 * Features: Better mobile UI, database icon loading, enhanced animations
 */
(function() {
  'use strict';

  // Prevent duplicate initialization
  if (window.LunieAiWidget) return;

  class LunieAiWidget {
    constructor() {
      this.config = null;
      this.isInitialized = false;
      this.shadowRoot = null;
      this.isOpen = false;
      this.currentConversationId = null;
      this.sessionId = this.generateSessionId();
      this.isProcessingMessage = false;
    }

    async init(config) {
      if (this.isInitialized) {
        console.warn('LunieAI Widget already initialized');
        return;
      }
      
      // Default config - will be overridden by database settings
      this.config = {
        position: 'bottom-right',
        theme: 'default',
        primaryColor: '#3B82F6',
        welcomeMessage: 'Hi! How can I help you today?',
        placeholder: 'Type your message...',
        showPoweredBy: true,
        maxHeight: '500px',
        maxWidth: '400px',
        name: 'Chat Assistant',
        ...config
      };

      try {
        // Fetch chatbot-specific configuration from database
        console.log('Fetching chatbot configuration...');
        const chatbotConfig = await this.fetchChatbotConfig();
        
        // Override defaults with database settings
        if (chatbotConfig) {
          this.config = {
            ...this.config,
            primaryColor: chatbotConfig.theme_color || this.config.primaryColor,
            welcomeMessage: chatbotConfig.welcome_message || this.config.welcomeMessage,
            name: chatbotConfig.name || this.config.name,
            customIconUrl: chatbotConfig.chat_icon_url, // Database icon URL
            placeholder: chatbotConfig.placeholder || this.config.placeholder
          };
          console.log('Database config applied:', this.config);
        }

        // Validate access (bypassed for development)
        const isValid = true; // Development bypass
        if (!isValid) {
          console.warn('LunieAI Widget: Access denied for this domain');
          return;
        }

        // Create widget with final configuration
        this.createWidget();
        this.isInitialized = true;

        console.log('LunieAI Widget initialized successfully');
      } catch (error) {
        console.error('LunieAI Widget initialization failed:', error);
        // Fallback: Create widget with default settings
        this.createWidget();
        this.isInitialized = true;
      }
    }

    /**
     * Fetch chatbot configuration from database
     */
    async fetchChatbotConfig() {
      try {
        const response = await fetch(`${this.config.apiUrl}/api/widget/config/${this.config.chatbotId}`, {
          headers: {
            'Origin': window.location.origin
          }
        });

        if (!response.ok) {
          console.warn('Could not fetch chatbot config, using defaults');
          return null;
        }

        const config = await response.json();
        console.log('Fetched chatbot config:', config);
        return config;
      } catch (error) {
        console.error('Error fetching chatbot config:', error);
        return null;
      }
    }

    async validateAccess() {
      try {
        const response = await fetch(`${this.config.apiUrl}/api/widget/validate/${this.config.chatbotId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            origin: window.location.origin
          })
        });

        const result = await response.json();
        return result.valid;
      } catch (error) {
        console.error('Widget validation error:', error);
        return false;
      }
    }

    createWidget() {
      // Create widget container with shadow DOM for style isolation
      const container = document.createElement('div');
      container.id = 'lunieai-widget-container';
      container.style.cssText = `
        position: fixed;
        z-index: 999999;
        ${this.getPositionStyles()}
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        pointer-events: none;
      `;

      // Create shadow DOM for style isolation
      this.shadowRoot = container.attachShadow({ mode: 'open' });
      
      // Add styles to shadow DOM
      const styles = this.createStyles();
      this.shadowRoot.appendChild(styles);

      // Create widget elements
      const widget = this.createWidgetElements();
      this.shadowRoot.appendChild(widget);

      // Add to page
      document.body.appendChild(container);

      // Bind events
      this.bindEvents();
    }

    getPositionStyles() {
      const isMobile = window.innerWidth <= 768;
      
      if (isMobile) {
        // Mobile: Full width bottom positioning
        return 'bottom: 10px; left: 10px; right: 10px;';
      }

      // Desktop positioning
      switch (this.config.position) {
        case 'bottom-left':
          return 'bottom: 20px; left: 20px;';
        case 'bottom-right':
          return 'bottom: 20px; right: 20px;';
        case 'top-right':
          return 'top: 20px; right: 20px;';
        case 'top-left':
          return 'top: 20px; left: 20px;';
        default:
          return 'bottom: 20px; right: 20px;';
      }
    }

    createStyles() {
      const style = document.createElement('style');
      style.textContent = `
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .widget-container {
          pointer-events: auto;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        /* Enhanced Widget Button */
        .widget-button {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, ${this.config.primaryColor}, ${this.adjustColor(this.config.primaryColor, -20)});
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          color: white;
          position: relative;
          overflow: hidden;
          z-index: 2;
        }
        
        .widget-button:hover {
          transform: translateY(-3px) scale(1.05);
          box-shadow: 0 8px 30px rgba(0,0,0,0.25);
        }

        .widget-button:active {
          transform: translateY(-1px) scale(1.02);
        }

        /* Custom Icon Styling */
        .custom-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid rgba(255,255,255,0.2);
        }

        /* Enhanced Notification Dot */
        .notification-dot {
          position: absolute;
          top: -3px;
          right: -3px;
          width: 14px;
          height: 14px;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          border-radius: 50%;
          border: 2px solid white;
          animation: pulse 2s infinite;
          box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
        }

        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }

        /* Enhanced Chat Window */
        .widget-chat {
          width: 100%;
          max-width: 380px;
          height: 520px;
          background: white;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.15);
          display: none;
          flex-direction: column;
          overflow: hidden;
          margin-bottom: 16px;
          border: 1px solid rgba(0,0,0,0.08);
          z-index: 1;
          backdrop-filter: blur(10px);
        }

        .widget-chat.open {
          display: flex;
          animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes slideUp {
          from { 
            opacity: 0; 
            transform: translateY(30px) scale(0.95); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }

        /* Enhanced Chat Header */
        .chat-header {
          background: linear-gradient(135deg, ${this.config.primaryColor}, ${this.adjustColor(this.config.primaryColor, -15)});
          color: white;
          padding: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
        }

        .chat-header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
          pointer-events: none;
        }

        .chat-header-content {
          position: relative;
          z-index: 1;
        }

        .chat-header h3 {
          font-size: 18px;
          font-weight: 600;
          margin: 0;
        }

        .chat-header p {
          margin: 4px 0 0 0;
          font-size: 13px;
          opacity: 0.9;
        }

        .close-button {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
          opacity: 0.8;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 1;
        }

        .close-button:hover {
          opacity: 1;
          background: rgba(255,255,255,0.15);
          transform: scale(1.1);
        }

        /* Enhanced Messages Area */
        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          background: linear-gradient(to bottom, #f8fafc, #f1f5f9);
          display: flex;
          flex-direction: column;
          gap: 16px;
          scroll-behavior: smooth;
        }

        .chat-messages::-webkit-scrollbar {
          width: 6px;
        }

        .chat-messages::-webkit-scrollbar-track {
          background: transparent;
        }

        .chat-messages::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #cbd5e1, #94a3b8);
          border-radius: 3px;
        }

        /* Enhanced Welcome Message */
        .welcome-message {
          text-align: center;
          padding: 30px 20px;
          color: #64748b;
          background: white;
          border-radius: 16px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          border: 1px solid #e2e8f0;
        }

        .welcome-message h4 {
          margin: 0 0 8px 0;
          color: #334155;
          font-size: 16px;
          font-weight: 600;
        }

        .welcome-message p {
          margin: 0;
          font-size: 14px;
          line-height: 1.6;
        }

        /* Enhanced Messages */
        .message {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          max-width: 100%;
          animation: messageSlide 0.3s ease-out;
        }

        @keyframes messageSlide {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .message.user {
          flex-direction: row-reverse;
        }

        .message-bubble {
          max-width: 80%;
          padding: 14px 18px;
          border-radius: 18px;
          font-size: 14px;
          line-height: 1.5;
          word-wrap: break-word;
          position: relative;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .message.user .message-bubble {
          background: linear-gradient(135deg, ${this.config.primaryColor}, ${this.adjustColor(this.config.primaryColor, -10)});
          color: white;
          border-bottom-right-radius: 6px;
        }

        .message.assistant .message-bubble {
          background: white;
          color: #334155;
          border: 1px solid #e2e8f0;
          border-bottom-left-radius: 6px;
        }

        .message.error .message-bubble {
          background: linear-gradient(135deg, #fef2f2, #fee2e2);
          color: #dc2626;
          border: 1px solid #fecaca;
        }

        /* Enhanced Avatars */
        .avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
          flex-shrink: 0;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .user-avatar {
          background: linear-gradient(135deg, #e2e8f0, #cbd5e1);
          color: #64748b;
        }

        .bot-avatar {
          background: linear-gradient(135deg, ${this.config.primaryColor}, ${this.adjustColor(this.config.primaryColor, -20)});
          color: white;
          border: 2px solid white;
        }

        .avatar-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* Enhanced Typing Indicator */
        .typing-indicator {
          display: flex;
          gap: 6px;
          padding: 14px 18px;
          align-items: center;
        }

        .typing-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: linear-gradient(135deg, #94a3b8, #64748b);
          animation: typing 1.4s infinite;
        }

        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes typing {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-8px); opacity: 1; }
        }

        /* Enhanced Input Area */
        .chat-input {
          padding: 20px;
          border-top: 1px solid #e2e8f0;
          background: white;
          position: relative;
        }

        .chat-input::before {
          content: '';
          position: absolute;
          top: 0;
          left: 20px;
          right: 20px;
          height: 1px;
          background: linear-gradient(to right, transparent, #e2e8f0, transparent);
        }

        .input-container {
          display: flex;
          gap: 12px;
          align-items: flex-end;
        }

        .input-field {
          flex: 1;
          padding: 14px 18px;
          border: 2px solid #e2e8f0;
          border-radius: 24px;
          outline: none;
          font-size: 14px;
          font-family: inherit;
          resize: none;
          max-height: 120px;
          min-height: 48px;
          transition: all 0.2s ease;
          background: #f8fafc;
        }

        .input-field:focus {
          border-color: ${this.config.primaryColor};
          background: white;
          box-shadow: 0 0 0 4px ${this.config.primaryColor}15;
        }

        .input-field::placeholder {
          color: #94a3b8;
        }

        .send-button {
          width: 48px;
          height: 48px;
          border-radius: 24px;
          background: linear-gradient(135deg, ${this.config.primaryColor}, ${this.adjustColor(this.config.primaryColor, -15)});
          border: none;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          flex-shrink: 0;
          box-shadow: 0 2px 12px ${this.config.primaryColor}40;
        }

        .send-button:hover:not(:disabled) {
          transform: scale(1.05);
          box-shadow: 0 4px 20px ${this.config.primaryColor}50;
        }

        .send-button:active:not(:disabled) {
          transform: scale(0.95);
        }

        .send-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        /* Enhanced Powered By */
        .powered-by {
          order: 3;
          padding: 12px 20px;
          background: white;
          border-top: 1px solid #e2e8f0;
          border-radius: 0 0 20px 20px;
        }

        .powered-by a {
          color: #94a3b8;
          text-decoration: none;
          font-size: 12px;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
        }

        .powered-by a:hover {
          color: ${this.config.primaryColor};
          transform: translateY(-1px);
        }

        /* Enhanced Mobile Responsive */
        @media (max-width: 768px) {
          .widget-container {
            align-items: stretch;
          }
          
          .widget-chat {
            width: 100%;
            max-width: none;
            height: 480px;
            border-radius: 20px 20px 0 0;
            margin-bottom: 0;
          }
          
          .widget-button {
            align-self: flex-end;
            margin-bottom: 16px;
            width: 52px;
            height: 52px;
          }
          
          .chat-messages {
            padding: 16px;
          }
          
          .chat-input {
            padding: 16px;
          }

          .powered-by {
            padding: 10px 16px;
          }
        }

        @media (max-width: 480px) {
          .widget-chat {
            height: 420px;
          }
          
          .widget-button {
            width: 48px;
            height: 48px;
          }
          
          .message-bubble {
            max-width: 85%;
          }
        }

        /* Error Fallback */
        .error-fallback {
          background: linear-gradient(135deg, #fef2f2, #fee2e2);
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 16px;
          border-radius: 12px;
          font-size: 13px;
          text-align: center;
          max-width: 300px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        /* Loading Animation */
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .loading {
          animation: spin 1s linear infinite;
        }
      `;
      return style;
    }

    adjustColor(color, amount) {
      // Enhanced color adjustment function
      const num = parseInt(color.replace("#", ""), 16);
      const amt = Math.round(2.55 * amount);
      const R = (num >> 16) + amt;
      const G = (num >> 8 & 0x00FF) + amt;
      const B = (num & 0x0000FF) + amt;
      return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
        (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }

    createWidgetElements() {
      const widget = document.createElement('div');
      widget.className = 'widget-container';
      
      // Enhanced button content with database icon support
      const buttonContent = this.config.customIconUrl 
        ? `<img src="${this.escapeHtml(this.config.customIconUrl)}" alt="Chat" class="custom-icon" 
             onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
             onload="this.nextElementSibling.style.display='none';">
           <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style="display: none;">
             <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
           </svg>`
        : `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
             <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
           </svg>`;

      widget.innerHTML = `
        <div class="widget-chat" id="widget-chat">
          <div class="chat-header">
            <div class="chat-header-content">
              <h3>${this.escapeHtml(this.config.name)}</h3>
              <p>We typically reply instantly</p>
            </div>
            <button id="close-chat" class="close-button" aria-label="Close chat">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>

          <div class="chat-messages" id="chat-messages" role="log" aria-live="polite">
            <div class="welcome-message">
              <h4>👋 Welcome!</h4>
              <p>${this.escapeHtml(this.config.welcomeMessage)}</p>
            </div>
          </div>

          <div class="chat-input">
            <div class="input-container">
              <textarea 
                class="input-field" 
                id="message-input"
                placeholder="${this.escapeHtml(this.config.placeholder)}"
                maxlength="1000"
                rows="1"
                aria-label="Type your message"
              ></textarea>
              <button class="send-button" id="send-button" aria-label="Send message">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              </button>
            </div>
          </div>

          ${this.config.showPoweredBy ? `
            <div class="powered-by">
              <a href="http://localhost:3000" target="_blank" rel="noopener noreferrer">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                Powered by LunieAI
              </a>
            </div>
          ` : ''}
        </div>

        <button class="widget-button" id="widget-toggle" aria-label="Toggle chat">
          ${buttonContent}
          <div class="notification-dot" id="notification-dot" style="display: none;"></div>
        </button>
      `;

      return widget;
    }

   bindEvents() {
  const toggleButton = this.shadowRoot?.getElementById('widget-toggle');
  const closeButton = this.shadowRoot?.getElementById('close-chat');
  const chatContainer = this.shadowRoot?.getElementById('widget-chat');
  const messageInput = this.shadowRoot?.getElementById('message-input');
  const sendButton = this.shadowRoot?.getElementById('send-button');
  const notificationDot = this.shadowRoot?.getElementById('notification-dot');

  // Null checks add karo
  if (!toggleButton || !closeButton || !chatContainer || !messageInput || !sendButton) {
    console.error('Widget elements not found');
    return;
  }
      // Toggle chat open/close
      toggleButton.addEventListener('click', () => {
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
          chatContainer.classList.add('open');
          messageInput.focus();
          notificationDot.style.display = 'none';
          toggleButton.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
            <div class="notification-dot" id="notification-dot" style="display: none;"></div>
          `;
        } else {
          chatContainer.classList.remove('open');
          this.restoreButtonContent(toggleButton);
        }
      });

      // Close chat
      closeButton.addEventListener('click', () => {
        this.isOpen = false;
        chatContainer.classList.remove('open');
        this.restoreButtonContent(toggleButton);
      });

      // Send message
      sendButton.addEventListener('click', () => {
        this.sendMessage();
      });

      // Handle keyboard input
      messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });

      // Auto-resize textarea
      messageInput.addEventListener('input', () => {
        messageInput.style.height = 'auto';
        messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px';
      });

    
// Resize handler fix
window.addEventListener('resize', this.debounce(() => {
  if (this.shadowRoot) {
    const widgetContainer = this.shadowRoot.querySelector('.widget-container');
    const container = widgetContainer?.parentElement;
    if (container) {
      container.style.cssText = `...`;
    }
  }
}, 250));

      // Show notification dot when chat is closed and new message comes
      this.showNotification = () => {
        if (!this.isOpen) {
          const dot = this.shadowRoot.getElementById('notification-dot');
          if (dot) dot.style.display = 'block';
        }
      };
    }

    restoreButtonContent(toggleButton) {
      const buttonContent = this.config.customIconUrl 
        ? `<img src="${this.escapeHtml(this.config.customIconUrl)}" alt="Chat" class="custom-icon" 
             onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
             onload="this.nextElementSibling.style.display='none';">
           <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style="display: none;">
             <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
           </svg>`
        : `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
             <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
           </svg>`;
      toggleButton.innerHTML = buttonContent + '<div class="notification-dot" id="notification-dot" style="display: none;"></div>';
    }

    async sendMessage() {
      if (this.isProcessingMessage) return;

      const messageInput = this.shadowRoot.getElementById('message-input');
      const sendButton = this.shadowRoot.getElementById('send-button');
      const message = messageInput.value.trim();

      if (!message) return;

      this.isProcessingMessage = true;
      sendButton.disabled = true;

      // Add user message to UI
      this.addMessage('user', message);
      messageInput.value = '';
      messageInput.style.height = 'auto';

      // Show typing indicator
      this.showTypingIndicator();

      try {
        // Send message to API
        const response = await fetch(`${this.config.apiUrl}/api/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: this.escapeHtml(message),
            chatbotId: this.config.chatbotId,
            conversationId: this.currentConversationId,
            context: {
              origin: window.location.origin,
              userAgent: navigator.userAgent,
              timestamp: new Date().toISOString(),
              sessionId: this.sessionId
            }
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to send message');
        }

        // Update conversation ID
        if (data.data?.conversationId) {
          this.currentConversationId = data.data.conversationId;
        }

        // Remove typing indicator and add response
        this.hideTypingIndicator();
        this.addMessage('assistant', data.data?.message || data.message || 'I received your message.');

        // Show notification if chat is closed
        if (!this.isOpen) {
          this.showNotification();
        }

      } catch (error) {
        console.error('Message send error:', error);
        this.hideTypingIndicator();
        this.addMessage('error', 'Sorry, I encountered an error. Please try again.');
      } finally {
        this.isProcessingMessage = false;
        sendButton.disabled = false;
      }
    }

    addMessage(role, content) {
      const messagesContainer = this.shadowRoot.getElementById('chat-messages');
      const messageElement = document.createElement('div');
      messageElement.className = `message ${role}`;

      const avatarClass = role === 'user' ? 'user-avatar' : 'bot-avatar';
      let avatarContent = role === 'user' ? 'U' : this.getBotAvatarContent();

      messageElement.innerHTML = `
        <div class="avatar ${avatarClass}">${avatarContent}</div>
        <div class="message-bubble">${this.escapeHtml(content)}</div>
      `;

      messagesContainer.appendChild(messageElement);
      
      // Smooth scroll to bottom
      requestAnimationFrame(() => {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      });
    }

    getBotAvatarContent() {
      return this.config.customIconUrl
        ? `<img src="${this.escapeHtml(this.config.customIconUrl)}" alt="AI" class="avatar-image" 
             onerror="this.style.display='none'; this.parentNode.innerHTML='AI';">`
        : 'AI';
    }

    showTypingIndicator() {
      const messagesContainer = this.shadowRoot.getElementById('chat-messages');
      
      // Remove existing typing indicator if any
      this.hideTypingIndicator();
      
      const typingElement = document.createElement('div');
      typingElement.className = 'message assistant';
      typingElement.id = 'typing-indicator';
      
      typingElement.innerHTML = `
        <div class="avatar bot-avatar">${this.getBotAvatarContent()}</div>
        <div class="message-bubble">
          <div class="typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
          </div>
        </div>
      `;

      messagesContainer.appendChild(typingElement);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideTypingIndicator() {
      const typingElement = this.shadowRoot.getElementById('typing-indicator');
      if (typingElement) {
        typingElement.remove();
      }
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    /**
     * Generate unique session ID
     */
    generateSessionId() {
      return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Debounce function calls
     */
    debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    }

    /**
     * Show error fallback when widget fails to initialize
     */
    showErrorFallback(message) {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error-fallback';
      errorDiv.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: linear-gradient(135deg, #fef2f2, #fee2e2);
        border: 1px solid #fecaca;
        color: #dc2626;
        padding: 16px;
        border-radius: 12px;
        font-size: 13px;
        z-index: 999999;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      `;
      
      errorDiv.innerHTML = `
        <strong>Chat Widget Error</strong><br>
        ${this.escapeHtml(message)}
      `;
      
      document.body.appendChild(errorDiv);

      // Auto remove after 8 seconds
      setTimeout(() => {
        if (errorDiv.parentNode) {
          errorDiv.parentNode.removeChild(errorDiv);
        }
      }, 8000);
    }
  }

  // Initialize widget
  window.LunieAiWidget = new LunieAiWidget();

  // Auto-initialize if config is already available
  if (window.LunieAiConfig) {
    window.LunieAiWidget.init(window.LunieAiConfig);
  }

  // Debug utilities for development
  if (typeof window !== 'undefined') {
    window.LunieAiDebug = {
      getWidget: () => window.LunieAiWidget,
      getConfig: () => window.LunieAiWidget.config,
      isOpen: () => window.LunieAiWidget.isOpen,
      toggleChat: () => {
        const button = window.LunieAiWidget.shadowRoot?.getElementById('widget-toggle');
        if (button) button.click();
      }
    };
  }

})();
