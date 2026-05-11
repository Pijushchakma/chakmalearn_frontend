// Renders Bengali-script text (U+0980–U+09FF) with Noto Sans Bengali.
// Used for both standard Bengali (bangla field) and Bengali-script Chakma (chakma_bn_script field).
// size: 'sm' (1rem) | 'base' (1.4rem) | 'lg' (2.2rem)
export default function BengaliText({ children, size = 'base', className = '', weight = 'normal' }) {
  const sizeClass = size === 'lg' ? 'bengali-lg' : size === 'sm' ? 'bengali-sm' : 'bengali'
  const weightClass = weight === 'semibold' ? 'font-semibold' : weight === 'medium' ? 'font-medium' : ''
  return (
    <span className={`${sizeClass} ${weightClass} ${className}`} lang="bn">
      {children}
    </span>
  )
}
