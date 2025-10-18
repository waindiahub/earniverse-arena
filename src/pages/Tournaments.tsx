import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Users, DollarSign, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface Tournament {
  id: string;
  title: string;
  description: string;
  format: string;
  status: string;
  entry_fee: number;
  prize_pool: number;
  max_participants: number;
  current_participants: number;
  start_date: string;
  image_url: string;
}

export default function Tournaments() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchTournaments();
      
      const channel = supabase
        .channel('tournaments-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tournaments' }, () => {
          fetchTournaments();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  async function fetchTournaments() {
    let query = supabase
      .from('tournaments')
      .select('*')
      .order('start_date', { ascending: true });

    if (filter !== 'all') {
      query = query.eq('status', filter as any);
    }

    const { data } = await query;
    if (data) setTournaments(data);
  }

  async function joinTournament(tournamentId: string, entryFee: number) {
    if (!user) return;

    // Check wallet balance
    const { data: transactions } = await supabase
      .from('wallet_transactions')
      .select('amount, type')
      .eq('user_id', user.id);

    const balance = transactions?.reduce((sum, t) => {
      return t.type === 'deposit' || t.type === 'prize_won' 
        ? sum + Number(t.amount)
        : sum - Number(t.amount);
    }, 0) || 0;

    if (balance < entryFee) {
      toast.error('Insufficient balance. Please add funds to your wallet.');
      return;
    }

    // Join tournament
    const { error: joinError } = await supabase
      .from('tournament_participants')
      .insert({ tournament_id: tournamentId, user_id: user.id });

    if (joinError) {
      toast.error('Failed to join tournament');
      return;
    }

    // Deduct entry fee
    await supabase
      .from('wallet_transactions')
      .insert({
        user_id: user.id,
        amount: entryFee,
        type: 'tournament_entry',
        status: 'completed',
        tournament_id: tournamentId
      });

    // Update participant count - done via database trigger or manually
    const { data: tournament } = await supabase
      .from('tournaments')
      .select('current_participants')
      .eq('id', tournamentId)
      .single();
    
    if (tournament) {
      await supabase
        .from('tournaments')
        .update({ current_participants: tournament.current_participants + 1 })
        .eq('id', tournamentId);
    }

    toast.success('Successfully joined tournament!');
    fetchTournaments();
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-gradient">Tournaments</h1>

        <div className="flex gap-2 mb-6 overflow-x-auto">
          {['all', 'registration_open', 'upcoming', 'ongoing', 'completed'].map((status) => (
            <Button
              key={status}
              variant={filter === status ? 'default' : 'outline'}
              onClick={() => setFilter(status)}
              className="whitespace-nowrap"
            >
              {status.replace('_', ' ').toUpperCase()}
            </Button>
          ))}
        </div>

        <div className="grid gap-4">
          {tournaments.map((tournament) => (
            <Card key={tournament.id} className="glass-card hover-glow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  {tournament.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{tournament.description}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Entry Fee</p>
                      <p className="font-bold">₹{tournament.entry_fee}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Prize Pool</p>
                      <p className="font-bold">₹{tournament.prize_pool}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Slots</p>
                      <p className="font-bold">{tournament.current_participants}/{tournament.max_participants}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Format</p>
                      <p className="font-bold uppercase">{tournament.format}</p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => joinTournament(tournament.id, tournament.entry_fee)}
                  disabled={tournament.status !== 'registration_open'}
                  className="w-full btn-primary"
                >
                  {tournament.status === 'registration_open' ? 'Join Now' : tournament.status.toUpperCase()}
                </Button>
              </CardContent>
            </Card>
          ))}

          {tournaments.length === 0 && (
            <Card className="glass-card">
              <CardContent className="text-center py-12">
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No tournaments available</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
