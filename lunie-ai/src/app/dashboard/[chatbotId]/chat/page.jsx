// import LoginForm from '@/components/auth/LoginForm'
import ChatInterface from '@/components/chat/ChatInterface'

export default function ChatPage() {
  return <ChatInterface 
  chatbotId="9604f284-2cd9-4d4b-9857-a7b16991af1c"  // ← Make sure this is set
  chatbot={{ name: "My Assistant" }}
/>
}