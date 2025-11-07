import React from 'react';

/**
 * Category Badge Component
 * Displays document categories with color coding
 */
const CategoryBadge = ({ category }) => {
  const categoryClasses = {
    Proposal: 'bg-blue-50 text-primary border-blue-200',
    Invoice: 'bg-green-50 text-green-600 border-green-200',
    Contract: 'bg-yellow-50 text-accent border-yellow-200',
    Report: 'bg-red-50 text-red-600 border-red-200'
  };

  const defaultClasses = 'bg-gray-50 text-gray-600 border-gray-200';
  const classes = categoryClasses[category] || defaultClasses;

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${classes}`}>
      {category}
    </span>
  );
};

export default CategoryBadge;
