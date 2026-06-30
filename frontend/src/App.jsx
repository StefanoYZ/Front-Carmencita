import React from 'react';
import { MotionConfig } from 'framer-motion';
import { AuthProvider } from './context/AuthContext.jsx';
import AppRoutes from './routes/AppRoutes.jsx';
import AccessibilityFloatingButton from './components/accessibility/AccessibilityFloatingButton.jsx';

function App() {
  return (
    <MotionConfig reducedMotion="user">
      <AuthProvider>
        <AppRoutes />
        <AccessibilityFloatingButton />
      </AuthProvider>
    </MotionConfig>
  );
}

export default App;
