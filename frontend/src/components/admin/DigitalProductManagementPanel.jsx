import React, { useState, useEffect } from 'react';
import {
  Layers, Plus, Edit2, Trash2, X, RefreshCw, CheckCircle2,
  Tv, Gift, ShoppingBag, Tag, Image as ImageIcon
} from 'lucide-react';
import { adminService } from '../../services/adminService';

export default function DigitalProductManagementPanel({ toast }) {
  const [section, setSection] = useState('subscriptions'); // 'subscriptions' | 'giftcards'
  const [subTab, setSubTab] = useState('products'); // 'categories' | 'products' | 'orders'
  const [gcTab, setGcTab] = useState('cards'); // 'brands' | 'cards' | 'orders'
  const [loading, setLoading] = useState(false);

  // Subscriptions State
  const [subCategories, setSubCategories] = useState([]);
  const [subProducts, setSubProducts] = useState([]);
  const [subOrders, setSubOrders] = useState([]);

  // Gift Cards State
  const [gcBrands, setGcBrands] = useState([]);
  const [giftCards, setGiftCards] = useState([]);
  const [gcOrders, setGcOrders] = useState([]);

  // Modal States
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');

  const [subProdModalOpen, setSubProdModalOpen] = useState(false);
  const [editingSubProd, setEditingSubProd] = useState(null);
  const [subTitle, setSubTitle] = useState('');
  const [subCategoryName, setSubCategoryName] = useState('');
  const [subDescription, setSubDescription] = useState('');
  const [subImage, setSubImage] = useState('');
  const [subPlans, setSubPlans] = useState([
    { id: 'p1', name: '1 Month Pass', duration: '1 Month', price: 9.99, status: 'ON' }
  ]);

  const [brandModalOpen, setBrandModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [brandName, setBrandName] = useState('');
  const [brandLogo, setBrandLogo] = useState('');
  const [brandDesc, setBrandDesc] = useState('');

  const [gcModalOpen, setGcModalOpen] = useState(false);
  const [editingGc, setEditingGc] = useState(null);
  const [gcBrandName, setGcBrandName] = useState('');
  const [gcImage, setGcImage] = useState('');
  const [gcDesc, setGcDesc] = useState('');
  const [gcStock, setGcStock] = useState('20');
  const [gcPrice, setGcPrice] = useState('25.00');
  const [gcStatus, setGcStatus] = useState('ON');

  const loadData = async () => {
    try {
      setLoading(true);
      const [cats, prods, sOrders, brands, cards, gOrders] = await Promise.all([
        adminService.digital.listSubCategories().catch(() => []),
        adminService.digital.listSubProducts().catch(() => []),
        adminService.digital.listSubOrders().catch(() => []),
        adminService.digital.listGcBrands().catch(() => []),
        adminService.digital.listGiftCards().catch(() => []),
        adminService.digital.listGcOrders().catch(() => []),
      ]);
      setSubCategories(cats);
      setSubProducts(prods);
      setSubOrders(sOrders);
      setGcBrands(brands);
      setGiftCards(cards);
      setGcOrders(gOrders);
      if (cats.length > 0 && !subCategoryName) setSubCategoryName(cats[0].name);
      if (brands.length > 0 && !gcBrandName) setGcBrandName(brands[0].name);
    } catch {
      toast({ title: 'Failed to load digital product data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Category Actions ---
  const handleSaveCategory = async (e) => {
    e?.preventDefault();
    if (!catName.trim()) return;
    try {
      if (editingCat) {
        await adminService.digital.updateSubCategory(editingCat.id, { name: catName, description: catDesc });
        toast({ title: 'Category updated' });
      } else {
        await adminService.digital.createSubCategory({ name: catName, description: catDesc });
        toast({ title: 'Category added' });
      }
      setCatModalOpen(false);
      await loadData();
    } catch (err) {
      toast({ title: 'Action failed', description: err.message, variant: 'destructive' });
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Delete category?')) return;
    try {
      await adminService.digital.deleteSubCategory(id);
      toast({ title: 'Category deleted' });
      await loadData();
    } catch (err) {
      toast({ title: 'Delete failed', description: err.message, variant: 'destructive' });
    }
  };

  // --- Subscription Product Actions ---
  const handleSaveSubProduct = async (e) => {
    e?.preventDefault();
    if (!subTitle.trim()) return;
    try {
      const payload = {
        title: subTitle.trim(),
        description: subDescription.trim(),
        categoryName: subCategoryName || 'General',
        image: subImage.trim(),
        plans: subPlans,
      };
      if (editingSubProd) {
        await adminService.digital.updateSubProduct(editingSubProd.id, payload);
        toast({ title: 'Subscription product updated' });
      } else {
        await adminService.digital.createSubProduct(payload);
        toast({ title: 'Subscription product added' });
      }
      setSubProdModalOpen(false);
      await loadData();
    } catch (err) {
      toast({ title: 'Save failed', description: err.message, variant: 'destructive' });
    }
  };

  const handleDeleteSubProduct = async (id) => {
    if (!window.confirm('Delete this subscription product?')) return;
    try {
      await adminService.digital.deleteSubProduct(id);
      toast({ title: 'Product deleted' });
      await loadData();
    } catch (err) {
      toast({ title: 'Delete failed', description: err.message, variant: 'destructive' });
    }
  };

  // --- Brand Actions ---
  const handleSaveBrand = async (e) => {
    e?.preventDefault();
    if (!brandName.trim()) return;
    try {
      if (editingBrand) {
        await adminService.digital.updateGcBrand(editingBrand.id, { name: brandName, logo: brandLogo, description: brandDesc });
        toast({ title: 'Brand updated' });
      } else {
        await adminService.digital.createGcBrand({ name: brandName, logo: brandLogo, description: brandDesc });
        toast({ title: 'Brand added' });
      }
      setBrandModalOpen(false);
      await loadData();
    } catch (err) {
      toast({ title: 'Action failed', description: err.message, variant: 'destructive' });
    }
  };

  const handleDeleteBrand = async (id) => {
    if (!window.confirm('Delete brand?')) return;
    try {
      await adminService.digital.deleteGcBrand(id);
      toast({ title: 'Brand deleted' });
      await loadData();
    } catch (err) {
      toast({ title: 'Delete failed', description: err.message, variant: 'destructive' });
    }
  };

  // --- Gift Card Actions ---
  const handleSaveGiftCard = async (e) => {
    e?.preventDefault();
    try {
      const payload = {
        brandName: gcBrandName || 'Gift Card',
        image: gcImage.trim(),
        description: gcDesc.trim(),
        stock: parseInt(gcStock, 10) || 0,
        price: parseFloat(gcPrice) || 0,
        status: gcStatus,
      };
      if (editingGc) {
        await adminService.digital.updateGiftCard(editingGc.id, payload);
        toast({ title: 'Gift card updated' });
      } else {
        await adminService.digital.createGiftCard(payload);
        toast({ title: 'Gift card created' });
      }
      setGcModalOpen(false);
      await loadData();
    } catch (err) {
      toast({ title: 'Save failed', description: err.message, variant: 'destructive' });
    }
  };

  const handleDeleteGiftCard = async (id) => {
    if (!window.confirm('Delete this gift card?')) return;
    try {
      await adminService.digital.deleteGiftCard(id);
      toast({ title: 'Gift card deleted' });
      await loadData();
    } catch (err) {
      toast({ title: 'Delete failed', description: err.message, variant: 'destructive' });
    }
  };

  return (
    <div className="p-5 space-y-6" data-testid="digital-product-panel">
      {/* Top Section Tabs: Subscriptions vs Gift Cards */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            data-testid="digital-section-subscriptions"
            onClick={() => setSection('subscriptions')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              section === 'subscriptions'
                ? 'bg-emerald-500 text-slate-950 border-emerald-500 shadow-lg shadow-emerald-500/20'
                : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
            }`}
          >
            <Tv size={14} /> 1. Subscription Management
          </button>
          <button
            type="button"
            data-testid="digital-section-giftcards"
            onClick={() => setSection('giftcards')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              section === 'giftcards'
                ? 'bg-emerald-500 text-slate-950 border-emerald-500 shadow-lg shadow-emerald-500/20'
                : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
            }`}
          >
            <Gift size={14} /> 2. Gift Card Management
          </button>
        </div>

        <button
          type="button"
          onClick={loadData}
          className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white"
          title="Refresh"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: SUBSCRIPTION MANAGEMENT */}
      {/* ========================================================================= */}
      {section === 'subscriptions' && (
        <div className="space-y-4" data-testid="sub-mgmt-section">
          {/* Sub Navigation Bar: Categories | Products | Orders */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white/[0.02] p-2 rounded-xl border border-white/5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                data-testid="sub-tab-categories"
                onClick={() => setSubTab('categories')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${subTab === 'categories' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Categories ({subCategories.length})
              </button>
              <button
                type="button"
                data-testid="sub-tab-products"
                onClick={() => setSubTab('products')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${subTab === 'products' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Products & Plans ({subProducts.length})
              </button>
              <button
                type="button"
                data-testid="sub-tab-orders"
                onClick={() => setSubTab('orders')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${subTab === 'orders' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Subscription Orders ({subOrders.length})
              </button>
            </div>

            {subTab === 'categories' && (
              <button
                type="button"
                data-testid="add-sub-category-btn"
                onClick={() => { setEditingCat(null); setCatName(''); setCatDesc(''); setCatModalOpen(true); }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400"
              >
                <Plus size={13} /> Add Category
              </button>
            )}
            {subTab === 'products' && (
              <button
                type="button"
                data-testid="add-sub-product-btn"
                onClick={() => {
                  setEditingSubProd(null);
                  setSubTitle('');
                  setSubDescription('');
                  setSubImage('');
                  setSubPlans([{ id: 'p1', name: 'Monthly Plan', duration: '1 Month', price: 14.99, status: 'ON' }]);
                  setSubProdModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400"
              >
                <Plus size={13} /> Add Digital Product
              </button>
            )}
          </div>

          {/* SubTab 1: Categories */}
          {subTab === 'categories' && (
            <div className="overflow-auto rounded-xl border border-white/5" data-testid="sub-categories-table">
              <table className="w-full text-xs">
                <thead className="text-[10px] uppercase font-mono tracking-wider text-slate-400 bg-white/[0.03]">
                  <tr>
                    <th className="text-left py-3 px-4">Category Name</th>
                    <th className="text-left">Description</th>
                    <th className="text-left">Created</th>
                    <th className="text-right px-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {subCategories.map((c) => (
                    <tr key={c.id} className="hover:bg-white/[0.02]" data-testid={`sub-cat-row-${c.id}`}>
                      <td className="py-3 px-4 text-white font-medium">{c.name}</td>
                      <td className="text-slate-400">{c.description || '—'}</td>
                      <td className="text-slate-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td className="text-right px-4">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            data-testid={`edit-sub-cat-${c.id}`}
                            onClick={() => { setEditingCat(c); setCatName(c.name); setCatDesc(c.description || ''); setCatModalOpen(true); }}
                            className="p-1.5 rounded-lg bg-white/5 text-slate-300 hover:text-white"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            type="button"
                            data-testid={`delete-sub-cat-${c.id}`}
                            onClick={() => handleDeleteCategory(c.id)}
                            className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* SubTab 2: Products & Plans */}
          {subTab === 'products' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="sub-products-list">
              {subProducts.map((p) => (
                <div key={p.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3" data-testid={`sub-prod-card-${p.id}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {p.image ? (
                        <img src={p.image} alt={p.title} className="h-11 w-11 rounded-lg object-cover border border-white/10 shrink-0" />
                      ) : (
                        <div className="h-11 w-11 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 shrink-0">
                          <Tv size={18} />
                        </div>
                      )}
                      <div>
                        <h4 className="text-sm font-bold text-white">{p.title}</h4>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-white/5 border border-white/10 text-slate-400">
                          {p.categoryName || 'General'}
                        </span>
                      </div>
                    </div>
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        data-testid={`edit-sub-prod-${p.id}`}
                        onClick={() => {
                          setEditingSubProd(p);
                          setSubTitle(p.title);
                          setSubCategoryName(p.categoryName || '');
                          setSubDescription(p.description || '');
                          setSubImage(p.image || '');
                          setSubPlans(p.plans || []);
                          setSubProdModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-white/5 text-slate-300 hover:text-white"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        type="button"
                        data-testid={`delete-sub-prod-${p.id}`}
                        onClick={() => handleDeleteSubProduct(p.id)}
                        className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2">{p.description}</p>

                  {/* Plans Breakdown */}
                  <div className="space-y-1.5 pt-1 border-t border-white/5">
                    <div className="text-[10px] font-mono uppercase text-slate-500">Subscription Plans:</div>
                    <div className="grid grid-cols-2 gap-2">
                      {(p.plans || []).map((pl, i) => (
                        <div key={i} className="p-2 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between text-xs">
                          <div>
                            <span className="text-white font-medium block">{pl.name}</span>
                            <span className="text-[10px] text-slate-400">{pl.duration}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-emerald-400 font-mono font-bold block">${Number(pl.price || 0).toFixed(2)}</span>
                            <span className={`text-[9px] font-bold px-1 rounded ${pl.status === 'ON' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                              {pl.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SubTab 3: Subscription Orders List */}
          {subTab === 'orders' && (
            <div className="overflow-auto rounded-xl border border-white/5" data-testid="sub-orders-table">
              <table className="w-full text-xs">
                <thead className="text-[10px] uppercase font-mono tracking-wider text-slate-400 bg-white/[0.03]">
                  <tr>
                    <th className="text-left py-3 px-4">User</th>
                    <th className="text-left">Product</th>
                    <th className="text-left">Plan</th>
                    <th className="text-left">Price</th>
                    <th className="text-left">Order Status</th>
                    <th className="text-right px-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {subOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-white/[0.02]" data-testid={`sub-order-row-${o.id}`}>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{o.userName || 'Customer'}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{o.userEmail}</div>
                      </td>
                      <td className="text-white font-medium">{o.productTitle}</td>
                      <td className="text-slate-300 font-mono">{o.planName}</td>
                      <td className="text-emerald-400 font-mono font-bold">${Number(o.price || 0).toFixed(2)}</td>
                      <td>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                          {o.orderStatus}
                        </span>
                      </td>
                      <td className="text-right px-4 text-slate-400">{new Date(o.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: GIFT CARD MANAGEMENT */}
      {/* ========================================================================= */}
      {section === 'giftcards' && (
        <div className="space-y-4" data-testid="gc-mgmt-section">
          {/* Sub Navigation Bar: Brands | Gift Cards | Orders */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white/[0.02] p-2 rounded-xl border border-white/5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                data-testid="gc-tab-brands"
                onClick={() => setGcTab('brands')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${gcTab === 'brands' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Brands ({gcBrands.length})
              </button>
              <button
                type="button"
                data-testid="gc-tab-cards"
                onClick={() => setGcTab('cards')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${gcTab === 'cards' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Gift Cards ({giftCards.length})
              </button>
              <button
                type="button"
                data-testid="gc-tab-orders"
                onClick={() => setGcTab('orders')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${gcTab === 'orders' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Gift Card Orders ({gcOrders.length})
              </button>
            </div>

            {gcTab === 'brands' && (
              <button
                type="button"
                data-testid="add-gc-brand-btn"
                onClick={() => { setEditingBrand(null); setBrandName(''); setBrandLogo(''); setBrandDesc(''); setBrandModalOpen(true); }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400"
              >
                <Plus size={13} /> Add Brand
              </button>
            )}
            {gcTab === 'cards' && (
              <button
                type="button"
                data-testid="add-gift-card-btn"
                onClick={() => {
                  setEditingGc(null);
                  setGcDesc('');
                  setGcImage('');
                  setGcStock('50');
                  setGcPrice('50.00');
                  setGcStatus('ON');
                  setGcModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400"
              >
                <Plus size={13} /> Add Gift Card
              </button>
            )}
          </div>

          {/* Brands Tab */}
          {gcTab === 'brands' && (
            <div className="overflow-auto rounded-xl border border-white/5" data-testid="gc-brands-table">
              <table className="w-full text-xs">
                <thead className="text-[10px] uppercase font-mono tracking-wider text-slate-400 bg-white/[0.03]">
                  <tr>
                    <th className="text-left py-3 px-4">Brand</th>
                    <th className="text-left">Description</th>
                    <th className="text-left">Created</th>
                    <th className="text-right px-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {gcBrands.map((b) => (
                    <tr key={b.id} className="hover:bg-white/[0.02]" data-testid={`gc-brand-row-${b.id}`}>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {b.logo && <img src={b.logo} alt={b.name} className="h-6 w-6 rounded object-cover" />}
                          <span className="text-white font-medium">{b.name}</span>
                        </div>
                      </td>
                      <td className="text-slate-400">{b.description || '—'}</td>
                      <td className="text-slate-500">{new Date(b.createdAt).toLocaleDateString()}</td>
                      <td className="text-right px-4">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            data-testid={`edit-gc-brand-${b.id}`}
                            onClick={() => { setEditingBrand(b); setBrandName(b.name); setBrandLogo(b.logo || ''); setBrandDesc(b.description || ''); setBrandModalOpen(true); }}
                            className="p-1.5 rounded-lg bg-white/5 text-slate-300 hover:text-white"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            type="button"
                            data-testid={`delete-gc-brand-${b.id}`}
                            onClick={() => handleDeleteBrand(b.id)}
                            className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Cards Tab */}
          {gcTab === 'cards' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="gift-cards-grid">
              {giftCards.map((gc) => (
                <div key={gc.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3" data-testid={`gc-card-${gc.id}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {gc.image ? (
                        <img src={gc.image} alt={gc.brandName} className="h-10 w-10 rounded-lg object-cover border border-white/10" />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
                          <Gift size={16} />
                        </div>
                      )}
                      <div>
                        <h4 className="text-sm font-bold text-white">{gc.brandName}</h4>
                        <span className="text-emerald-400 font-mono font-bold">${Number(gc.price || 0).toFixed(2)}</span>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${gc.status === 'ON' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                      {gc.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2">{gc.description}</p>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-mono">Stock: <strong className="text-white">{gc.stock ?? 0}</strong></span>
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        data-testid={`edit-gc-${gc.id}`}
                        onClick={() => {
                          setEditingGc(gc);
                          setGcBrandName(gc.brandName);
                          setGcImage(gc.image || '');
                          setGcDesc(gc.description || '');
                          setGcStock(String(gc.stock ?? 0));
                          setGcPrice(String(gc.price || 0));
                          setGcStatus(gc.status || 'ON');
                          setGcModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-white/5 text-slate-300 hover:text-white"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        type="button"
                        data-testid={`delete-gc-${gc.id}`}
                        onClick={() => handleDeleteGiftCard(gc.id)}
                        className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Orders Tab */}
          {gcTab === 'orders' && (
            <div className="overflow-auto rounded-xl border border-white/5" data-testid="gc-orders-table">
              <table className="w-full text-xs">
                <thead className="text-[10px] uppercase font-mono tracking-wider text-slate-400 bg-white/[0.03]">
                  <tr>
                    <th className="text-left py-3 px-4">User</th>
                    <th className="text-left">Brand</th>
                    <th className="text-left">Amount</th>
                    <th className="text-left">Order Status</th>
                    <th className="text-left">Delivery Status</th>
                    <th className="text-right px-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {gcOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-white/[0.02]" data-testid={`gc-order-row-${o.id}`}>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{o.userName || 'Customer'}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{o.userEmail}</div>
                      </td>
                      <td className="text-white font-medium">{o.brandName}</td>
                      <td className="text-emerald-400 font-mono font-bold">${Number(o.amount || 0).toFixed(2)}</td>
                      <td>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                          {o.orderStatus}
                        </span>
                      </td>
                      <td>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/20 text-sky-400 border border-sky-500/30 uppercase">
                          {o.deliveryStatus}
                        </span>
                      </td>
                      <td className="text-right px-4 text-slate-400">{new Date(o.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}

      {/* Category Modal */}
      {catModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" data-testid="cat-modal">
          <div className="w-full max-w-md card-surface rounded-2xl border border-white/10 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="text-sm font-bold text-white">{editingCat ? 'Edit Category' : 'Add Category'}</h3>
              <button type="button" onClick={() => setCatModalOpen(false)} className="text-slate-400 hover:text-white"><X size={16} /></button>
            </div>
            <form onSubmit={handleSaveCategory} className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  data-testid="sub-cat-name-input"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full bg-[#0a0f1e] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
              </div>
              <div>
                <label className="text-xs text-slate-300 block mb-1">Description</label>
                <textarea
                  rows={2}
                  data-testid="sub-cat-desc-input"
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  className="w-full bg-[#0a0f1e] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setCatModalOpen(false)} className="px-3 py-1.5 rounded-lg text-xs text-slate-400">Cancel</button>
                <button type="submit" data-testid="save-sub-cat-btn" className="px-4 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subscription Product Modal */}
      {subProdModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" data-testid="sub-prod-modal">
          <div className="w-full max-w-xl card-surface rounded-2xl border border-white/10 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="text-sm font-bold text-white">{editingSubProd ? 'Edit Subscription Product' : 'Add Digital Product'}</h3>
              <button type="button" onClick={() => setSubProdModalOpen(false)} className="text-slate-400 hover:text-white"><X size={16} /></button>
            </div>
            <form onSubmit={handleSaveSubProduct} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  data-testid="sub-prod-title-input"
                  value={subTitle}
                  onChange={(e) => setSubTitle(e.target.value)}
                  className="w-full bg-[#0a0f1e] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Category</label>
                  <select
                    data-testid="sub-prod-cat-select"
                    value={subCategoryName}
                    onChange={(e) => setSubCategoryName(e.target.value)}
                    className="w-full bg-[#0a0f1e] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    {subCategories.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Product Image URL</label>
                  <input
                    type="text"
                    data-testid="sub-prod-image-input"
                    value={subImage}
                    onChange={(e) => setSubImage(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-[#0a0f1e] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Description</label>
                <textarea
                  rows={2}
                  data-testid="sub-prod-desc-input"
                  value={subDescription}
                  onChange={(e) => setSubDescription(e.target.value)}
                  className="w-full bg-[#0a0f1e] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              {/* Plans Section */}
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Subscription Plans</span>
                  <button
                    type="button"
                    data-testid="add-sub-plan-btn"
                    onClick={() => setSubPlans([...subPlans, { id: `p_${Date.now()}`, name: 'New Plan', duration: '1 Month', price: 9.99, status: 'ON' }])}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold inline-flex items-center gap-1"
                  >
                    <Plus size={12} /> Add Plan
                  </button>
                </div>

                <div className="space-y-2">
                  {subPlans.map((pl, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-black/40 p-2 rounded-lg border border-white/5">
                      <div className="col-span-4">
                        <input
                          type="text"
                          placeholder="Plan Name"
                          data-testid={`plan-name-input-${idx}`}
                          value={pl.name}
                          onChange={(e) => {
                            const updated = [...subPlans];
                            updated[idx].name = e.target.value;
                            setSubPlans(updated);
                          }}
                          className="w-full bg-transparent border border-white/10 rounded px-2 py-1 text-xs text-white"
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="text"
                          placeholder="Duration (e.g. 1 Month)"
                          data-testid={`plan-duration-input-${idx}`}
                          value={pl.duration}
                          onChange={(e) => {
                            const updated = [...subPlans];
                            updated[idx].duration = e.target.value;
                            setSubPlans(updated);
                          }}
                          className="w-full bg-transparent border border-white/10 rounded px-2 py-1 text-xs text-white"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Price"
                          data-testid={`plan-price-input-${idx}`}
                          value={pl.price}
                          onChange={(e) => {
                            const updated = [...subPlans];
                            updated[idx].price = parseFloat(e.target.value) || 0;
                            setSubPlans(updated);
                          }}
                          className="w-full bg-transparent border border-white/10 rounded px-2 py-1 text-xs text-white font-mono"
                        />
                      </div>
                      <div className="col-span-2">
                        <button
                          type="button"
                          data-testid={`plan-status-toggle-${idx}`}
                          onClick={() => {
                            const updated = [...subPlans];
                            updated[idx].status = updated[idx].status === 'ON' ? 'OFF' : 'ON';
                            setSubPlans(updated);
                          }}
                          className={`w-full py-1 text-[10px] font-bold rounded border ${
                            pl.status === 'ON' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-slate-700 border-slate-600 text-slate-400'
                          }`}
                        >
                          {pl.status}
                        </button>
                      </div>
                      <div className="col-span-1 text-center">
                        <button
                          type="button"
                          onClick={() => setSubPlans(subPlans.filter((_, i) => i !== idx))}
                          className="text-slate-500 hover:text-rose-400"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                <button type="button" onClick={() => setSubProdModalOpen(false)} className="px-4 py-2 rounded-lg text-xs text-slate-400">Cancel</button>
                <button type="submit" data-testid="save-sub-prod-btn" className="px-5 py-2 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Brand Modal */}
      {brandModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" data-testid="brand-modal">
          <div className="w-full max-w-md card-surface rounded-2xl border border-white/10 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="text-sm font-bold text-white">{editingBrand ? 'Edit Brand' : 'Add Brand'}</h3>
              <button type="button" onClick={() => setBrandModalOpen(false)} className="text-slate-400 hover:text-white"><X size={16} /></button>
            </div>
            <form onSubmit={handleSaveBrand} className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Brand Name *</label>
                <input
                  type="text"
                  required
                  data-testid="gc-brand-name-input"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full bg-[#0a0f1e] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
              </div>
              <div>
                <label className="text-xs text-slate-300 block mb-1">Brand Logo URL</label>
                <input
                  type="text"
                  data-testid="gc-brand-logo-input"
                  value={brandLogo}
                  onChange={(e) => setBrandLogo(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-[#0a0f1e] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-300 block mb-1">Description</label>
                <textarea
                  rows={2}
                  data-testid="gc-brand-desc-input"
                  value={brandDesc}
                  onChange={(e) => setBrandDesc(e.target.value)}
                  className="w-full bg-[#0a0f1e] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setBrandModalOpen(false)} className="px-3 py-1.5 rounded-lg text-xs text-slate-400">Cancel</button>
                <button type="submit" data-testid="save-gc-brand-btn" className="px-4 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Gift Card Modal */}
      {gcModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" data-testid="gift-card-modal">
          <div className="w-full max-w-md card-surface rounded-2xl border border-white/10 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="text-sm font-bold text-white">{editingGc ? 'Edit Gift Card' : 'Add Gift Card'}</h3>
              <button type="button" onClick={() => setGcModalOpen(false)} className="text-slate-400 hover:text-white"><X size={16} /></button>
            </div>
            <form onSubmit={handleSaveGiftCard} className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Brand</label>
                <select
                  data-testid="gc-card-brand-select"
                  value={gcBrandName}
                  onChange={(e) => setGcBrandName(e.target.value)}
                  className="w-full bg-[#0a0f1e] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                >
                  {gcBrands.map((b) => (
                    <option key={b.id} value={b.name}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Pricing ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    data-testid="gc-card-price-input"
                    value={gcPrice}
                    onChange={(e) => setGcPrice(e.target.value)}
                    className="w-full bg-[#0a0f1e] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    data-testid="gc-card-stock-input"
                    value={gcStock}
                    onChange={(e) => setGcStock(e.target.value)}
                    className="w-full bg-[#0a0f1e] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Image URL</label>
                <input
                  type="text"
                  data-testid="gc-card-image-input"
                  value={gcImage}
                  onChange={(e) => setGcImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-[#0a0f1e] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Description</label>
                <textarea
                  rows={2}
                  data-testid="gc-card-desc-input"
                  value={gcDesc}
                  onChange={(e) => setGcDesc(e.target.value)}
                  className="w-full bg-[#0a0f1e] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Status ON/OFF</label>
                <button
                  type="button"
                  data-testid="gc-card-status-toggle"
                  onClick={() => setGcStatus(gcStatus === 'ON' ? 'OFF' : 'ON')}
                  className={`w-full py-2 rounded-xl text-xs font-bold border transition-all ${
                    gcStatus === 'ON' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-slate-700 border-slate-600 text-slate-400'
                  }`}
                >
                  Status: {gcStatus}
                </button>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setGcModalOpen(false)} className="px-3 py-1.5 rounded-lg text-xs text-slate-400">Cancel</button>
                <button type="submit" data-testid="save-gc-card-btn" className="px-4 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
