import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Gamepad2, TrendingUp, Play } from 'lucide-react';

const Dashboard = () => {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Welcome back, Player!</h1>
        <p className="text-muted-foreground">Ready to dominate the competition?</p>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickActionCard
          icon={Trophy}
          title="Tournaments"
          description="Join active competitions"
          to="/tournaments"
          color="primary"
        />
        <QuickActionCard
          icon={Gamepad2}
          title="Games"
          description="Browse available games"
          to="/games"
          color="secondary"
        />
        <QuickActionCard
          icon={TrendingUp}
          title="Leaderboards"
          description="Check your ranking"
          to="/leaderboards"
          color="accent"
        />
        <QuickActionCard
          icon={Play}
          title="Watch & Earn"
          description="Earn credits now"
          to="/watch-earn"
          color="primary"
        />
      </div>

      {/* Featured Tournaments */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Featured Tournaments</h2>
          <Link to="/tournaments">
            <Button variant="ghost">View All</Button>
          </Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Placeholder tournament cards - replace with actual data */}
          <TournamentCard
            name="Apex Legends Championship"
            game="Apex Legends"
            prizePool={5000}
            startDate="2025-11-01"
            participants={64}
          />
          <TournamentCard
            name="Valorant Masters"
            game="Valorant"
            prizePool={10000}
            startDate="2025-11-05"
            participants={32}
          />
          <TournamentCard
            name="CS2 Weekly Cup"
            game="Counter-Strike 2"
            prizePool={2500}
            startDate="2025-10-28"
            participants={128}
          />
        </div>
      </section>

      {/* Stats Overview */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Your Stats</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <StatCard label="Tournaments Entered" value="12" />
          <StatCard label="Total Winnings" value="750 Credits" />
          <StatCard label="Global Rank" value="#2,458" />
        </div>
      </section>
    </div>
  );
};

const QuickActionCard = ({
  icon: Icon,
  title,
  description,
  to,
  color,
}: {
  icon: any;
  title: string;
  description: string;
  to: string;
  color: string;
}) => (
  <Link to={to}>
    <Card className="hover:border-primary/50 transition-all duration-300 hover:scale-105 cursor-pointer">
      <CardContent className="p-6">
        <div className={`w-12 h-12 rounded-lg bg-${color}/10 flex items-center justify-center mb-4`}>
          <Icon className={`h-6 w-6 text-${color}`} />
        </div>
        <h3 className="font-semibold mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  </Link>
);

const TournamentCard = ({
  name,
  game,
  prizePool,
  startDate,
  participants,
}: {
  name: string;
  game: string;
  prizePool: number;
  startDate: string;
  participants: number;
}) => (
  <Card className="hover:border-primary/50 transition-all duration-300">
    <CardHeader>
      <CardTitle className="text-lg">{name}</CardTitle>
      <CardDescription>{game}</CardDescription>
    </CardHeader>
    <CardContent className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Prize Pool:</span>
        <span className="font-semibold text-primary">{prizePool} Credits</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Participants:</span>
        <span>{participants}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Starts:</span>
        <span>{new Date(startDate).toLocaleDateString()}</span>
      </div>
      <Button className="w-full mt-4" size="sm">Register Now</Button>
    </CardContent>
  </Card>
);

const StatCard = ({ label, value }: { label: string; value: string }) => (
  <Card>
    <CardContent className="p-6">
      <p className="text-sm text-muted-foreground mb-2">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
    </CardContent>
  </Card>
);

export default Dashboard;
