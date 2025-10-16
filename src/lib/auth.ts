import { User, UserSession, UserPreferences } from '@/types';

const STORAGE_KEYS = {
  USERS: 'korean-flashcard-users',
  CURRENT_USER: 'korean-flashcard-current-user',
  SESSIONS: 'korean-flashcard-sessions',
};

export class AuthService {
  // Generate a simple token (in a real app, this would be more secure)
  private static generateToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  // Generate a unique user ID
  private static generateUserId(): string {
    return 'user_' + Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  // Get all users from localStorage
  private static getUsers(): User[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USERS);
      if (!stored) return [];
      
      const users = JSON.parse(stored);
      return users.map((user: any) => ({
        ...user,
        createdAt: new Date(user.createdAt),
        lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt) : undefined,
      }));
    } catch (error) {
      console.error('Error loading users:', error);
      return [];
    }
  }

  // Save users to localStorage
  private static saveUsers(users: User[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    } catch (error) {
      console.error('Error saving users:', error);
    }
  }

  // Get current session
  private static getCurrentSession(): UserSession | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (!stored) return null;
      
      const session = JSON.parse(stored);
      return {
        ...session,
        expiresAt: new Date(session.expiresAt),
      };
    } catch (error) {
      console.error('Error loading current session:', error);
      return null;
    }
  }

  // Save current session
  private static saveCurrentSession(session: UserSession): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(session));
    } catch (error) {
      console.error('Error saving current session:', error);
    }
  }

  // Clear current session
  private static clearCurrentSession(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }

  // Validate email format
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate username format
  private static isValidUsername(username: string): boolean {
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
  }

  // Check if username is available
  private static isUsernameAvailable(username: string): boolean {
    const users = this.getUsers();
    return !users.some(user => user.username.toLowerCase() === username.toLowerCase());
  }

  // Check if email is available
  private static isEmailAvailable(email: string): boolean {
    const users = this.getUsers();
    return !users.some(user => user.email.toLowerCase() === email.toLowerCase());
  }

  // Register a new user
  static async register(userData: {
    username: string;
    email: string;
    displayName: string;
    password: string;
  }): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      // Validation
      if (!userData.username || !userData.email || !userData.displayName || !userData.password) {
        return { success: false, error: 'All fields are required' };
      }

      if (!this.isValidUsername(userData.username)) {
        return { success: false, error: 'Username must be 3-20 characters long and contain only letters, numbers, and underscores' };
      }

      if (!this.isValidEmail(userData.email)) {
        return { success: false, error: 'Please enter a valid email address' };
      }

      if (userData.password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters long' };
      }

      if (!this.isUsernameAvailable(userData.username)) {
        return { success: false, error: 'Username is already taken' };
      }

      if (!this.isEmailAvailable(userData.email)) {
        return { success: false, error: 'Email is already registered' };
      }

      // Create new user
      const newUser: User = {
        id: this.generateUserId(),
        username: userData.username,
        email: userData.email,
        displayName: userData.displayName,
        password: userData.password, // Store the password
        createdAt: new Date(),
        preferences: {
          theme: 'system',
          language: 'en',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          notifications: {
            email: true,
            browser: true,
            studyReminders: true,
          },
        },
        isActive: true,
      };

      // Save user
      const users = this.getUsers();
      users.push(newUser);
      this.saveUsers(users);
      
      console.log('User registered successfully:', {
        username: newUser.username,
        password: newUser.password,
        id: newUser.id
      });

      // Create session
      const session: UserSession = {
        userId: newUser.id,
        token: this.generateToken(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        isActive: true,
      };

      this.saveCurrentSession(session);

      return { success: true, user: newUser };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  }

  // Login user
  static async login(credentials: {
    username: string;
    password: string;
  }): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      console.log('Login attempt:', { username: credentials.username });
      
      if (!credentials.username || !credentials.password) {
        return { success: false, error: 'Username and password are required' };
      }

      const users = this.getUsers();
      console.log('Available users:', users.map(u => ({ username: u.username, isActive: u.isActive })));
      
      const user = users.find(u => 
        u.username.toLowerCase() === credentials.username.toLowerCase() && 
        u.isActive
      );

      if (!user) {
        console.log('User not found or inactive');
        return { success: false, error: 'Invalid username or password' };
      }

      // In a real app, you would hash and compare passwords
      // For this demo, we'll compare the plain text passwords
      console.log('Password comparison:', {
        storedPassword: user.password,
        enteredPassword: credentials.password,
        match: user.password === credentials.password
      });
      
      if (user.password !== credentials.password) {
        console.log('Password mismatch - login failed');
        return { success: false, error: 'Invalid username or password' };
      }

      // Update last login
      user.lastLoginAt = new Date();
      this.saveUsers(users);

      // Create session
      const session: UserSession = {
        userId: user.id,
        token: this.generateToken(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        isActive: true,
      };

      this.saveCurrentSession(session);

      return { success: true, user };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  }

  // Logout user
  static logout(): void {
    console.log('Logging out user');
    this.clearCurrentSession();
    console.log('Session cleared');
  }

  // Get current user
  static getCurrentUser(): User | null {
    const session = this.getCurrentSession();
    console.log('Getting current user, session:', session);
    
    if (!session || !session.isActive || session.expiresAt < new Date()) {
      console.log('Session invalid or expired, logging out');
      this.logout();
      return null;
    }

    const users = this.getUsers();
    const user = users.find(u => u.id === session.userId && u.isActive);
    
    if (!user) {
      console.log('User not found or inactive, logging out');
      this.logout();
      return null;
    }

    console.log('Current user found:', user.username);
    return user;
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  // Update user profile
  static async updateProfile(updates: Partial<{
    displayName: string;
    email: string;
    avatar: string;
    preferences: Partial<UserPreferences>;
  }>): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        return { success: false, error: 'Not authenticated' };
      }

      const users = this.getUsers();
      const userIndex = users.findIndex(u => u.id === currentUser.id);
      
      if (userIndex === -1) {
        return { success: false, error: 'User not found' };
      }

      // Validate email if being updated
      if (updates.email && updates.email !== currentUser.email) {
        if (!this.isValidEmail(updates.email)) {
          return { success: false, error: 'Please enter a valid email address' };
        }
        if (!this.isEmailAvailable(updates.email)) {
          return { success: false, error: 'Email is already registered' };
        }
      }

      // Update user
      users[userIndex] = {
        ...users[userIndex],
        ...updates,
        preferences: {
          ...users[userIndex].preferences,
          ...updates.preferences,
        },
      };

      this.saveUsers(users);

      return { success: true, user: users[userIndex] };
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: 'Profile update failed. Please try again.' };
    }
  }

  // Delete user account
  static async deleteAccount(): Promise<{ success: boolean; error?: string }> {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        return { success: false, error: 'Not authenticated' };
      }

      const users = this.getUsers();
      const updatedUsers = users.filter(u => u.id !== currentUser.id);
      this.saveUsers(updatedUsers);
      this.logout();

      return { success: true };
    } catch (error) {
      console.error('Account deletion error:', error);
      return { success: false, error: 'Account deletion failed. Please try again.' };
    }
  }

  // Clear all users (for development/testing purposes)
  static clearAllUsers(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(STORAGE_KEYS.USERS);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      console.log('All users cleared');
    } catch (error) {
      console.error('Error clearing users:', error);
    }
  }

}
