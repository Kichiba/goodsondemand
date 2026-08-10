import { CATEGORIES } from '@shared/constants';

interface CategoryFilterProps {
  selected: string;
  onSelect: (category: string) => void;
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
      <button
        className={`category-btn promo-btn ${selected === 'promos' ? 'active' : ''}`}
        onClick={() => onSelect('promos')}
      >
        Promos
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
