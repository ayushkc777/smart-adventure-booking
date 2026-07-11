import { Link } from 'react-router-dom'
import { cn } from '../../utils/cn'

const variants = {
  primary:
    'bg-himalaya-700 text-white shadow-[0_14px_32px_-20px_rgb(15_118_110)] hover:-translate-y-0.5 hover:bg-himalaya-800 hover:shadow-[0_18px_34px_-22px_rgb(15_118_110)] focus-visible:outline-himalaya-700',
  secondary:
    'border border-slate-200 bg-white text-slate-950 shadow-sm hover:-translate-y-0.5 hover:border-himalaya-200 hover:bg-himalaya-50 hover:text-himalaya-900 focus-visible:outline-himalaya-700',
  accent:
    'bg-rhododendron-700 text-white shadow-[0_14px_32px_-20px_rgb(194_65_12)] hover:-translate-y-0.5 hover:bg-rhododendron-800 hover:shadow-[0_18px_34px_-22px_rgb(154_52_18)] focus-visible:outline-rhododendron-700',
  gold:
    'bg-gold-500 text-slate-950 shadow-sm hover:-translate-y-0.5 hover:bg-gold-400 focus-visible:outline-gold-500',
  ghost:
    'text-slate-800 hover:bg-himalaya-50 hover:text-himalaya-900 focus-visible:outline-himalaya-700',
  outline:
    'border border-himalaya-200 bg-transparent text-himalaya-900 hover:-translate-y-0.5 hover:bg-himalaya-50 focus-visible:outline-himalaya-700',
}

const sizes = {
  sm: 'min-h-9 px-3 text-sm',
  md: 'min-h-11 px-4 text-sm',
  lg: 'min-h-12 px-5 text-base',
}

export function Button({
  children,
  className,
  icon: Icon,
  iconPosition = 'left',
  size = 'md',
  to,
  href,
  variant = 'primary',
  ...props
}) {
  const { type = 'button', ...buttonProps } = props
  const buttonClass = cn(
    'inline-flex items-center justify-center gap-2 rounded-xl font-semibold leading-none transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50',
    variants[variant],
    sizes[size],
    className,
  )

  const content = (
    <>
      {Icon && iconPosition === 'left' ? <Icon aria-hidden="true" size={18} /> : null}
      <span>{children}</span>
      {Icon && iconPosition === 'right' ? <Icon aria-hidden="true" size={18} /> : null}
    </>
  )

  if (to) {
    return (
      <Link className={buttonClass} to={to} {...buttonProps}>
        {content}
      </Link>
    )
  }

  if (href) {
    return (
      <a className={buttonClass} href={href} {...buttonProps}>
        {content}
      </a>
    )
  }

  return (
    <button className={buttonClass} type={type} {...buttonProps}>
      {content}
    </button>
  )
}
