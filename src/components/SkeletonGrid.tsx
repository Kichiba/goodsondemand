export default function SkeletonGrid() {
  return (
    <div className="products-grid">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton-image skeleton-pulse"></div>
          <div className="skeleton-info">
            <div className="skeleton-line skeleton-pulse" style={{ width: '70%' }}></div>
            <div className="skeleton-line skeleton-pulse" style={{ width: '90%', height: '10px' }}></div>
            <div className="skeleton-line-row">
              <div className="skeleton-line skeleton-pulse" style={{ width: '40%' }}></div>
              <div className="skeleton-line skeleton-pulse" style={{ width: '30%', height: '32px', borderRadius: '8px' }}></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
