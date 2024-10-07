import React from 'react';

const buttonStyles = {
  primary: {
    bg: 'bg-indigo-600',
    hover: 'hover:bg-indigo-700',
    text: 'text-white',
    border: 'border-transparent',
  },
  secondary: {
    bg: 'bg-white',
    hover: 'hover:bg-gray-50',
    text: 'text-indigo-600',
    border: 'border-indigo-600',
  },
  tertiary: {
    bg: 'bg-gray-200',
    hover: 'hover:bg-gray-300',
    text: 'text-gray-800',
    border: 'border-gray-800',
  },
};

export const Button = ({
  primary = false,
  secondary = false,
  tertiary = false,
  children,
  ...rest
}) => {
  const getButtonStyle = () => {
    if (primary) return buttonStyles.primary;
    if (secondary) return buttonStyles.secondary;
    if (tertiary) return buttonStyles.tertiary;
    return buttonStyles.primary;
  };

  const style = getButtonStyle();

  return (
    <button
      className={`inline-flex items-center justify-center rounded-md border ${style.border} ${style.bg} ${style.hover} ${style.text} px-5 py-3 text-base font-medium`}
      {...rest}
    >
      {children}
    </button>
  );
};
