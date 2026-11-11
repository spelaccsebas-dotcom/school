import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function Admin() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (currentUser.role !== 'admin') {
          window.location.href = '/';
          return;
        }
        setUser(currentUser);
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    checkAuth();
  }, []);

  const handleInvite = async () => {
    if (!email) {
      toast.error('Vul een email adres in');
      return;
    }

    setLoading(true);
    try {
      await base44.users.inviteUser(email, role);
      toast.success(`Uitnodiging verstuurd naar ${email}`);
      setEmail('');
      setRole('user');
    } catch (error) {
      toast.error('Fout bij uitnodigen: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Laden...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <Shield className="w-10 h-10 text-purple-400" />
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Admin Panel</h1>
          </div>
          <p className="text-slate-400">Beheer gebruikers en instellingen</p>
        </motion.div>

        <Card className="bg-slate-900/50 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Gebruiker Uitnodigen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Email Adres</label>
              <Input
                type="email"
                placeholder="bijv. gebruiker@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Rol</label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Gebruiker</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleInvite}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {loading ? 'Versturen...' : 'Uitnodiging Versturen'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}