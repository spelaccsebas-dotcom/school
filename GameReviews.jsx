import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Star } from 'lucide-react';

export default function GameReviews({ game, user }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const queryClient = useQueryClient();

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews', game.id],
    queryFn: () => base44.entities.Review.filter({ game_id: game.id }, '-created_date', 20),
  });

  const submitMutation = useMutation({
    mutationFn: (data) => base44.entities.Review.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', game.id] });
      setRating(0);
      setComment('');
    },
  });

  const userReview = reviews.find(r => r.user_email === user?.email);
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const handleSubmit = () => {
    if (!rating || !user) return;
    submitMutation.mutate({
      game_id: game.id,
      game_name: game.name,
      user_email: user.email,
      user_name: user.full_name || user.email,
      rating,
      comment,
    });
  };

  return (
    <div className="mt-4 border-t border-slate-700 pt-4">
      {/* Average */}
      {avgRating && (
        <div className="flex items-center gap-2 mb-4">
          <div className="flex">
            {[1,2,3,4,5].map(i => (
              <Star key={i} className={`w-4 h-4 ${i <= Math.round(avgRating) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`} />
            ))}
          </div>
          <span className="text-yellow-400 font-bold">{avgRating}</span>
          <span className="text-slate-400 text-sm">({reviews.length} reviews)</span>
        </div>
      )}

      {/* Write review */}
      {user && !userReview && (
        <div className="bg-slate-800/60 rounded-xl p-4 mb-4">
          <p className="text-slate-300 text-sm font-semibold mb-2">Schrijf een review:</p>
          <div className="flex gap-1 mb-3">
            {[1,2,3,4,5].map(i => (
              <Star
                key={i}
                className={`w-7 h-7 cursor-pointer transition-all ${i <= (hovered || rating) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => setRating(i)}
              />
            ))}
          </div>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Optioneel commentaar..."
            className="w-full bg-slate-700/60 border border-slate-600 rounded-lg p-2 text-white text-sm resize-none h-16 mb-2"
          />
          <button
            onClick={handleSubmit}
            disabled={!rating || submitMutation.isPending}
            className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg text-sm font-semibold"
          >
            {submitMutation.isPending ? 'Opslaan...' : 'Review Plaatsen'}
          </button>
        </div>
      )}

      {/* Reviews list */}
      {reviews.length > 0 && (
        <div className="space-y-3 max-h-48 overflow-y-auto">
          {reviews.map(r => (
            <div key={r.id} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-500/30 flex items-center justify-center text-xs text-purple-300 font-bold flex-shrink-0">
                {(r.user_name || r.user_email)[0].toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm font-semibold">{r.user_name || r.user_email}</span>
                  <div className="flex">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className={`w-3 h-3 ${i <= r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`} />
                    ))}
                  </div>
                </div>
                {r.comment && <p className="text-slate-400 text-xs mt-0.5">{r.comment}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {reviews.length === 0 && (
        <p className="text-slate-500 text-sm text-center py-2">Nog geen reviews. Wees de eerste!</p>
      )}
    </div>
  );
}