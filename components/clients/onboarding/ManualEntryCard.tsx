/**
 * ManualEntryCard Component
 * Presentational card component for manual data entry fields
 * Wraps form fields with consistent styling
 */

import React from 'react'

interface ManualEntryCardProps {
  title: string
  description?: string
  children: React.ReactNode
  variant?: 'default' | 'compact'
}

/**
 * ManualEntryCard
 * Container for manual form fields with consistent styling
 */
export const ManualEntryCard: React.FC<ManualEntryCardProps> = ({
  title,
  description,
  children,
  variant = 'default',
}) => {
  return (
    <div className={`rounded-lg border border-gray-200 bg-white p-6 ${
      variant === 'compact' ? 'p-4' : ''
    }`}>
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {description && (
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        )}
      </div>

      {/* Content */}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  )
}

export default ManualEntryCard
