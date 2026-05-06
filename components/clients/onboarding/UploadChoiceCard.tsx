/**
 * UploadChoiceCard Component
 * Presentational card component for choosing upload method (file or manual)
 * Used in the first step to let users choose their data entry method
 */

import React from 'react'

interface UploadChoiceCardProps {
  method: 'upload' | 'manual'
  isSelected: boolean
  onClick: () => void
  title: string
  description: string
  icon?: string
}

/**
 * UploadChoiceCard
 * A card for selecting between upload and manual entry methods
 */
export const UploadChoiceCard: React.FC<UploadChoiceCardProps> = ({
  method,
  isSelected,
  onClick,
  title,
  description,
  icon,
}) => {
  return (
    <button
      onClick={onClick}
      className={`w-full p-6 rounded-lg border-2 transition-all duration-200 text-left ${
        isSelected
          ? 'border-blue-500 bg-blue-50 shadow-md'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Radio Button / Selection Indicator */}
        <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
          isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300 bg-white'
        }`}>
          {isSelected && (
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className={`font-semibold text-lg mb-2 ${
            isSelected ? 'text-blue-900' : 'text-gray-900'
          }`}>
            {title}
          </h3>
          <p className={`text-sm ${
            isSelected ? 'text-blue-700' : 'text-gray-600'
          }`}>
            {description}
          </p>
        </div>

        {/* Icon */}
        {icon && (
          <div className={`flex-shrink-0 text-2xl ${
            isSelected ? 'text-blue-500' : 'text-gray-400'
          }`}>
            {icon}
          </div>
        )}
      </div>
    </button>
  )
}

export default UploadChoiceCard
