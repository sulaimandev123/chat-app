import React, { useState, useRef, useEffect } from 'react';
import { Message, Persona, Attachment } from '../types';
import * as Icons from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';
import EmojiPicker, { Theme } from 'emoji-picker-react';

interface ChatAreaProps {
  persona: Persona;
  messages: Message[];
  onSendMessage: (text: string, attachments?: Attachment[]) => void;
  isLoading: boolean;
  onBack: () => void;
}

export function ChatArea({
  persona,
  messages,
  onSendMessage,
  isLoading,
  onBack,
}: ChatAreaProps) {
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<number | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((inputText.trim() || attachments.length > 0) && !isLoading) {
      onSendMessage(inputText.trim(), attachments.length > 0 ? attachments : undefined);
      setInputText('');
      setAttachments([]);
      setShowEmojiPicker(false);
    }
  };

  const handleEmojiClick = (emojiData: any) => {
    setInputText((prev) => prev + emojiData.emoji);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          const base64Data = result.split(',')[1];
          const isImage = file.type.startsWith('image/');
          
          setAttachments((prev) => [
            ...prev,
            {
              type: isImage ? 'image' : 'file',
              url: result,
              mimeType: file.type,
              name: file.name,
              data: base64Data,
            },
          ]);
        }
      };
      reader.readAsDataURL(file);
    });
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          if (result) {
            const base64Data = result.split(',')[1];
            setAttachments((prev) => [
              ...prev,
              {
                type: 'audio',
                url: result,
                mimeType: 'audio/webm',
                name: `Voice message (${formatDuration(recordingDuration)})`,
                data: base64Data,
              },
            ]);
          }
        };
        reader.readAsDataURL(audioBlob);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
        setRecordingDuration(0);
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      recordingTimerRef.current = window.setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
      
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const Icon = (Icons as any)[persona.avatarIcon] || Icons.Bot;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0b141a] relative">
      {/* Background pattern */}
      <div 
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: 'url("https://static.whatsapp.net/rsrc.php/v3/yl/r/r_QZ3O084wB.png")',
          backgroundRepeat: 'repeat',
        }}
      />

      {/* Header */}
      <div className="h-[60px] bg-[#202c33] flex items-center px-4 justify-between shrink-0 z-10">
        <div className="flex items-center cursor-pointer">
          <button onClick={onBack} className="md:hidden mr-3 text-[#aebac1] hover:text-white transition-colors">
            <Icons.ArrowLeft className="w-6 h-6" />
          </button>
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center mr-4",
              persona.color
            )}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-[#e9edef] text-base font-normal">{persona.name}</h2>
            <p className="text-[#8696a0] text-xs">AI Assistant</p>
          </div>
        </div>
        <div className="flex gap-4 text-[#aebac1]">
          <button className="hover:text-white transition-colors">
            <Icons.Search className="w-5 h-5" />
          </button>
          <button className="hover:text-white transition-colors">
            <Icons.MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 z-10 custom-scrollbar flex flex-col gap-2 relative">
        {messages.length === 0 && (
          <div className="flex justify-center my-4">
            <div className="bg-[#182229] text-[#8696a0] text-xs py-1.5 px-3 rounded-lg uppercase tracking-wider">
              Today
            </div>
          </div>
        )}
        
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={cn(
                "flex w-full",
                isUser ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] md:max-w-[75%] rounded-lg px-3 py-2 text-[15px] relative shadow-sm",
                  isUser ? "bg-[#005c4b] text-[#e9edef]" : "bg-[#202c33] text-[#e9edef]"
                )}
              >
                {/* Tail for message bubble */}
                <div className={cn(
                  "absolute top-0 w-3 h-3",
                  isUser ? "-right-2 text-[#005c4b]" : "-left-2 text-[#202c33]"
                )}>
                  <svg viewBox="0 0 8 13" width="8" height="13" className="fill-current">
                    {isUser ? (
                      <path d="M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z" />
                    ) : (
                      <path d="M1.533 3.568L8 12.193V1H2.812C1.042 1 .474 2.156 1.533 3.568z" />
                    )}
                  </svg>
                </div>

                {/* Attachments */}
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="flex flex-col gap-2 mb-2">
                    {msg.attachments.map((att, idx) => (
                      <div key={idx} className="rounded-md overflow-hidden bg-black/20 p-1">
                        {att.type === 'image' ? (
                          <img src={att.url} alt="attachment" className="max-w-full h-auto max-h-64 rounded object-contain" />
                        ) : att.type === 'audio' ? (
                          <div className="flex items-center gap-2 p-2">
                            <Icons.Mic className="w-5 h-5 text-[#00a884]" />
                            <audio src={att.url} controls className="h-8 max-w-[200px]" />
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 p-2">
                            <Icons.FileText className="w-5 h-5 text-[#8696a0]" />
                            <span className="text-sm truncate">{att.name || 'File'}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {msg.text && (
                  <div className="markdown-body text-sm text-[#e9edef] leading-relaxed break-words">
                    {isUser ? (
                      msg.text
                    ) : (
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    )}
                  </div>
                )}
                <div className="flex justify-end items-center mt-1 gap-1">
                  <span className="text-[11px] text-[#8696a0]">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {isUser && (
                    <Icons.CheckCheck className="w-4 h-4 text-[#53bdeb]" />
                  )}
                </div>
              </div>
            </div>
          );
        })}
        
        {isLoading && (
          <div className="flex w-full justify-start">
            <div className="bg-[#202c33] rounded-lg px-4 py-3 text-[15px] relative shadow-sm flex items-center gap-2">
               <div className="absolute top-0 -left-2 w-3 h-3 text-[#202c33]">
                  <svg viewBox="0 0 8 13" width="8" height="13" className="fill-current">
                    <path d="M1.533 3.568L8 12.193V1H2.812C1.042 1 .474 2.156 1.533 3.568z" />
                  </svg>
                </div>
              <div className="w-2 h-2 bg-[#8696a0] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-[#8696a0] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-[#8696a0] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Emoji Picker Overlay */}
      {showEmojiPicker && (
        <div className="absolute bottom-[70px] left-4 z-50">
          <EmojiPicker 
            onEmojiClick={handleEmojiClick}
            theme={Theme.DARK}
            style={{ backgroundColor: '#202c33', borderColor: '#222d34' }}
          />
        </div>
      )}

      {/* Input Area */}
      <div className="min-h-[62px] bg-[#202c33] px-4 py-2 flex flex-col z-10">
        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="flex gap-2 mb-2 overflow-x-auto py-2 custom-scrollbar">
            {attachments.map((att, idx) => (
              <div key={idx} className="relative w-16 h-16 bg-[#111b21] rounded-lg border border-[#222d34] flex items-center justify-center shrink-0 group">
                {att.type === 'image' ? (
                  <img src={att.url} alt="preview" className="w-full h-full object-cover rounded-lg" />
                ) : att.type === 'audio' ? (
                  <Icons.Mic className="w-6 h-6 text-[#00a884]" />
                ) : (
                  <Icons.File className="w-6 h-6 text-[#8696a0]" />
                )}
                <button 
                  onClick={() => removeAttachment(idx)}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-[#202c33] rounded-full flex items-center justify-center text-[#8696a0] hover:text-white border border-[#222d34] opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Icons.X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-3 w-full">
          <button 
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={cn("p-2 transition-colors shrink-0 mb-1", showEmojiPicker ? "text-[#00a884]" : "text-[#8696a0] hover:text-[#d1d7db]")}
          >
            <Icons.Smile className="w-6 h-6" />
          </button>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileSelect} 
            className="hidden" 
            multiple 
            accept="image/*,audio/*,.pdf,.txt"
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-[#8696a0] hover:text-[#d1d7db] transition-colors shrink-0 mb-1"
          >
            <Icons.Paperclip className="w-6 h-6" />
          </button>
          
          {isRecording ? (
            <div className="flex-1 flex items-center bg-[#2a3942] rounded-lg px-4 py-3 min-h-[44px] mb-1">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-3" />
              <span className="text-[#e9edef] flex-1">{formatDuration(recordingDuration)}</span>
              <button 
                onClick={stopRecording}
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                <Icons.Square className="w-5 h-5 fill-current" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSend} className="flex-1 flex items-end bg-[#2a3942] rounded-lg overflow-hidden mb-1">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Type a message"
                className="w-full bg-transparent text-[#e9edef] placeholder:text-[#8696a0] p-3 outline-none resize-none max-h-32 min-h-[44px] custom-scrollbar"
                rows={1}
                style={{ height: 'auto' }}
              />
            </form>
          )}

          {inputText.trim() || attachments.length > 0 ? (
            <button 
              onClick={() => handleSend()}
              disabled={isLoading}
              className="p-2 text-[#8696a0] hover:text-[#d1d7db] transition-colors shrink-0 mb-1 disabled:opacity-50"
            >
              <Icons.Send className="w-6 h-6" />
            </button>
          ) : (
            <button 
              onClick={isRecording ? stopRecording : startRecording}
              className={cn("p-2 transition-colors shrink-0 mb-1", isRecording ? "text-red-500" : "text-[#8696a0] hover:text-[#d1d7db]")}
            >
              <Icons.Mic className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
