import { CATEGORIES } from '@shared/constants';
import type { ProductCategory } from '@shared/types';

interface CategoryFilterProps {
  selected: ProductCategory | 'all';
  onSelect: (category: ProductCategory | 'all') => void;
}

export default function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="category-filter">
      <button
        className={`category-btn ${selected === 'all' ? 'active' : ''}`}
        onClick={() => onSelect('all')}
      >
        All
      </button>
      {CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          className={`category-btn ${selected === cat.id ? 'active' : ''}`}
          onClick={() => onSelect(cat.id)}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
