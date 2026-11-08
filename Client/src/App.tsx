import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AppShell } from './components/layout/AppShell';
import { Auth } from './pages/Auth';
import { Home } from './pages/Home';
import { Search } from './pages/Search';
import { Notifications } from './pages/Notifications';
import { Chats } from './pages/Chats';
import { Profile } from './pages/Profile';
import { AnonymousRooms } from './pages/AnonymousRooms';
import { CreateStory } from './pages/CreateStory';

export function App() {
  return (
    <MotionConfig reducedMotion="user">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />

            <Route
              element={
                <ProtectedRoute>
                  <AppShell />
                </ProtectedRoute>
              }
            >
              <Route index element={<Home />} />
              <Route path="search" element={<Search />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="chats/:conversationId?" element={<Chats />} />
              <Route path="profile" element={<Profile />} />
              <Route path="profile/:username" element={<Profile />} />
              <Route path="rooms" element={<AnonymousRooms />} />
            </Route>

            <Route
              path="story/new"
              element={
                <ProtectedRoute>
                  <CreateStory />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </MotionConfig>
  );
}
