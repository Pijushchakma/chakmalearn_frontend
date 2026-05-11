// Renders any string using the Noto Sans Chakma font (Unicode U+11100–U+1114F).
// size: 'base' (1.5rem) | 'lg' (2.5rem) | 'xl' (4rem)
export default function ChakmaText({ children, size = 'base', className = '' }) {
  const sizeClass = size === 'xl' ? 'chakma-xl' : size === 'lg' ? 'chakma-lg' : 'chakma'
  return (
    <span className={`${sizeClass} ${className}`} lang="ccp">
      {children}
    </span>
  )
}
