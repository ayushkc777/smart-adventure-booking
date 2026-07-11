import { Star } from 'lucide-react'
import { Card } from '../ui/Card'

function Stars({ rating }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          aria-hidden="true"
          className={index < rating ? 'fill-gold-500 text-gold-500' : 'text-slate-300'}
          key={index}
          size={16}
        />
      ))}
    </span>
  )
}

export function ReviewCard({ review }) {
  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-950">{review.userName}</h3>
          <p className="text-sm text-slate-500">{review.operator}</p>
        </div>
        <Stars rating={review.rating} />
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-700">{review.comment}</p>
      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-sm">
        <span>
          <span className="block text-xs font-bold uppercase text-slate-500">Safety</span>
          <span className="font-bold text-slate-950">{review.safetyRating}/5</span>
        </span>
        <span>
          <span className="block text-xs font-bold uppercase text-slate-500">Value</span>
          <span className="font-bold text-slate-950">{review.valueRating}/5</span>
        </span>
      </div>
    </Card>
  )
}
