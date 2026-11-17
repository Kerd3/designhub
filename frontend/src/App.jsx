import { RouterProvider } from 'react-router';
import { ToastProvider } from '@/components/ui';
import { AuthProvider } from '@/context/AuthContext.jsx';
import { SettingsProvider } from '@/context/SettingsContext.jsx';
import { router } from './router.jsx';

export default function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </AuthProvider>
    </SettingsProvider>
  );
}
