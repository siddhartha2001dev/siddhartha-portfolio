export default function UnderlineLink({ children, className = '', ...props }) {
  return (
    <a
      data-cursor="link"
      className={`group relative inline-block ${className}`}
      {...props}
    >
      {children}
      <span className="absolute -bottom-0.5 left-0 h-px w-full origin-right scale-x-0 bg-current transition-transform duration-500 ease-expo group-hover:origin-left group-hover:scale-x-100 group-focus-visible:scale-x-100" />
    </a>
  )
}
