/**
 * Rewarded Video Player Component
 * 
 * This component handles the "Watch & Earn" flow:
 * 1. Request server-signed token
 * 2. Initialize ad SDK (Google IMA/VAST or your chosen provider)
 * 3. Play rewarded video ad
 * 4. On completion, claim reward via backend
 * 
 * INTEGRATION POINTS:
 * - Line ~50: Initialize your ad SDK (Google IMA, AdMob, etc.)
 * - Line ~80: Load and play actual ad
 * - Line ~100: Handle ad completion event
 * 
 * For web, you can use Google IMA SDK:
 * https://developers.google.com/interactive-media-ads/docs/sdks/html5/client-side
 * 
 * For mobile (React Native wrapper), use:
 * - Google AdMob: react-native-google-mobile-ads
 * - Unity Ads: react-native-unity-ads
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { rewardsApi } from '@/services/api';
import { toast } from 'sonner';

type AdState = 'idle' | 'requesting' | 'ready' | 'playing' | 'completed' | 'error';

const RewardedPlayer = () => {
  const [adState, setAdState] = useState<AdState>('idle');
  const [rewardToken, setRewardToken] = useState<string>('');
  const [earnedAmount, setEarnedAmount] = useState<number>(0);

  /**
   * Step 1: Request server-signed token
   * This token proves the ad request came from authenticated user
   */
  const requestAdToken = async () => {
    setAdState('requesting');
    try {
      const response = await rewardsApi.requestToken();
      if (response.success && response.data) {
        setRewardToken(response.data.token);
        setAdState('ready');
        
        // TODO: Initialize your ad SDK here with the token
        // Example for Google IMA:
        // await initializeIMA(response.data.token);
        
        toast.success('Ad ready! Click play to start');
      } else {
        throw new Error('Failed to get ad token');
      }
    } catch (error) {
      console.error('Error requesting ad token:', error);
      setAdState('error');
      toast.error('Failed to load ad. Please try again.');
    }
  };

  /**
   * Step 2: Play the ad
   * Replace this mock implementation with actual ad SDK playback
   */
  const playAd = async () => {
    setAdState('playing');

    // TODO: Replace this mock with actual ad playback
    // Example for Google IMA:
    /*
    try {
      const adsManager = await adsLoader.requestAds(adsRequest);
      adsManager.init(640, 360, google.ima.ViewMode.NORMAL);
      adsManager.start();
      
      adsManager.addEventListener(
        google.ima.AdEvent.Type.COMPLETE,
        onAdComplete
      );
    } catch (adError) {
      console.error('Ad playback error:', adError);
      setAdState('error');
    }
    */

    // MOCK: Simulate ad playback (remove this in production)
    setTimeout(() => {
      onAdComplete();
    }, 3000); // Simulate 3-second ad
  };

  /**
   * Step 3: Handle ad completion and claim reward
   * This is called when the ad finishes playing successfully
   */
  const onAdComplete = async () => {
    const impressionId = `impression_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      // Call backend to verify and credit reward
      const response = await rewardsApi.claimReward({
        adProvider: 'google_ima', // TODO: Use your actual ad provider name
        impressionId: impressionId,
        token: rewardToken,
      });

      if (response.success && response.data) {
        setEarnedAmount(response.data.rewardAmount);
        setAdState('completed');
        toast.success(`You earned ${response.data.rewardAmount} credits!`);
      } else {
        throw new Error(response.error || 'Failed to claim reward');
      }
    } catch (error) {
      console.error('Error claiming reward:', error);
      setAdState('error');
      toast.error('Failed to claim reward. Please contact support.');
    }
  };

  const resetPlayer = () => {
    setAdState('idle');
    setRewardToken('');
    setEarnedAmount(0);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Watch & Earn</CardTitle>
        <CardDescription>
          Watch a short video ad to earn credits for your wallet
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Ad Player Container */}
        <div className="aspect-video bg-black rounded-lg flex items-center justify-center relative overflow-hidden">
          {/* TODO: Replace this div with your actual ad player container */}
          {/* For Google IMA, use: <div id="ad-container"></div> */}
          
          {adState === 'idle' && (
            <div className="text-center space-y-4">
              <Play className="h-16 w-16 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">Ready to earn?</p>
            </div>
          )}

          {adState === 'requesting' && (
            <div className="text-center space-y-4">
              <Loader2 className="h-16 w-16 text-primary animate-spin mx-auto" />
              <p className="text-muted-foreground">Loading ad...</p>
            </div>
          )}

          {adState === 'ready' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                <Play className="h-8 w-8 text-primary" />
              </div>
              <p className="text-foreground">Ad ready!</p>
            </div>
          )}

          {adState === 'playing' && (
            <div className="text-center space-y-4">
              <Loader2 className="h-16 w-16 text-primary animate-spin mx-auto" />
              <p className="text-foreground">Playing ad...</p>
              <p className="text-sm text-muted-foreground">Please wait...</p>
            </div>
          )}

          {adState === 'completed' && (
            <div className="text-center space-y-4">
              <CheckCircle2 className="h-16 w-16 text-accent mx-auto" />
              <div>
                <p className="text-foreground font-semibold">Reward Earned!</p>
                <p className="text-2xl font-bold text-primary mt-2">
                  +{earnedAmount} Credits
                </p>
              </div>
            </div>
          )}

          {adState === 'error' && (
            <div className="text-center space-y-4">
              <XCircle className="h-16 w-16 text-destructive mx-auto" />
              <p className="text-destructive">Failed to load ad</p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="space-y-2">
          {adState === 'idle' && (
            <Button
              className="w-full bg-gradient-primary"
              size="lg"
              onClick={requestAdToken}
            >
              <Play className="mr-2 h-5 w-5" />
              Load Ad
            </Button>
          )}

          {adState === 'ready' && (
            <Button
              className="w-full bg-gradient-primary"
              size="lg"
              onClick={playAd}
            >
              <Play className="mr-2 h-5 w-5" />
              Watch Now
            </Button>
          )}

          {(adState === 'completed' || adState === 'error') && (
            <Button
              className="w-full"
              variant="outline"
              size="lg"
              onClick={resetPlayer}
            >
              Watch Another Ad
            </Button>
          )}
        </div>

        {/* Integration Instructions */}
        <div className="p-4 bg-muted/50 rounded-lg text-sm space-y-2">
          <p className="font-semibold text-muted-foreground">Integration Notes:</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Replace mock ad player with Google IMA SDK or your provider</li>
            <li>Backend verifies token and impressionId to prevent fraud</li>
            <li>Server-side verification with ad network recommended</li>
            <li>Credits are only awarded after backend confirmation</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default RewardedPlayer;
