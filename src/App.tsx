import { useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Toaster } from './components/ui/sonner';
import { AttendanceProvider } from './context/AttendanceContext';
import { EventProvider } from './context/EventContext';
import LoginPage from './components/LoginPage';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDashboard from './components/StudentDashboard';
import EventOrganizerDashboard from './components/EventOrganizerDashboard';
import AdminDashboard from './components/AdminDashboard';

export type UserRole = 'student' | 'teacher' | 'organizer' | 'admin' | null;

export interface User {
  name: string;
  role: UserRole;
  rollNo?: string;
  class?: string;
}

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  return (
    <AttendanceProvider>
      <EventProvider>
        <div className={theme === 'dark' ? 'dark' : ''}>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="fixed top-6 right-6 z-50 p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-gray-700" />
              ) : (
                <Sun className="w-5 h-5 text-yellow-400" />
              )}
            </button>

            {/* Main Content */}
            {!currentUser ? (
              <LoginPage onLogin={handleLogin} />
            ) : currentUser.role === 'teacher' ? (
              <TeacherDashboard user={currentUser} onLogout={handleLogout} />
            ) : currentUser.role === 'student' ? (
              <StudentDashboard user={currentUser} onLogout={handleLogout} />
            ) : currentUser.role === 'organizer' ? (
              <EventOrganizerDashboard user={currentUser} onLogout={handleLogout} />
            ) : currentUser.role === 'admin' ? (
              <AdminDashboard user={currentUser} onLogout={handleLogout} />
            ) : null}

            <Toaster position="top-right" />
          </div>
        </div>
      </EventProvider>
    </AttendanceProvider>
  );
}
