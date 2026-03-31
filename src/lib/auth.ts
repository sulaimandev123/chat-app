import { User } from '../types';

const USERS_KEY = 'ai_chat_users';
const LOGGED_IN_USER_KEY = 'ai_chat_logged_in_user';

export const authService = {
  getUsers: (): User[] => {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  },
  
  saveUsers: (users: User[]) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },
  
  signup: (name: string, username: string, password: string): User => {
    const users = authService.getUsers();
    if (users.find(u => u.username === username)) {
      throw new Error('Username already exists');
    }
    
    const isFirstUser = users.length === 0;
    const newUser: User = {
      id: Date.now().toString(),
      name,
      username,
      password,
      role: isFirstUser ? 'admin' : 'user',
      status: isFirstUser ? 'approved' : 'pending',
    };
    
    users.push(newUser);
    authService.saveUsers(users);
    return newUser;
  },
  
  login: (username: string, password: string): User => {
    const users = authService.getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
      throw new Error('Invalid username or password');
    }
    localStorage.setItem(LOGGED_IN_USER_KEY, JSON.stringify(user));
    return user;
  },

  getLoggedInUser: (): User | null => {
    const data = localStorage.getItem(LOGGED_IN_USER_KEY);
    return data ? JSON.parse(data) : null;
  },

  logout: () => {
    localStorage.removeItem(LOGGED_IN_USER_KEY);
  },
  
  approveUser: (userId: string) => {
    const users = authService.getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      users[index].status = 'approved';
      authService.saveUsers(users);
    }
  },
  
  deleteUser: (userId: string) => {
    let users = authService.getUsers();
    users = users.filter(u => u.id !== userId);
    authService.saveUsers(users);
  }
};
