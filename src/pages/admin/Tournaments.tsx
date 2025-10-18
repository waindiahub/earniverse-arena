import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';

interface Tournament {
  id: string;
  title: string;
  status: string;
  entry_fee: number;
  prize_pool: number;
  max_participants: number;
  current_participants: number;
  start_date: string;
}

export default function AdminTournaments() {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, loading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchTournaments();
      
      const channel = supabase
        .channel('admin-tournaments')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tournaments' }, () => {
          fetchTournaments();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isAdmin]);

  async function fetchTournaments() {
    const { data } = await supabase
      .from('tournaments')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setTournaments(data);
  }

  if (loading || !isAdmin) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gradient">Manage Tournaments</h1>
          <Button onClick={() => navigate('/admin/tournaments/create')} className="btn-primary">
            <Plus className="mr-2 h-4 w-4" />
            Create Tournament
          </Button>
        </div>

        <div className="grid gap-4">
          {tournaments.map((tournament) => (
            <Card key={tournament.id} className="glass-card">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>{tournament.title}</span>
                  <span className="text-sm font-normal text-primary">{tournament.status}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Entry Fee</p>
                    <p className="font-bold">₹{tournament.entry_fee}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Prize Pool</p>
                    <p className="font-bold">₹{tournament.prize_pool}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Participants</p>
                    <p className="font-bold">{tournament.current_participants}/{tournament.max_participants}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Start Date</p>
                    <p className="font-bold">{new Date(tournament.start_date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm">Edit</Button>
                  <Button variant="outline" size="sm">View Details</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
