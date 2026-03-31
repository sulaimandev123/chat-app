import React from 'react';
import { Persona, User } from '../types';
import * as Icons from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
  user: User;
  personas: Persona[];
  selectedPersonaId: string;
  onSelectPersona: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onLogout: () => void;
  onOpenAdmin: () => void;
  onOpenProfile: () => void;
}

export function Sidebar({
  user,
  personas,
  selectedPersonaId,
  onSelectPersona,
  searchQuery,
  onSearchChange,
  onLogout,
  onOpenAdmin,
  onOpenProfile,
}: SidebarProps) {
  const filteredPersonas = personas.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full h-full flex flex-col bg-[#111b21] border-r border-[#222d34]">
      {/* Header */}
      <div className="h-[60px] bg-[#202c33] flex items-center px-4 justify-between shrink-0">
        <div 
          className="flex items-center gap-3 cursor-pointer hover:bg-[#2a3942] p-1.5 -ml-1.5 rounded-lg transition-colors"
          onClick={onOpenProfile}
          title="View Profile"
        >
          <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden">
            <Icons.User className="w-6 h-6 text-gray-300" />
          </div>
          <span className="text-[#e9edef] font-medium truncate max-w-[120px]">{user.name}</span>
        </div>
        <div className="flex gap-3 text-[#aebac1]">
          {user.role === 'admin' && (
            <button onClick={onOpenAdmin} className="hover:text-white transition-colors" title="Admin Dashboard">
              <Icons.Shield className="w-5 h-5" />
            </button>
          )}
          <button onClick={onLogout} className="hover:text-white transition-colors" title="Logout">
            <Icons.LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="p-2 bg-[#111b21] border-b border-[#222d34]">
        <div className="bg-[#202c33] flex items-center px-3 py-1.5 rounded-lg">
          <Icons.Search className="w-4 h-4 text-[#8696a0] mr-3" />
          <input
            type="text"
            placeholder="Search or start new chat"
            className="bg-transparent border-none outline-none text-[#d1d7db] w-full text-sm placeholder:text-[#8696a0]"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* Contact List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {filteredPersonas.map((persona) => {
          const Icon = (Icons as any)[persona.avatarIcon] || Icons.Bot;
          const isSelected = persona.id === selectedPersonaId;

          return (
            <div
              key={persona.id}
              onClick={() => onSelectPersona(persona.id)}
              className={cn(
                "flex items-center px-3 py-3 cursor-pointer hover:bg-[#202c33] transition-colors",
                isSelected && "bg-[#2a3942]"
              )}
            >
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center shrink-0 mr-4",
                  persona.color
                )}
              >
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0 border-b border-[#222d34] pb-3 pt-1">
                <div className="flex justify-between items-baseline mb-1">
                  <h2 className="text-[#e9edef] text-base truncate font-normal">
                    {persona.name}
                  </h2>
                </div>
                <p className="text-[#8696a0] text-sm truncate">
                  {persona.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
