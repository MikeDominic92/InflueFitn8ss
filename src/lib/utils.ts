import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import OpenAI from 'openai';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function extractYouTubeId(url: string): string | null {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes('youtube.com')) {
      return urlObj.searchParams.get('v');
    } else if (urlObj.hostname === 'youtu.be') {
      return urlObj.pathname.slice(1);
    }
    return null;
  } catch {
    return null;
  }
}

export interface Exercise {
  name: string;
  sets: string;
  reps: string;
  notes?: string;
  duration?: string;
  rounds?: string;
  targetMuscles?: string[];
  intensity?: string;
  restPeriod?: string;
}

export interface VideoDetails {
  title: string;
  thumbnail: string;
  workoutType: string;
  exercises: Exercise[];
  duration: string;
  views: string;
  likes: string;
  channelName: string;
  difficulty: string;
  equipment: string[];
  targetMuscles: string[];
  estimatedCalories: string;
}

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

async function analyzeWorkoutContent(
  title: string,
  description: string,
  comments: string
): Promise<Omit<VideoDetails, 'title' | 'thumbnail' | 'duration' | 'views' | 'likes' | 'channelName'>> {
  if (!import.meta.env.VITE_OPENAI_API_KEY) {
    throw new Error('OpenAI API key is missing');
  }

  try {
    // Truncate inputs to manage token length
    const truncatedDescription = description.slice(0, 1500);
    const truncatedComments = comments.slice(0, 1000);
    
    const prompt = `
Title: ${title}
Description: ${truncatedDescription}
Top Comments: ${truncatedComments}

Analyze this fitness video content and provide a detailed workout breakdown in JSON format.
Focus on extracting:
1. Workout type
2. Difficulty level
3. Required equipment
4. Target muscle groups
5. Estimated calories
6. Exercise details (sets, reps, form notes)
    `;

    // Add retry logic for rate limits
    const maxRetries = 3;
    let retryCount = 0;
    let lastError: any;

    while (retryCount < maxRetries) {
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: `You are a fitness expert that analyzes workout videos. Return ONLY a JSON object with this structure:
              {
                "workoutType": string,
                "difficulty": string,
                "equipment": string[],
                "targetMuscles": string[],
                "estimatedCalories": string,
                "exercises": [{
                  "name": string,
                  "sets": string,
                  "reps": string,
                  "notes": string,
                  "duration": string?,
                  "rounds": string?,
                  "targetMuscles": string[],
                  "intensity": string,
                  "restPeriod": string
                }]
              }`
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.2,
          max_tokens: 1000
        });

        const content = completion.choices[0]?.message?.content;
        if (!content) {
          throw new Error('No analysis content received from OpenAI');
        }

        try {
          const analysis = JSON.parse(content);
          
          // Validate required fields
          if (!analysis.workoutType || !analysis.difficulty || !Array.isArray(analysis.exercises)) {
            throw new Error('Invalid analysis format received');
          }

          // Ensure exercises array is properly formatted
          analysis.exercises = analysis.exercises.map(exercise => ({
            name: exercise.name || 'Unknown Exercise',
            sets: exercise.sets || '1',
            reps: exercise.reps || 'Not specified',
            notes: exercise.notes || '',
            duration: exercise.duration,
            rounds: exercise.rounds,
            targetMuscles: Array.isArray(exercise.targetMuscles) ? exercise.targetMuscles : [],
            intensity: exercise.intensity || 'Medium',
            restPeriod: exercise.restPeriod || '30-60 seconds'
          }));

          return {
            workoutType: analysis.workoutType,
            difficulty: analysis.difficulty,
            equipment: Array.isArray(analysis.equipment) ? analysis.equipment : [],
            targetMuscles: Array.isArray(analysis.targetMuscles) ? analysis.targetMuscles : [],
            estimatedCalories: analysis.estimatedCalories || '150-300 calories',
            exercises: analysis.exercises
          };
        } catch (parseError) {
          console.error('Failed to parse OpenAI response:', parseError);
          throw new Error('Failed to parse workout analysis. Please try again.');
        }
      } catch (error: any) {
        lastError = error;
        
        // Check if it's a rate limit error
        if (error?.error?.code === 'rate_limit_exceeded') {
          const retryAfter = parseInt(error?.error?.message?.match(/try again in (\d+\.?\d*)s/)?.[1] || '5');
          await new Promise(resolve => setTimeout(resolve, (retryAfter + 1) * 1000));
          retryCount++;
          continue;
        }
        
        // For other errors, throw immediately
        throw error;
      }
    }
    
    // If we've exhausted retries
    throw lastError || new Error('Failed to analyze workout after multiple attempts');
    
  } catch (error) {
    console.error('OpenAI Analysis Error:', error);
    throw new Error('Failed to analyze workout content. Please try again later.');
  }
}

async function fetchVideoComments(videoId: string): Promise<string> {
  if (!import.meta.env.VITE_YOUTUBE_API_KEY) {
    throw new Error('YouTube API key is missing');
  }

  const commentsUrl = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=100&order=relevance&key=${import.meta.env.VITE_YOUTUBE_API_KEY}`;
  
  try {
    const response = await fetch(commentsUrl);
    if (!response.ok) {
      const error = await response.json();
      console.error('Comments API error:', error);
      return '';
    }
    
    const data = await response.json();
    return data.items?.map((item: any) => item.snippet.topLevelComment.snippet.textDisplay).join('\n') || '';
  } catch (error) {
    console.error('Error fetching comments:', error);
    return '';
  }
}

export async function fetchVideoDetails(videoId: string): Promise<VideoDetails> {
  if (!import.meta.env.VITE_YOUTUBE_API_KEY) {
    throw new Error('YouTube API key is missing');
  }

  try {
    const metadataUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${import.meta.env.VITE_YOUTUBE_API_KEY}`;
    
    const response = await fetch(metadataUrl);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to fetch video details');
    }

    const data = await response.json();
    if (!data.items?.[0]) {
      throw new Error('Video not found or is not accessible');
    }

    const video = data.items[0];
    const { title, description, channelTitle, thumbnails } = video.snippet;

    // Fetch comments for additional context
    const comments = await fetchVideoComments(videoId);
    
    // Get workout analysis
    const workoutData = await analyzeWorkoutContent(title, description, comments);

    return {
      title,
      thumbnail: thumbnails.high?.url || thumbnails.medium?.url || thumbnails.default?.url,
      duration: formatDuration(video.contentDetails.duration),
      views: formatCount(video.statistics?.viewCount),
      likes: formatCount(video.statistics?.likeCount),
      channelName: channelTitle,
      ...workoutData
    };
  } catch (error) {
    console.error('Error in fetchVideoDetails:', error);
    throw error instanceof Error ? error : new Error('An unexpected error occurred');
  }
}

function formatDuration(isoDuration: string): string {
  return isoDuration
    .replace('PT', '')
    .replace('H', ':')
    .replace('M', ':')
    .replace('S', '')
    .split(':')
    .map(part => part.padStart(2, '0'))
    .join(':');
}

function formatCount(count: string | undefined): string {
  if (!count) return '0';
  const num = parseInt(count);
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}