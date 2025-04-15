interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card = ({ children, className }: CardProps) => {
  return (
    <div className={`bg-gray-800 bg-opacity-80 rounded-2xl p-5 shadow-lg border border-white/10 hover:border-white/30 transition-all ${className}`}>
      {children}
    </div>
  );
};

export default Card;