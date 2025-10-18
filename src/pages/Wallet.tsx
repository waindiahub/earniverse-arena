import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DollarSign, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function Wallet() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchWalletData();
      
      const channel = supabase
        .channel('wallet-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'wallet_transactions',
          filter: `user_id=eq.${user.id}`
        }, () => {
          fetchWalletData();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  async function fetchWalletData() {
    if (!user) return;

    const { data: txns } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (txns) {
      setTransactions(txns);
      const bal = txns.reduce((sum, t) => {
        return t.type === 'deposit' || t.type === 'prize_won'
          ? sum + Number(t.amount)
          : sum - Number(t.amount);
      }, 0);
      setBalance(bal);
    }
  }

  async function handleAddFunds() {
    if (!user || !amount || Number(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const { error } = await supabase
      .from('wallet_transactions')
      .insert({
        user_id: user.id,
        amount: Number(amount),
        type: 'deposit',
        status: 'completed',
        payment_method: 'UPI'
      });

    if (error) {
      toast.error('Failed to add funds');
      return;
    }

    toast.success('Funds added successfully!');
    setAmount('');
    fetchWalletData();
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-gradient">Wallet</h1>

        <Card className="glass-card mb-6">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-primary" />
              Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-gradient mb-6">
              ₹{balance.toFixed(2)}
            </div>

            <div className="flex gap-4">
              <Input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleAddFunds} className="btn-primary">
                <ArrowUpCircle className="mr-2 h-4 w-4" />
                Add Funds
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.map((txn) => (
                <div key={txn.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {txn.type === 'deposit' || txn.type === 'prize_won' ? (
                      <ArrowUpCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <ArrowDownCircle className="h-5 w-5 text-red-500" />
                    )}
                    <div>
                      <p className="font-medium capitalize">{txn.type.replace('_', ' ')}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(txn.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className={`font-bold ${
                    txn.type === 'deposit' || txn.type === 'prize_won' ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {txn.type === 'deposit' || txn.type === 'prize_won' ? '+' : '-'}
                    ₹{Number(txn.amount).toFixed(2)}
                  </div>
                </div>
              ))}

              {transactions.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No transactions yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
