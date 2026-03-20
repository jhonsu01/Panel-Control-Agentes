interface BadgeProps {
  children: React.ReactNode;
  color?: 'red' | 'yellow' | 'green' | 'blue' | 'purple' | 'gray' | 'amber';
  className?: string;
}

const colorMap = {
  red: 'bg-red-500/15 text-red-600 border-red-500/25 dark:text-red-400',
  yellow: 'bg-yellow-500/15 text-yellow-700 border-yellow-500/25 dark:text-yellow-400',
  green: 'bg-green-500/15 text-green-700 border-green-500/25 dark:text-green-400',
  blue: 'bg-blue-500/15 text-blue-700 border-blue-500/25 dark:text-blue-400',
  purple: 'bg-purple-500/15 text-purple-700 border-purple-500/25 dark:text-purple-400',
  gray: 'bg-zinc-500/15 text-zinc-600 border-zinc-500/25 dark:text-zinc-400',
  amber: 'bg-amber-500/15 text-amber-700 border-amber-500/25 dark:text-amber-400',
};

export default function Badge({ children, color = 'gray', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${colorMap[color]} ${className}`}>
      {children}
    </span>
  );
}
