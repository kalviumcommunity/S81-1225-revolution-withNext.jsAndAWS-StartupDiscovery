import { UseFormRegisterReturn, FieldError } from "react-hook-form";

interface FormInputProps {
  label: string;
  name: string;
  type?: string;
  register: UseFormRegisterReturn;
  error?: FieldError;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
}

export default function FormInput({
  label,
  name,
  type = "text",
  register,
  error,
  placeholder,
  disabled = false,
  required = true,
}: FormInputProps) {
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block mb-2 font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        id={name}
        type={type}
        {...register}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        className={`w-full px-3 py-2 border rounded-lg transition-colors focus:outline-none focus:ring-2 ${
          error
            ? "border-red-500 bg-red-50 focus:ring-red-300"
            : "border-gray-300 bg-white focus:ring-blue-300 focus:border-blue-500"
        } ${disabled ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""}`}
      />
      {error && (
        <p
          id={`${name}-error`}
          className="text-red-500 text-sm mt-1 font-medium"
        >
          {error.message}
        </p>
      )}
    </div>
  );
}
