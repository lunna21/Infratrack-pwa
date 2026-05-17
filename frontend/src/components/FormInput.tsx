import type { InputHTMLAttributes } from 'react';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  labelClassName?: string;
  inputClassName?: string;
}

export const FormInput = ({
  label,
  labelClassName,
  inputClassName,
  required,
  className,
  ...rest
}: FormInputProps) => {
  const labelText = required ? `${label} *` : label;
  const finalLabelClassName =
    labelClassName ?? 'block text-xs font-medium text-gray-700 mb-1';
  const finalInputClassName =
    inputClassName ??
    'w-full px-3 py-2.5  border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300';

  return (
    <div>
      <label className={finalLabelClassName}>{labelText}</label>
      <input
        {...rest}
        required={required}
        className={`${finalInputClassName} ${className ?? ''}`.trim()}
      />
    </div>
  );
};
