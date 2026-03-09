interface UserHeaderProps {
  avatarUrl?: string;
  username: string;
  bio?: string;
  subtitle?: string;
  centered?: boolean;
  action?: React.ReactNode;
  onClick?: () => void;
}

const UserHeader = ({
  avatarUrl,
  username,
  bio,
  subtitle,
  centered = false,
  action,
  onClick,
}: UserHeaderProps) => {
  const isInteractive = typeof onClick === "function";

  return (
    <div
      className={`relative flex items-center justify-between p-4 lg:px-4 lg:py-3 bg-gray-800/95 text-white rounded-xl border border-gray-700/70 shadow-lg ${
        isInteractive ? "cursor-pointer" : ""
      }`}
      onClick={onClick}
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onKeyDown={
        isInteractive
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
    >
      <div
        className={`flex min-w-0 ${
          centered
            ? "items-center justify-center w-full text-center lg:flex-col lg:gap-2"
            : "items-center"
        }`}
      >
        <img
          src={
            avatarUrl
          }
          alt="Avatar"
          className={`w-14 h-14 lg:w-12 lg:h-12 rounded-full object-cover ${
            centered ? "mr-3 lg:mr-0" : "mr-3"
          }`}
        />
        <div className={`min-w-0 ${centered ? "lg:text-center" : ""}`}>
          <h2 className="text-xl lg:text-lg font-semibold truncate">{username || "Guest"}</h2>
          {subtitle && <p className="text-gray-400 text-sm truncate">{subtitle}</p>}
          <p className="pt-1 text-gray-100 text-base lg:text-base truncate">{bio || "No bio available"}</p>
        </div>
      </div>
      {action && <div className="ml-4 shrink-0">{action}</div>}
    </div>
  );
};

export default UserHeader;
