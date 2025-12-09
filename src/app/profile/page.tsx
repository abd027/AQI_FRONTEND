'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import MainLayout from '@/components/layout/main-layout';
import ProtectedRoute from '@/components/auth/protected-route';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle2, Mail, User as UserIcon } from 'lucide-react';
import { getCurrentUser } from '@/lib/api-client';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userData, setUserData] = useState(user);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const data = await getCurrentUser();
      setUserData(data);
    } catch (err) {
      console.error('Error loading user data:', err);
    }
  };

  if (!userData) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="flex flex-col gap-6 md:gap-8 p-4 md:p-6 lg:p-8 max-w-4xl mx-auto w-full">
          <div className="animate-slide-up">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Profile</h1>
            <p className="text-muted-foreground">Manage your account settings</p>
          </div>

          <Card className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={userData.email}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    value={userData.username}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Email Verification Status</Label>
                <div className="flex items-center gap-2">
                  {userData.is_verified ? (
                    <span className="text-sm text-green-600">Verified</span>
                  ) : (
                    <span className="text-sm text-yellow-600">Not Verified</span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Account Status</Label>
                <div className="flex items-center gap-2">
                  {userData.is_active ? (
                    <span className="text-sm text-green-600">Active</span>
                  ) : (
                    <span className="text-sm text-red-600">Inactive</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}

