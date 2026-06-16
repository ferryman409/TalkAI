import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { HomePage } from './pages/HomePage';
import { CharacterPlazaPage } from './pages/CharacterPlazaPage';
import { CharacterCreatePage } from './pages/CharacterCreatePage';
import { CharacterDetailPage } from './pages/CharacterDetailPage';
import { ChatPage } from './pages/ChatPage';
import { MemoryManagerPage } from './pages/MemoryManagerPage';
import { SettingsPage } from './pages/SettingsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'characters', element: <CharacterPlazaPage /> },
      { path: 'characters/create', element: <CharacterCreatePage /> },
      { path: 'characters/:id', element: <CharacterDetailPage /> },
      { path: 'characters/:id/edit', element: <CharacterCreatePage /> },
      { path: 'chat', element: <ChatPage /> },
      { path: 'chat/:conversationId', element: <ChatPage /> },
      { path: 'memories', element: <MemoryManagerPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
]);
