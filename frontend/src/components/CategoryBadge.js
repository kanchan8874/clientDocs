const CategoryBadge = ({ category }) => {
  const categoryClasses = {
    Proposal: 'bg-primary-50 text-accent border-accent/30',
    Invoice: 'bg-emerald-50 text-emerald-600 border-emerald-200/80',
    Contract: 'bg-amber-50 text-amber-600 border-amber-200/80',
    Report: 'bg-rose-50 text-rose-600 border-rose-200/80'
  };

  const defaultClasses = 'bg-primary-50 text-text border-border/70';
  const classes = categoryClasses[category] || defaultClasses;

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold tracking-wide ${classes}`}>
      {category}
    </span>
  );
};

export default CategoryBadge;
