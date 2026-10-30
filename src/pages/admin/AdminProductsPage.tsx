import { useEffect, useState, type FormEvent } from 'react';
import {
  subscribeToProducts,
  addProduct,
  updateProduct,
  deleteProduct,
} from '../../services/adminFirebase';
import { uploadImageFile } from '../../services/cloudinaryUpload';
import { CATEGORIES, formatPrice, calculateAgeing } from '@shared/constants';
import type { Product, ProductCategory } from '@shared/types';

interface FormState {
  name: string;
  description: string;
  price: string;
  salePrice: string;
  costPrice: string;
  promoLabel: string;
  stock: string;
  category: ProductCategory;
  datePurchased: string;
  country: string;
  images: string[];
  imageLabels: string[];
  isAvailable: boolean;
}

const EMPTY_FORM: FormState = {
  name: '',
  description: '',
  price: '',
  salePrice: '',
  costPrice: '',
  promoLabel: '',
  stock: '',
  category: 'other',
  datePurchased: '',
  country: '',
  images: [],
  imageLabels: [],
  isAvailable: true,
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToProducts((data) => {
      setProducts(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setForm({
      name: p.name,
      description: p.description,
      price: String(p.price ?? ''),
      salePrice: p.salePrice != null ? String(p.salePrice) : '',
      costPrice: p.costPrice != null ? String(p.costPrice) : '',
      promoLabel: p.promoLabel || '',
      stock: String(p.stock ?? ''),
      category: p.category,
      datePurchased: p.datePurchased || '',
      country: p.country || '',
      images: p.images || [],
      imageLabels: (p.images || []).map((_, i) => p.imageLabels?.[i] || ''),
      isAvailable: p.isAvailable !== false,
    });
    setEditingId(p.id);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const room = 5 - form.images.length;
    const toUpload = Array.from(files).slice(0, room);
    if (toUpload.length === 0) return;

    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of toUpload) {
        urls.push(await uploadImageFile(file));
      }
      setForm((prev) => ({
        ...prev,
        images: [...prev.images, ...urls],
        imageLabels: [...prev.imageLabels, ...urls.map(() => '')],
      }));
    } catch {
      alert('Failed to upload one or more images. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      imageLabels: prev.imageLabels.filter((_, i) => i !== index),
    }));
  };

  const setImageLabel = (index: number, text: string) => {
    setForm((prev) => {
      const labels = [...prev.imageLabels];
      labels[index] = text;
      return { ...prev, imageLabels: labels };
    });
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      alert('Please enter a product name.');
      return;
    }
    if (!form.price.trim() || isNaN(Number(form.price))) {
      alert('Please enter a valid selling price.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        salePrice: form.salePrice ? Number(form.salePrice) : null,
        costPrice: form.costPrice ? Number(form.costPrice) : 0,
        promoLabel: form.promoLabel.trim() || null,
        stock: Number(form.stock) || 0,
        category: form.category,
        datePurchased: form.datePurchased.trim() || null,
        country: form.country.trim() || null,
        images: form.images,
        imageLabels: form.imageLabels.map((l) => l.trim()),
        isAvailable: form.isAvailable,
      };

      if (editingId) {
        await updateProduct(editingId, payload);
      } else {
        await addProduct(payload);
      }
      closeForm();
    } catch {
      alert('Failed to save the product. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p: Product) => {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    try {
      await deleteProduct(p.id);
    } catch {
      alert('Failed to delete the product.');
    }
  };

  const ageing = calculateAgeing(form.datePurchased);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Products</h1>
          <p>{products.length} products</p>
        </div>
        <button className="admin-primary-btn" onClick={openAdd}>
          + Add Product
        </button>
      </div>

      {loading ? (
        <p className="admin-muted">Loading products...</p>
      ) : products.length === 0 ? (
        <p className="admin-muted">No products yet. Add your first one.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Photo</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Country</th>
                <th>Ageing</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>
                    {p.images?.[0] ? (
                      <img src={p.images[0]} alt={p.name} className="admin-thumb" />
                    ) : (
                      <div className="admin-thumb admin-thumb-empty">—</div>
                    )}
                  </td>
                  <td className="admin-name-cell">
                    {p.name}
                    {!p.isAvailable && <span className="admin-pill admin-pill-off">Hidden</span>}
                  </td>
                  <td>{CATEGORIES.find((c) => c.id === p.category)?.name || p.category}</td>
                  <td>{formatPrice(p.price)}</td>
                  <td>{p.stock}</td>
                  <td>{p.country || '—'}</td>
                  <td>{calculateAgeing(p.datePurchased) || '—'}</td>
                  <td className="admin-actions">
                    <button className="admin-link-btn" onClick={() => openEdit(p)}>
                      Edit
                    </button>
                    <button className="admin-link-btn admin-danger" onClick={() => handleDelete(p)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="admin-modal-overlay" onClick={closeForm}>
          <form className="admin-modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSave}>
            <h2>{editingId ? 'Edit Product' : 'Add Product'}</h2>

            {/* Photos */}
            <label className="admin-field-label">Photos (up to 5)</label>
            <div className="admin-image-row">
              {form.images.map((url, index) => (
                <div key={index} className="admin-image-card">
                  <div className="admin-image-thumb">
                    <img src={url} alt={`Product ${index + 1}`} />
                    <button
                      type="button"
                      className="admin-image-remove"
                      onClick={() => removeImage(index)}
                    >
                      ×
                    </button>
                  </div>
                  <input
                    type="text"
                    className="admin-image-label"
                    placeholder="Add label..."
                    value={form.imageLabels[index] || ''}
                    onChange={(e) => setImageLabel(index, e.target.value)}
                  />
                </div>
              ))}
              {form.images.length < 5 && (
                <label className="admin-image-add">
                  {uploading ? '...' : '+'}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    hidden
                    onChange={(e) => handleImageUpload(e.target.files)}
                  />
                </label>
              )}
            </div>

            <label className="admin-field-label">Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Designer Handbag"
            />

            <label className="admin-field-label">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe the product..."
              rows={3}
            />

            <div className="admin-form-row">
              <div>
                <label className="admin-field-label">Selling Price (PHP) *</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="admin-field-label">Cost Price (PHP)</label>
                <input
                  type="number"
                  value={form.costPrice}
                  onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="admin-form-row">
              <div>
                <label className="admin-field-label">Stock</label>
                <input
                  type="number"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="admin-field-label">Country Bought</label>
                <input
                  type="text"
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  placeholder="e.g. USA, Japan"
                />
              </div>
            </div>

            <label className="admin-field-label">Date Purchased</label>
            <input
              type="date"
              value={form.datePurchased}
              onChange={(e) => setForm({ ...form, datePurchased: e.target.value })}
            />
            {ageing && (
              <div className="admin-ageing">
                <span>Ageing</span>
                <strong>{ageing}</strong>
              </div>
            )}

            <label className="admin-field-label">Category</label>
            <div className="admin-category-grid">
              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  className={`admin-category-btn ${form.category === cat.id ? 'active' : ''}`}
                  onClick={() => setForm({ ...form, category: cat.id })}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <div className="admin-form-row">
              <div>
                <label className="admin-field-label">Sale Price (PHP)</label>
                <input
                  type="number"
                  value={form.salePrice}
                  onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
                  placeholder="Leave empty if no sale"
                />
              </div>
              <div>
                <label className="admin-field-label">Promo Label</label>
                <input
                  type="text"
                  value={form.promoLabel}
                  onChange={(e) => setForm({ ...form, promoLabel: e.target.value })}
                  placeholder="e.g. Buy 5 Take 1"
                />
              </div>
            </div>

            <label className="admin-checkbox">
              <input
                type="checkbox"
                checked={form.isAvailable}
                onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })}
              />
              Available for sale (visible in the store)
            </label>

            <div className="admin-modal-actions">
              <button type="button" className="admin-secondary-btn" onClick={closeForm}>
                Cancel
              </button>
              <button type="submit" className="admin-primary-btn" disabled={saving || uploading}>
                {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Product'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
