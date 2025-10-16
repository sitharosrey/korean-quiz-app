import { AuthService } from './auth';

// Create a single demo user for testing
export function createDemoUser() {
  const demoUser = {
    username: 'demo',
    email: 'demo@example.com',
    displayName: 'Demo User',
    password: 'demo123',
  };

  // Check if demo user already exists by trying to get current user
  const currentUser = AuthService.getCurrentUser();
  
  // If no user is logged in, create the demo user
  if (!currentUser) {
    try {
      AuthService.register(demoUser);
      console.log('Demo user created: demo');
    } catch (error) {
      console.error('Failed to create demo user:', error);
    }
  }
}

// Demo user creation is now manual - no auto-creation
// Uncomment the line below if you want to create a demo user
// if (typeof window !== 'undefined') {
//   createDemoUser();
// }
