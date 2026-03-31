import React, { useState, useRef, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { LoginScreen } from './components/LoginScreen';
import { AdminPage } from './components/AdminPage';
import { UserProfile } from './components/UserProfile';
import { personas } from './data/personas';
import { Message, User, Attachment } from './types';
import { GoogleGenAI } from '@google/genai';
import { authService } from './lib/auth';

// Lazy initialize Gemini API
let aiInstance: GoogleGenAI | null = null;
const getAI = () => {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    
    // Check if key is missing, "undefined" string, or too short to be a real key
    if (!apiKey || apiKey === 'undefined' || apiKey.trim() === '' || apiKey.length < 10) {
      const debugInfo = apiKey ? `(Key starts with: ${apiKey.substring(0, 3)}...)` : "(Key is missing)";
      throw new Error(`GEMINI_API_KEY is invalid or missing ${debugInfo}. Please go to the 'Secrets' panel (lock icon) in AI Studio and add a secret named 'GEMINI_API_KEY' with your valid API key.`);
    }
    
    aiInstance = new GoogleGenAI({ apiKey: apiKey.trim() });
  }
  return aiInstance;
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>(personas[0].id);
  const [messagesByPersona, setMessagesByPersona] = useState<Record<string, Message[]>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  
  // Store chat instances to maintain history for each persona
  const chatsRef = useRef<Record<string, any>>({});

  useEffect(() => {
    // Auto-login if user is stored and approved
    const storedUser = authService.getLoggedInUser();
    if (storedUser) {
      if (storedUser.status === 'approved') {
        setUser(storedUser);
      } else {
        // Clear session if user is pending or rejected
        authService.logout();
      }
    }
  }, []);

  const handleSelectPersona = (id: string) => {
    setSelectedPersonaId(id);
    setShowSidebar(false);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setShowAdmin(false);
    setShowProfile(false);
  };

  const getOrCreateChat = (personaId: string) => {
    if (!chatsRef.current[personaId]) {
      const persona = personas.find(p => p.id === personaId);
      if (persona) {
        const ai = getAI();
        chatsRef.current[personaId] = ai.chats.create({
          model: "gemini-flash-latest",
          config: {
            systemInstruction: persona.systemInstruction,
          }
        });
      }
    }
    return chatsRef.current[personaId];
  };

  const handleSendMessage = async (text: string, attachments?: Attachment[]) => {
    const persona = personas.find(p => p.id === selectedPersonaId);
    if (!persona) return;

    const newUserMsg: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date(),
      attachments,
    };

    setMessagesByPersona(prev => ({
      ...prev,
      [persona.id]: [...(prev[persona.id] || []), newUserMsg]
    }));

    setIsLoading(true);

    const maxRetries = 3;
    let retryCount = 0;

    const callGemini = async (): Promise<any> => {
      try {
        const ai = getAI();
        const chat = getOrCreateChat(persona.id);
        
        if (attachments && attachments.length > 0) {
          const parts: any[] = [];
          if (text) parts.push({ text });
          
          attachments.forEach(att => {
            if (att.data) {
              parts.push({
                inlineData: {
                  data: att.data,
                  mimeType: att.mimeType,
                }
              });
            }
          });

          const history = (messagesByPersona[persona.id] || []).map(m => ({
            role: m.sender === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }]
          }));
          
          return await ai.models.generateContent({
            model: "gemini-flash-latest",
            contents: [...history, { role: 'user', parts }],
            config: { systemInstruction: persona.systemInstruction }
          });
        } else {
          return await chat.sendMessage({ message: text });
        }
      } catch (error: any) {
        // Retry on rate limits (429) or transient server errors (500, 503)
        const isTransient = error?.message?.includes('429') || 
                            error?.message?.includes('500') || 
                            error?.message?.includes('503') ||
                            error?.message?.includes('fetch');
                            
        if (isTransient && retryCount < maxRetries) {
          retryCount++;
          const delay = Math.pow(2, retryCount) * 1000; // 2s, 4s, 8s
          console.log(`Retrying AI call (attempt ${retryCount}) after ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return callGemini();
        }
        throw error;
      }
    };

    try {
      const response = await callGemini();
      
      const newAiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: response.text || 'Sorry, I could not generate a response.',
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessagesByPersona(prev => ({
        ...prev,
        [persona.id]: [...(prev[persona.id] || []), newAiMsg]
      }));
    } catch (error: any) {
      console.error("Error calling Gemini:", error);
      let errorMessage = error?.message || 'An unknown error occurred';
      
      if (errorMessage.includes('429')) {
        errorMessage = "The AI is busy (Rate Limit). Please wait a few seconds and try again.";
      } else if (errorMessage.includes('500') || errorMessage.includes('503')) {
        errorMessage = "The AI server is temporarily unavailable. Please try again in a moment.";
      }

      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: `Error: ${errorMessage}`,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessagesByPersona(prev => ({
        ...prev,
        [persona.id]: [...(prev[persona.id] || []), errorMsg]
      }));
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <LoginScreen onLogin={setUser} />;
  }

  if (showAdmin && user.role === 'admin') {
    return <AdminPage onBack={() => setShowAdmin(false)} />;
  }

  const selectedPersona = personas.find(p => p.id === selectedPersonaId) || personas[0];
  const currentMessages = messagesByPersona[selectedPersonaId] || [];

  return (
    <div className="flex h-screen w-full bg-[#0a1014] overflow-hidden font-sans">
      {/* App Container - max width on large screens to look like WhatsApp Web */}
      <div className="flex w-full h-full max-w-[1600px] mx-auto shadow-2xl relative">
        {/* Sidebar */}
        <div className={`w-full md:w-[350px] lg:w-[400px] h-full flex-shrink-0 ${showSidebar ? 'block' : 'hidden md:block'}`}>
          <Sidebar
            user={user}
            personas={personas}
            selectedPersonaId={selectedPersonaId}
            onSelectPersona={handleSelectPersona}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onLogout={handleLogout}
            onOpenAdmin={() => setShowAdmin(true)}
            onOpenProfile={() => setShowProfile(true)}
          />
        </div>

        {/* Chat Area */}
        <div className={`flex-1 h-full min-w-0 ${!showSidebar ? 'block' : 'hidden md:block'}`}>
          <ChatArea
            persona={selectedPersona}
            messages={currentMessages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            onBack={() => setShowSidebar(true)}
          />
        </div>
      </div>
      
      {/* User Profile Modal */}
      {showProfile && (
        <UserProfile user={user} onClose={() => setShowProfile(false)} />
      )}
    </div>
  );
}
