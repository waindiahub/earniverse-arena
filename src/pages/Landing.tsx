import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Trophy, Zap, Users, Coins } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-hero opacity-50" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              Compete. Win.{' '}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Earn Rewards.
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Join the ultimate esports platform. Compete in tournaments, climb leaderboards,
              and earn rewards just by watching.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button size="lg" className="bg-gradient-primary text-lg px-8 animate-glow-pulse">
                  Get Started Free
                </Button>
              </Link>
              <Link to="/tournaments">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  Browse Tournaments
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={Trophy}
              title="Compete"
              description="Join tournaments across multiple games and formats"
            />
            <FeatureCard
              icon={Users}
              title="Team Up"
              description="Form teams and compete together for glory"
            />
            <FeatureCard
              icon={Zap}
              title="Leaderboards"
              description="Climb the ranks and prove you're the best"
            />
            <FeatureCard
              icon={Coins}
              title="Watch & Earn"
              description="Earn credits by watching sponsored content"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">How It Works</h2>
          <div className="max-w-4xl mx-auto space-y-12">
            <Step
              number="1"
              title="Create Your Account"
              description="Sign up for free and set up your gaming profile"
            />
            <Step
              number="2"
              title="Find Tournaments"
              description="Browse available tournaments for your favorite games"
            />
            <Step
              number="3"
              title="Compete & Win"
              description="Register, compete, and earn your spot on the leaderboard"
            />
            <Step
              number="4"
              title="Earn Rewards"
              description="Watch ads or win tournaments to earn in-app credits"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary relative">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-primary-foreground/90">
              Join thousands of players competing for glory and rewards
            </p>
            <Link to="/signup">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Sign Up Now
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({
  icon: Icon,
  title,
  description,
}: {
  icon: any;
  title: string;
  description: string;
}) => (
  <div className="p-6 rounded-lg bg-gradient-card border border-border hover:border-primary/50 transition-all duration-300 hover:scale-105">
    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
      <Icon className="h-6 w-6 text-primary" />
    </div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

const Step = ({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) => (
  <div className="flex gap-6 items-start">
    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-xl font-bold text-primary-foreground">
      {number}
    </div>
    <div>
      <h3 className="text-2xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground text-lg">{description}</p>
    </div>
  </div>
);

export default Landing;
