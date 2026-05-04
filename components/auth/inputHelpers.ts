/**
 * Helper function for consistent input validation styling
 * @param isInvalid - Whether the input has validation errors
 * @returns Tailwind classes for text color and border based on validation state
 */
export const getValidationClasses = (isInvalid: boolean): string => {
  return isInvalid
    ? 'text-gray-900 border-red-500 focus:border-red-500 focus:ring-red-200'
    : 'text-gray-900 border-gray-200 focus:border-blue-500 focus:ring-blue-200';
};
