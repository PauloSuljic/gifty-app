import { cn } from "../../utils/cn";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

const Button: React.FC<ButtonProps> = ({ variant = "primary", className, ...props }) => {
  return (
    <button
      type="button" // Ensures button works correctly
      className={cn(
        "px-4 py-2 rounded-md transition-all text-white font-semibold",
        variant === "primary" ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-300 text-black",
        className ?? ""
      )}
      {...props}
    />
  );
};

export default Button;
