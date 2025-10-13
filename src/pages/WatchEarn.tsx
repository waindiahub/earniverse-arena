import RewardedPlayer from '@/components/rewards/RewardedPlayer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Coins, Zap, Clock } from 'lucide-react';

const WatchEarn = () => {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Watch & Earn</h1>
        <p className="text-muted-foreground">
          Watch sponsored content and earn credits for your wallet
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RewardedPlayer />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoItem
                icon={Zap}
                title="Load Ad"
                description="Click to load a sponsored video"
              />
              <InfoItem
                icon={Clock}
                title="Watch"
                description="Watch the entire video (usually 15-30 seconds)"
              />
              <InfoItem
                icon={Coins}
                title="Earn"
                description="Receive credits instantly to your wallet"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Stats</CardTitle>
              <CardDescription>Today's earnings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ads Watched:</span>
                <span className="font-semibold">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Credits Earned:</span>
                <span className="font-semibold text-primary">0</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({
  icon: Icon,
  title,
  description,
}: {
  icon: any;
  title: string;
  description: string;
}) => (
  <div className="flex gap-3">
    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
      <Icon className="h-5 w-5 text-primary" />
    </div>
    <div>
      <h4 className="font-semibold">{title}</h4>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  </div>
);

export default WatchEarn;
