'use client';

import { useState } from 'react';
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
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                      {...loginForm.register('email')}
                      id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    required
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
              <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                <div>
                  <Label htmlFor="register-name">Full Name</Label>
                  <Input
                    {...registerForm.register('fullName')}
                    id="register-name"
                    type="text"
                    placeholder="Your Name"
                    required
                  />
                  {registerForm.formState.errors.fullName && (
                    <p className="mt-1 text-sm text-red-600">{registerForm.formState.errors.fullName.message}</p>
                  )}
                </div>
                  <div>
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                      {...registerForm.register('email')}
                      id="register-email"
                    type="email"
                    placeholder="you@example.com"
                    required
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
                <Button type="submit" disabled={isLoading} className="w-full bg-amber-700 hover:bg-amber-800">
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

