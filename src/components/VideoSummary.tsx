import React, { useState } from 'react';
import { Clock, Dumbbell, ThumbsUp, Eye, User, ListChecks, Flame, Target, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../lib/utils';
import type { VideoDetails } from '../lib/utils';

export function VideoSummary({ 
  title, 
  thumbnail, 
  workoutType,
  exercises,
  duration,
  views,
  likes,
  channelName,
  difficulty,
  equipment,
  targetMuscles,
  estimatedCalories
}: VideoDetails) {
  const [expandedExercise, setExpandedExercise] = useState<number | null>(null);

  return (
    <div className="bg-card/30 backdrop-blur-sm rounded-2xl overflow-hidden max-w-4xl w-full border border-primary/20">
      <div className="relative">
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-72 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="absolute top-4 right-4 flex gap-2">
          <div className={cn(
            "px-4 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm border",
            difficulty.toLowerCase() === 'beginner' 
              ? 'bg-green-500/10 border-green-500/20 text-green-400' 
              : difficulty.toLowerCase() === 'intermediate' 
              ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          )}>
            {difficulty}
          </div>
          <div className="bg-primary/10 border border-primary/20 text-primary px-4 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm">
            {workoutType}
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="flex flex-wrap items-center gap-6 text-sm text-primary-foreground/60 mb-6">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-primary" />
            <span>{duration}</span>
          </div>
          {views && (
            <div className="flex items-center gap-2">
              <Eye size={16} className="text-primary" />
              <span>{views}</span>
            </div>
          )}
          {likes && (
            <div className="flex items-center gap-2">
              <ThumbsUp size={16} className="text-primary" />
              <span>{likes}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Flame size={16} className="text-primary" />
            <span>{estimatedCalories}</span>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-primary-foreground mb-4">{title}</h2>
        
        {channelName && (
          <div className="flex items-center gap-2 text-primary-foreground/60 mb-8">
            <User size={16} className="text-primary" />
            <span>{channelName}</span>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Dumbbell className="text-primary" />
              <h3 className="font-semibold text-primary-foreground">Equipment Needed</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {equipment.map((item, index) => (
                <span 
                  key={index}
                  className="bg-primary/10 border border-primary/20 text-primary-foreground px-4 py-1.5 rounded-full text-sm"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <Target className="text-primary" />
              <h3 className="font-semibold text-primary-foreground">Target Muscles</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {targetMuscles.map((muscle, index) => (
                <span 
                  key={index}
                  className="bg-primary/10 border border-primary/20 text-primary-foreground px-4 py-1.5 rounded-full text-sm"
                >
                  {muscle}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <ListChecks className="text-primary" />
            <h3 className="font-semibold text-primary-foreground">Exercise Breakdown</h3>
          </div>
          
          <div className="space-y-4">
            {exercises.map((exercise, index) => (
              <div 
                key={index}
                className={cn(
                  "rounded-xl transition-all overflow-hidden",
                  "border border-primary/20 hover:border-primary/40",
                  expandedExercise === index ? 'bg-primary/5' : ''
                )}
              >
                <button
                  onClick={() => setExpandedExercise(expandedExercise === index ? null : index)}
                  className="w-full px-6 py-4"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-medium text-primary-foreground">{exercise.name}</h4>
                    {exercise.intensity && (
                      <span className={cn(
                        "px-3 py-1 rounded-full text-sm border backdrop-blur-sm",
                        exercise.intensity === 'High' 
                          ? 'bg-red-500/10 border-red-500/20 text-red-400'
                          : exercise.intensity === 'Medium'
                          ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                          : 'bg-green-500/10 border-green-500/20 text-green-400'
                      )}>
                        {exercise.intensity} Intensity
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-card/50 border border-primary/10 p-3 rounded-lg">
                      <div className="text-sm text-primary-foreground/60">Sets</div>
                      <div className="font-medium text-primary-foreground">{exercise.sets}</div>
                    </div>
                    <div className="bg-card/50 border border-primary/10 p-3 rounded-lg">
                      <div className="text-sm text-primary-foreground/60">
                        {exercise.duration ? 'Duration' : 'Reps'}
                      </div>
                      <div className="font-medium text-primary-foreground">
                        {exercise.duration || exercise.reps}
                      </div>
                    </div>
                    {exercise.rounds && (
                      <div className="bg-card/50 border border-primary/10 p-3 rounded-lg">
                        <div className="text-sm text-primary-foreground/60">Rounds</div>
                        <div className="font-medium text-primary-foreground">{exercise.rounds}</div>
                      </div>
                    )}
                    {exercise.restPeriod && (
                      <div className="bg-card/50 border border-primary/10 p-3 rounded-lg">
                        <div className="text-sm text-primary-foreground/60">Rest</div>
                        <div className="font-medium text-primary-foreground">{exercise.restPeriod}</div>
                      </div>
                    )}
                  </div>
                  
                  {expandedExercise === index ? (
                    <ChevronUp className="w-5 h-5 text-primary-foreground/40 mx-auto mt-4" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-primary-foreground/40 mx-auto mt-4" />
                  )}
                </button>
                
                {expandedExercise === index && exercise.notes && (
                  <div className="px-6 pb-6">
                    <div className="p-4 rounded-lg bg-card/50 border border-primary/10 text-primary-foreground/80 text-sm">
                      {exercise.notes}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}