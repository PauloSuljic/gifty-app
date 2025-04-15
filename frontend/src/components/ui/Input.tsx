interface InputProps {
    type?: string;
    placeholder?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }
  
  const Input = ({ type = "text", placeholder, value, onChange }: InputProps) => {
    return (
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="border border-gray-300 p-2 rounded w-full"
      />
    );
  };
  
  export default Input;
  