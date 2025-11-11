const CategoryBadge = ({ category }) => {
  const categoryClasses = {
    Proposal: 'bg-primary/12 text-primary border-primary/20',
    Invoice: 'bg-emerald-50 text-emerald-600 border-emerald-200/80',
    Contract: 'bg-amber-50 text-amber-600 border-amber-200/80',
    Report: 'bg-rose-50 text-rose-600 border-rose-200/80'
  };

  const defaultClasses = 'bg-slate-100 text-slate-700 border-slate-200/80';
  const classes = categoryClasses[category] || defaultClasses;

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${classes}`}>
      {category}
    </span>
  );
};

export default CategoryBadge;
