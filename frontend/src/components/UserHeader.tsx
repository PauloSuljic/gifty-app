interface UserHeaderProps {
  avatarUrl?: string;
  username: string;
  bio?: string;
}

const UserHeader = ({ avatarUrl, username, bio }: UserHeaderProps) => {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-800 text-white rounded-lg shadow-lg">
      <div className="flex items-center">
        <img
          src={
            avatarUrl
          }
          alt="Avatar"
          className="w-15 h-15 rounded-full mr-3"
        />
        <div>
          <h2 className="text-xl font-bold">{username || "Guest"}</h2>
          <p className="text-gray-400">{bio || "No bio available"}</p>
        </div>
      </div>
    </div>
  );
};

export default UserHeader;