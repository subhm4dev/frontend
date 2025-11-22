'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginRequestSchema, RegisterRequestSchema } from '@ecom/shared-schemas';
import { useAuthStore } from '@/stores/auth-store';
import { useAuthModal } from '@/hooks/useAuthModal';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

/**
 * Unified Auth Modal Component
 * 
 * Single modal with tab switching between Login and Sign Up.
 * Defaults to Login tab.
 * Smooth tab transitions with Framer Motion.
 */
export function AuthModal() {
  const { isOpen, closeModal } = useAuthModal();
  const { login, register: registerUser, isLoading, error, clearError } = useAuthStore();
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [tenantIdAvailable, setTenantIdAvailable] = useState(true);

  // Check if tenantId is available when component mounts or when switching to register tab
  useEffect(() => {
    if (isOpen && activeTab === 'register') {
      const tenantId = typeof window !== 'undefined' 
        ? window.process?.env?.NEXT_PUBLIC_APP_TENANT_ID || process.env.NEXT_PUBLIC_APP_TENANT_ID
        : process.env.NEXT_PUBLIC_APP_TENANT_ID;
      setTenantIdAvailable(!!tenantId);
    }
  }, [isOpen, activeTab]);

  // Login form
  const loginForm = useForm({
    resolver: zodResolver(LoginRequestSchema),
  });

  // Register form
  const registerForm = useForm({
    resolver: zodResolver(RegisterRequestSchema),
    defaultValues: {
      role: 'CUSTOMER',
    },
  });

  const handleLogin = async (data) => {
    try {
      clearError();
      await login(data);
      loginForm.reset();
      closeModal();
    } catch (error) {
      
    }
  };

  const handleRegister = async (data) => {
    try {
      clearError();
      await registerUser(data);
      registerForm.reset();
      closeModal();
    } catch (error) {
      
    }
  };

  const handleClose = () => {
    loginForm.reset();
    registerForm.reset();
    clearError();
    setActiveTab('login');
    setShowPassword(false);
    closeModal();
  };

  const switchToRegister = () => {
    loginForm.reset();
    clearError();
    setActiveTab('register');
  };

  const switchToLogin = () => {
    registerForm.reset();
    clearError();
    setActiveTab('login');
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <DialogTitle className="sr-only">Authentication</DialogTitle>
        <DialogDescription className="sr-only">
          Login or register to access your account
        </DialogDescription>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-600 to-orange-700 p-6 text-white relative">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl mb-1 font-semibold">Welcome to Namaste Fab</h2>
            <p className="text-amber-100 text-sm">Experience India's finest handloom sarees</p>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(value) => {
            if (value === 'login') {
              switchToLogin();
            } else {
              switchToRegister();
            }
          }} className="p-6">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login">
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                <div>
                  <Label htmlFor="login-email">Email or Phone</Label>
                  <Input
                    {...loginForm.register('email')}
                    id="login-email"
                    type="text"
                    placeholder="you@example.com or +919876543210"
                  />
                  {loginForm.formState.errors.email && (
                    <p className="mt-1 text-sm text-red-600">{loginForm.formState.errors.email.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    {...loginForm.register('password')}
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    required
                  />
                  {loginForm.formState.errors.password && (
                    <p className="mt-1 text-sm text-red-600">{loginForm.formState.errors.password.message}</p>
                  )}
                </div>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                    {error}
                  </div>
                )}
                <Button type="submit" disabled={isLoading} className="w-full bg-amber-700 hover:bg-amber-800">
                  {isLoading ? 'Logging in...' : 'Login'}
                </Button>
              </form>
            </TabsContent>

            {/* Register Tab */}
            <TabsContent value="register">
              {!tenantIdAvailable && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md text-sm mb-4">
                  <p className="font-semibold mb-1">Registration Configuration Required</p>
                  <p className="text-sm">
                    Registration is currently unavailable. Please contact support or check your system configuration.
                  </p>
                </div>
              )}
              <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                <div>
                  <Label htmlFor="register-email">Email or Phone</Label>
                  <Input
                    {...registerForm.register('email')}
                    id="register-email"
                    type="text"
                    placeholder="you@example.com or +919876543210"
                    disabled={!tenantIdAvailable}
                  />
                  {registerForm.formState.errors.email && (
                    <p className="mt-1 text-sm text-red-600">{registerForm.formState.errors.email.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="register-password">Password</Label>
                  <Input
                    {...registerForm.register('password')}
                    id="register-password"
                    type="password"
                    placeholder="••••••••"
                    required
                    disabled={!tenantIdAvailable}
                  />
                  {registerForm.formState.errors.password && (
                    <p className="mt-1 text-sm text-red-600">{registerForm.formState.errors.password.message}</p>
                  )}
                </div>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                    {error}
                  </div>
                )}
                <Button 
                  type="submit" 
                  disabled={isLoading || !tenantIdAvailable} 
                  className="w-full bg-amber-700 hover:bg-amber-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Registering...' : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}

