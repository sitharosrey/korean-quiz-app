import { AuthService } from './auth';

// Utility function to clear all users and start fresh
export function clearAllUsers() {
  if (typeof window === 'undefined') {
    console.log('Cannot clear users on server side');
    return;
  }

  try {
    // Clear all users and sessions
    AuthService.clearAllUsers();
    
    // Also clear any other user-related data
    localStorage.removeItem('korean-flashcard-lessons');
    localStorage.removeItem('korean-flashcard-progress');
    localStorage.removeItem('korean-flashcard-settings');
    
    console.log('✅ All users and data cleared successfully!');
    console.log('🔄 Please refresh the page to see the changes.');
    console.log('📝 You can now create a new account from scratch.');
    
    // Refresh the page to reset the app state
    window.location.reload();
  } catch (error) {
    console.error('❌ Error clearing users:', error);
  }
}

// Utility function to debug current users
export function debugUsers() {
  if (typeof window === 'undefined') {
    console.log('Cannot debug users on server side');
    return;
  }

  try {
    const users = JSON.parse(localStorage.getItem('korean-flashcard-users') || '[]');
    const session = JSON.parse(localStorage.getItem('korean-flashcard-current-user-session') || 'null');
    
    console.log('👥 Current users:', users);
    console.log('🔐 Current session:', session);
    console.log('📊 Total users:', users.length);
    
    if (users.length > 0) {
      console.log('📋 User details:');
      users.forEach((user: { username: string; email: string; isActive: boolean }, index: number) => {
        console.log(`  ${index + 1}. Username: ${user.username}, Email: ${user.email}, Active: ${user.isActive}`);
      });
    }
  } catch (error) {
    console.error('❌ Error debugging users:', error);
  }
}

// Make it available globally for easy access
if (typeof window !== 'undefined') {
  (window as unknown as { clearAllUsers: typeof clearAllUsers; debugUsers: typeof debugUsers }).clearAllUsers = clearAllUsers;
  (window as unknown as { clearAllUsers: typeof clearAllUsers; debugUsers: typeof debugUsers }).debugUsers = debugUsers;
}
