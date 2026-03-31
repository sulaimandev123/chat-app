export type Persona = {
  id: string;
  name: string;
  description: string;
  systemInstruction: string;
  avatarIcon: string;
  color: string;
};

export type Attachment = {
  type: 'image' | 'audio' | 'file';
  url: string; // base64 or blob url
  mimeType: string;
  name?: string;
  data?: string; // base64 string without data url prefix
};

export type Message = {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  attachments?: Attachment[];
};

export type UserRole = 'admin' | 'user';
export type UserStatus = 'pending' | 'approved';

export type User = {
  id: string;
  name: string;
  username: string;
  password?: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string;
};
