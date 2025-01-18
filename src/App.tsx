import React, { useState } from 'react';
import { YoutubeIcon, Loader2, Dumbbell, Search, Flame, Target, Activity } from 'lucide-react';
import { VideoSummary } from './components/VideoSummary';
import { ErrorMessage } from './components/ErrorMessage';
import { cn, extractYouTubeId, fetchVideoDetails } from './lib/utils';

function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<VideoDetails | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSummary(null);
    setLoading(true);

    try {
      const videoId = extractYouTubeId(url);
      if (!videoId) {
        throw new Error('Invalid YouTube URL. Please check the URL and try again.');
      }

      const details = await fetchVideoDetails(videoId);
      setSummary(details);
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_-20%,hsl(24,100%,50%,0.15),transparent_45%)]" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_80%_80%,hsl(24,100%,50%,0.15),transparent_45%)]" />
      
      <div className="container mx-auto px-4 py-16 relative">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/20 rounded-full blur-[128px] -z-10" />
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-primary/10 clip-hex animate-pulse-glow -z-10" />
        <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-primary/10 clip-hex animate-pulse-glow -z-10" />
        
        <div className="text-center mb-16 relative">
          {/* Logo and Title */}
          <div className="inline-flex flex-col items-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" />
              <div className="relative bg-gradient-to-br from-primary to-primary/50 p-4 rounded-full glow">
                <Dumbbell className="w-10 h-10 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-primary-foreground to-primary bg-clip-text text-transparent text-glow">
              InflueFitn8ss
            </h1>
            <p className="text-xl text-primary-foreground/60 max-w-2xl mx-auto leading-relaxed">
              Where your ideal body becomes reality. Transform any fitness video into a personalized workout plan with AI-powered analysis.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
            {[
              {
                icon: <Activity className="w-6 h-6 text-primary" />,
                title: "Smart Analysis",
                description: "AI-powered workout breakdown with detailed exercise information"
              },
              {
                icon: <Target className="w-6 h-6 text-primary" />,
                title: "Targeted Training",
                description: "Identify muscle groups and get personalized intensity recommendations"
              },
              {
                icon: <Flame className="w-6 h-6 text-primary" />,
                title: "Track Progress",
                description: "Monitor calories burned and track your fitness journey"
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="group p-6 rounded-2xl bg-card/30 backdrop-blur-sm border border-primary/10 hover:border-primary/30 transition-all"
              >
                <div className="bg-primary/10 rounded-xl p-3 w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-primary-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-primary-foreground/60">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <ErrorMessage 
            message={error} 
            onDismiss={() => setError(null)} 
          />
        )}

        <form onSubmit={handleSubmit} className="mb-16">
          <div className="flex gap-4 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <YoutubeIcon className="h-5 w-5 text-primary" />
              </div>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste YouTube fitness video URL here..."
                className={cn(
                  "w-full pl-12 pr-4 py-4 rounded-xl border bg-card/30 backdrop-blur-sm text-primary-foreground",
                  "placeholder:text-primary-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary",
                  "border-primary/20 hover:border-primary/40 transition-colors",
                  error ? "border-red-500/50" : ""
                )}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className={cn(
                "px-8 py-4 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl font-medium",
                "hover:from-primary/90 hover:to-primary/70 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background",
                "disabled:opacity-50 disabled:cursor-not-allowed transition-all",
                "flex items-center gap-2 glow"
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Analyze
                </>
              )}
            </button>
          </div>
        </form>

        <div className="flex justify-center">
          {loading ? (
            <div className="flex flex-col items-center gap-6 p-8 rounded-2xl bg-card/30 backdrop-blur-sm border border-primary/20">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                <Loader2 className="w-12 h-12 animate-spin text-primary relative" />
              </div>
              <div className="space-y-2 text-center">
                <p className="text-lg font-medium text-primary-foreground">Analyzing workout content...</p>
                <p className="text-primary-foreground/60">Extracting exercises and creating your plan</p>
              </div>
            </div>
          ) : summary ? (
            <VideoSummary {...summary} />
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default App;