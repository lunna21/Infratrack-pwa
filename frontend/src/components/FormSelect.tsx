import type { SelectHTMLAttributes } from 'react';

export type SelectOption = {
  value: string;
  label?: string;
};

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  labelClassName?: string;
  selectClassName?: string;
}

export const FormSelect = ({
  label,
  options,
  labelClassName,
  selectClassName,
  required,
  className,
  ...rest
}: FormSelectProps) => {
  const labelText = required ? `${label} *` : label;
  const finalLabelClassName =
    labelClassName ?? 'block text-xs font-medium text-gray-700 mb-1';
  const finalSelectClassName =
    selectClassName ??
    'w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300';

  return (
    <div>
      <label className={finalLabelClassName}>{labelText}</label>
      <select
        {...rest}
        required={required}
        className={`${finalSelectClassName} ${className ?? ''}`.trim()}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label ?? option.value}
          </option>
        ))}
      </select>
    </div>
  );
};
