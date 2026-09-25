import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ShieldCheck, Users, Package, Wallet, Star, FileText, CheckCircle2, XCircle,
  Clock, TrendingUp, BarChart3, Plus, Edit2, Trash2, Eye, Ban, Check, X, Upload,
  Image as ImageIcon, DollarSign, Layers, AlertTriangle, RefreshCw
} from 'lucide-react';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationsContext';
import { sellerService, SELLER_CATEGORIES } from '../services/sellerService';
import { useToast } from '../hooks/use-toast';
import NotificationCenter from '../components/NotificationCenter';

const TABS = [
  { id: 'sellers', label: 'Seller Applications', Icon: ShieldCheck },
  { id: 'products', label: 'Product Approvals', Icon: Package },
  { id: 'withdrawals', label: 'Withdraw Management', Icon: Wallet },
  { id: 'sellerMgmt', label: 'Seller Management', Icon: Users },
  { id: 'reviews', label: 'Reviews Management', Icon: Star },
  { id: 'reports', label: 'Reports', Icon: FileText },
];

export default function AdminPanel() {
  const { user, isAuthenticated, loading } = useAuth();
  const { notifyUser } = useNotifications();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [tab, setTab] = useState(() => {
    try {
      return new URLSearchParams(window.location.search).get('tab') || 'sellers';
    } catch (_) {
      return 'sellers';
    }
  });
  const [applications, setApplications] = useState([]);
  const [products, setProducts] = useState([]);
  const [adminProductsList, setAdminProductsList] = useState([]);
  const [sellersList, setSellersList] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);

  // Product Management Modal State
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [prodTitle, setProdTitle] = useState('');
  const [prodCategory, setProdCategory] = useState(SELLER_CATEGORIES[0] || 'Software');
  const [prodPrice, setProdPrice] = useState('29.99');
  const [prodStock, setProdStock] = useState('100');
  const [prodInStock, setProdInStock] = useState(true);
  const [prodDesc, setProdDesc] = useState('');
  const [prodImage, setProdImage] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [productSubTab, setProductSubTab] = useState('all'); // 'all' | 'pending'

  // Seller Details & Suspend Modal State
  const [selectedSellerSummary, setSelectedSellerSummary] = useState(null);
  const [sellerModalOpen, setSellerModalOpen] = useState(false);
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [targetSeller, setTargetSeller] = useState(null);
  const [suspendReason, setSuspendReason] = useState('');

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) navigate('/login', { state: { from: { pathname: '/admin' } } });
  }, [loading, isAuthenticated, navigate]);

  const loadData = async () => {
    try {
      const [apps, prods, adminProds, wds, sellers] = await Promise.all([
        sellerService.listApplications(),
        sellerService.listProducts(),
        sellerService.adminListProducts().catch(() => []),
        sellerService.listWithdrawals(),
        sellerService.adminListSellers().catch(() => []),
      ]);
      setApplications(apps || []);
      setProducts(prods || []);
      setAdminProductsList(adminProds || []);
      setWithdrawals(wds || []);
      setSellersList(sellers || []);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadData();
  }, [tab]);

  const counts = useMemo(() => ({
    pendingApps: applications.filter((a) => a.status === 'pending').length,
    pendingProds: products.filter((p) => p.status === 'pending').length,
    pendingWd: withdrawals.filter((w) => w.status === 'pending').length,
    approvedSellers: sellersList.length > 0 ? sellersList.length : applications.filter((a) => a.status === 'approved').length,
    totalProducts: adminProductsList.length > 0 ? adminProductsList.length : products.length,
  }), [applications, products, adminProductsList, withdrawals, sellersList]);

  // Seller Decision
  const decideApp = async (a, action) => {
    const reason = action === 'reject' ? (prompt('Optional rejection reason?') || '') : '';
    await sellerService.decideApplication(a.id, action, reason);
    notifyUser(a.userId, {
      title: action === 'approve' ? 'Seller application approved' : 'Seller application rejected',
      message: action === 'approve' ? `You can now sell as “${a.sellerType.replace(/-/g, ' ')}”.` : (reason || 'Please review the requirements and reapply.'),
      kind: action === 'approve' ? 'success' : 'error',
      category: 'seller',
      link: action === 'approve' ? '/seller/upload' : '/become-seller',
    });
    await loadData();
    toast({ title: `Application ${action}d` });
  };

  // Seller Suspension
  const handleToggleSuspend = async (seller) => {
    setTargetSeller(seller);
    setSuspendReason('');
    setSuspendModalOpen(true);
  };

  const confirmSuspendAction = async () => {
    if (!targetSeller) return;
    const newSuspended = !targetSeller.isSuspended;
    try {
      await sellerService.adminSuspendSeller(targetSeller.userId || targetSeller.id, newSuspended, suspendReason);
      toast({
        title: newSuspended ? 'Seller suspended' : 'Seller unsuspended',
        description: `${targetSeller.fullName || 'Seller'} account has been updated.`
      });
      setSuspendModalOpen(false);
      setTargetSeller(null);
      await loadData();
    } catch (err) {
      toast({ title: 'Action failed', description: err?.response?.data?.detail || err.message, variant: 'destructive' });
    }
  };

  // Seller Profile View
  const handleViewSeller = async (sellerId) => {
    try {
      const summary = await sellerService.adminGetSellerSummary(sellerId);
      setSelectedSellerSummary(summary);
      setSellerModalOpen(true);
    } catch (err) {
      toast({ title: 'Failed to load seller summary', variant: 'destructive' });
    }
  };

  // Product Decision (Approve / Reject)
  const decideProd = async (p, action) => {
    const reason = action === 'reject' ? (prompt('Optional rejection reason?') || '') : '';
    await sellerService.decideProduct(p.id, action, reason);
    notifyUser(p.userId, {
      title: action === 'approve' ? 'Product approved' : 'Product rejected',
      message: action === 'approve' ? `“${p.title}” is now live on the marketplace.` : (reason || 'Please revise and resubmit.'),
      kind: action === 'approve' ? 'success' : 'error',
      category: 'product',
      link: '/my-account',
    });
    await loadData();
    toast({ title: `Product ${action}d` });
  };

  // Product Create / Edit Modal Helpers
  const openAddProductModal = () => {
    setEditingProduct(null);
    setProdTitle('');
    setProdCategory(SELLER_CATEGORIES[0] || 'Software');
    setProdPrice('29.99');
    setProdStock('100');
    setProdInStock(true);
    setProdDesc('');
    setProdImage('');
    setProductModalOpen(true);
  };

  const openEditProductModal = (prod) => {
    setEditingProduct(prod);
    setProdTitle(prod.title || '');
    setProdCategory(prod.category || 'Software');
    setProdPrice(String(prod.price || 0));
    setProdStock(String(prod.stock ?? 100));
    setProdInStock(prod.inStock !== false);
    setProdDesc(prod.description || '');
    setProdImage(prod.image || '');
    setProductModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e?.preventDefault();
    if (!prodTitle.trim()) {
      toast({ title: 'Title is required', variant: 'destructive' });
      return;
    }
    const payload = {
      title: prodTitle.trim(),
      category: prodCategory,
      price: parseFloat(prodPrice) || 0,
      stock: parseInt(prodStock, 10) || 0,
      inStock: prodInStock,
      description: prodDesc.trim(),
      image: prodImage.trim(),
    };

    try {
      if (editingProduct) {
        await sellerService.adminUpdateProduct(editingProduct.id, payload);
        toast({ title: 'Product updated successfully' });
      } else {
        await sellerService.adminCreateProduct(payload);
        toast({ title: 'Product added successfully' });
      }
      setProductModalOpen(false);
      await loadData();
    } catch (err) {
      toast({ title: 'Failed to save product', description: err?.response?.data?.detail || err.message, variant: 'destructive' });
    }
  };

  const handleDeleteProduct = async (prodId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await sellerService.adminDeleteProduct(prodId);
      toast({ title: 'Product deleted' });
      await loadData();
    } catch (err) {
      toast({ title: 'Failed to delete product', description: err?.response?.data?.detail || err.message, variant: 'destructive' });
    }
  };

  const handleImageFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingImage(true);
      const res = await sellerService.uploadFile(file);
      if (res?.id) {
        setProdImage(`/api/files/${res.id}/view`);
        toast({ title: 'Image uploaded successfully' });
      }
    } catch (err) {
      toast({ title: 'Image upload failed', description: err.message, variant: 'destructive' });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const decideWd = async (w, action) => {
    await sellerService.decideWithdrawal(w.id, action);
    notifyUser(w.userId, {
      title: action === 'approve' ? 'Withdrawal approved' : 'Withdrawal rejected',
      message: action === 'approve' ? `Your withdrawal of $${w.amount} has been approved and processed.` : 'Please check your payout details and try again.',
      kind: action === 'approve' ? 'success' : 'error',
      category: 'withdrawal',
    });
    setWithdrawals(await sellerService.listWithdrawals());
    toast({ title: `Withdrawal ${action}d` });
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-slate-100">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0a0f1e]/95 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="h-9 w-9 rounded-lg bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center font-bold text-slate-900 shadow-lg shadow-emerald-500/20">S</span>
            <span className="text-lg font-bold tracking-tight text-white">ShahLance <span className="text-slate-500 font-normal">/ Admin</span></span>
          </Link>
          <div className="flex items-center gap-2">
            <NotificationCenter trigger="bell" />
            <Link to="/admin/console" className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 px-3.5 py-1.5 text-xs font-semibold text-slate-900 btn-hover">
              Admin Console
            </Link>
            <Link to="/my-account" className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-slate-200 btn-hover">
              My Account
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Link to="/my-account" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 btn-hover">
          <ArrowLeft size={14} /> Back to My Account
        </Link>
        <h1 className="mt-3 text-2xl sm:text-3xl font-bold text-white">Admin Control Panel</h1>
        <p className="text-sm text-slate-400 mt-1">Approve sellers, review products, manage withdrawals and platform reports.</p>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat label="Pending Applications" value={counts.pendingApps} Icon={ShieldCheck} color="from-orange-500 to-amber-500" />
          <Stat label="Pending Products" value={counts.pendingProds} Icon={Package} color="from-blue-500 to-indigo-500" />
          <Stat label="Pending Withdrawals" value={counts.pendingWd} Icon={Wallet} color="from-violet-500 to-fuchsia-500" />
          <Stat label="Approved Sellers" value={counts.approvedSellers} Icon={Users} color="from-emerald-500 to-green-500" />
        </div>

        {/* Tabs */}
        <div className="mt-6 flex flex-wrap gap-2">
          {TABS.map((t) => {
            const Icon = t.Icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                data-testid={`admin-tab-${t.id}`}
                onClick={() => setTab(t.id)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold border btn-hover ${
                  active ? 'bg-emerald-500 text-slate-900 border-emerald-500' : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
                }`}
              >
                <Icon size={13} /> {t.label}
              </button>
            );
          })}
        </div>

        <div className="mt-5 card-surface rounded-2xl overflow-hidden">
          {tab === 'sellers' && <AppTable rows={applications} onDecide={decideApp} onViewSeller={handleViewSeller} />}
          {tab === 'products' && (
            <ProductMgmtPanel
              pendingRows={products.filter((p) => p.status === 'pending')}
              allRows={adminProductsList.length > 0 ? adminProductsList : products}
              subTab={productSubTab}
              setSubTab={setProductSubTab}
              onAdd={openAddProductModal}
              onEdit={openEditProductModal}
              onDelete={handleDeleteProduct}
              onDecide={decideProd}
            />
          )}
          {tab === 'withdrawals' && <WdTable rows={withdrawals} onDecide={decideWd} />}
          {tab === 'sellerMgmt' && (
            <SellerMgmtTable
              rows={sellersList.length > 0 ? sellersList : applications.filter((a) => a.status === 'approved')}
              onViewSeller={handleViewSeller}
              onToggleSuspend={handleToggleSuspend}
            />
          )}
          {tab === 'reviews' && <PlaceholderPanel Icon={Star} title="Reviews Management" desc="No new reviews flagged. Everything looks good." />}
          {tab === 'reports' && <ReportsPanel apps={applications} prods={products} wds={withdrawals} />}
        </div>

        {/* Product Add/Edit Modal */}
        {productModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" data-testid="product-modal">
            <div className="w-full max-w-xl card-surface rounded-2xl border border-white/10 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Package className="text-emerald-400 h-5 w-5" />
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button
                  type="button"
                  data-testid="cancel-product-btn"
                  onClick={() => setProductModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    data-testid="product-title-input"
                    value={prodTitle}
                    onChange={(e) => setProdTitle(e.target.value)}
                    placeholder="e.g. Premium Freelance Toolkit"
                    className="w-full bg-[#0a0f1e] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Category</label>
                    <select
                      data-testid="product-category-select"
                      value={prodCategory}
                      onChange={(e) => setProdCategory(e.target.value)}
                      className="w-full bg-[#0a0f1e] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
                    >
                      {SELLER_CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Price ($) *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-slate-400 text-sm">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        data-testid="product-price-input"
                        value={prodPrice}
                        onChange={(e) => setProdPrice(e.target.value)}
                        className="w-full bg-[#0a0f1e] border border-white/10 rounded-xl pl-8 pr-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Stock Management */}
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-3">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Layers size={14} className="text-emerald-400" /> Stock Management
                  </div>
                  <div className="grid grid-cols-2 gap-3 items-center">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Stock Quantity</label>
                      <input
                        type="number"
                        min="0"
                        data-testid="product-stock-input"
                        value={prodStock}
                        onChange={(e) => setProdStock(e.target.value)}
                        className="w-full bg-[#0a0f1e] border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Stock Status</label>
                      <button
                        type="button"
                        data-testid="product-instock-toggle"
                        onClick={() => setProdInStock(!prodInStock)}
                        className={`w-full py-1.5 px-3 rounded-xl text-xs font-bold transition-all border ${
                          prodInStock
                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                            : 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                        }`}
                      >
                        {prodInStock ? 'In Stock' : 'Out of Stock'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Image Upload & URL */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300 block">Product Image</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      data-testid="product-image-url-input"
                      value={prodImage}
                      onChange={(e) => setProdImage(e.target.value)}
                      placeholder="Paste image URL (https://...)"
                      className="flex-1 bg-[#0a0f1e] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                    />
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 text-xs text-white hover:bg-white/20 transition-all">
                      <Upload size={13} />
                      <span>{isUploadingImage ? 'Uploading...' : 'Upload'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        data-testid="product-image-upload"
                        onChange={handleImageFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {prodImage && (
                    <div className="relative w-24 h-20 rounded-lg overflow-hidden border border-white/10 bg-black/40">
                      <img src={prodImage} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setProdImage('')}
                        className="absolute top-1 right-1 p-0.5 rounded-full bg-black/70 text-slate-400 hover:text-white"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Product Description</label>
                  <textarea
                    rows={3}
                    data-testid="product-desc-input"
                    value={prodDesc}
                    onChange={(e) => setProdDesc(e.target.value)}
                    placeholder="Describe the product deliverables, license, and features..."
                    className="w-full bg-[#0a0f1e] border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setProductModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    data-testid="save-product-btn"
                    className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-900 font-bold text-xs hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
                  >
                    {editingProduct ? 'Save Changes' : 'Create Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Seller Profile & Sales Summary Modal */}
        {sellerModalOpen && selectedSellerSummary && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" data-testid="seller-profile-modal">
            <div className="w-full max-w-2xl card-surface rounded-2xl border border-white/10 p-6 space-y-5 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-slate-900 font-bold">
                    {(selectedSellerSummary.seller?.fullName || 'S')[0]}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      {selectedSellerSummary.seller?.fullName || 'Seller Profile'}
                      {selectedSellerSummary.seller?.isSuspended && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold uppercase">
                          Suspended
                        </span>
                      )}
                    </h2>
                    <p className="text-xs text-slate-400 font-mono">{selectedSellerSummary.seller?.email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  data-testid="close-seller-modal-btn"
                  onClick={() => setSellerModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Seller Sales Summary Cards */}
              <div className="space-y-2" data-testid="seller-sales-summary">
                <div className="text-xs font-mono uppercase text-slate-400 tracking-wider">Seller Sales Summary</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="text-lg font-extrabold text-emerald-400">
                      ${Number(selectedSellerSummary.salesSummary?.totalSales || 0).toFixed(2)}
                    </div>
                    <div className="text-[11px] text-slate-400">Total Sales</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="text-lg font-extrabold text-white">
                      {selectedSellerSummary.salesSummary?.ordersCount || 0}
                    </div>
                    <div className="text-[11px] text-slate-400">Total Orders</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="text-lg font-extrabold text-sky-400">
                      {selectedSellerSummary.salesSummary?.completedOrders || 0}
                    </div>
                    <div className="text-[11px] text-slate-400">Paid Orders</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="text-lg font-extrabold text-purple-400">
                      {selectedSellerSummary.salesSummary?.productsCount || 0}
                    </div>
                    <div className="text-[11px] text-slate-400">Live Products</div>
                  </div>
                </div>
              </div>

              {/* Profile Details */}
              <div className="space-y-2">
                <div className="text-xs font-mono uppercase text-slate-400 tracking-wider">Profile Information</div>
                <div className="grid grid-cols-2 gap-3 text-xs bg-black/30 p-3 rounded-xl border border-white/5">
                  <div>
                    <span className="text-slate-500 block">Seller Type:</span>
                    <span className="text-white capitalize">{selectedSellerSummary.seller?.sellerType?.replace(/-/g, ' ')}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Category:</span>
                    <span className="text-white">{selectedSellerSummary.seller?.category || 'General'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Country:</span>
                    <span className="text-white">{selectedSellerSummary.seller?.country || '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Wallet Balance:</span>
                    <span className="text-white font-mono font-bold">${Number(selectedSellerSummary.seller?.walletBalance || 0).toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Member Since:</span>
                    <span className="text-white">{selectedSellerSummary.seller?.createdAt ? new Date(selectedSellerSummary.seller.createdAt).toLocaleDateString() : '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Account Status:</span>
                    <span className={selectedSellerSummary.seller?.isSuspended ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                      {selectedSellerSummary.seller?.isSuspended ? 'Suspended' : 'Active'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Seller Products preview */}
              <div className="space-y-2">
                <div className="text-xs font-mono uppercase text-slate-400 tracking-wider">
                  Products ({selectedSellerSummary.products?.length || 0})
                </div>
                {(!selectedSellerSummary.products || selectedSellerSummary.products.length === 0) ? (
                  <p className="text-xs text-slate-500">No products uploaded yet.</p>
                ) : (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {selectedSellerSummary.products.map((p) => (
                      <div key={p.id} className="p-2 rounded-lg bg-white/5 flex items-center justify-between text-xs">
                        <span className="text-white font-medium truncate max-w-[200px]">{p.title}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-400 font-mono">${p.price}</span>
                          <StatusPill status={p.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setSellerModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 text-white font-semibold text-xs hover:bg-white/20 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Suspend / Unsuspend Modal */}
        {suspendModalOpen && targetSeller && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" data-testid="suspend-modal">
            <div className="w-full max-w-md card-surface rounded-2xl border border-white/10 p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${targetSeller.isSuspended ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                  <Ban size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">
                    {targetSeller.isSuspended ? 'Unsuspend Seller' : 'Suspend Seller'}
                  </h3>
                  <p className="text-xs text-slate-400">{targetSeller.fullName || targetSeller.email}</p>
                </div>
              </div>

              <p className="text-xs text-slate-300">
                {targetSeller.isSuspended
                  ? 'Unsuspending will restore the seller’s active status and listing privileges.'
                  : 'Suspending will restrict the seller from selling and pause their active products.'}
              </p>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Reason / Notes (Optional)</label>
                <input
                  type="text"
                  data-testid="suspend-reason-input"
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  placeholder="e.g. Terms violation, account review"
                  className="w-full bg-[#0a0f1e] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                <button
                  type="button"
                  data-testid="cancel-suspend-btn"
                  onClick={() => setSuspendModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  data-testid="confirm-suspend-btn"
                  onClick={confirmSuspendAction}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    targetSeller.isSuspended
                      ? 'bg-emerald-500 text-slate-900 hover:bg-emerald-400'
                      : 'bg-rose-500 text-white hover:bg-rose-600'
                  }`}
                >
                  {targetSeller.isSuspended ? 'Confirm Unsuspend' : 'Confirm Suspend'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

function Stat({ label, value, Icon, color }) {
  return (
    <div className="card-surface rounded-2xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-400">{label}</p>
          <p className="mt-1 text-2xl sm:text-3xl font-extrabold text-white">{value}</p>
        </div>
        <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}><Icon className="h-5 w-5 text-white" /></div>
      </div>
    </div>
  );
}

function Empty({ Icon, label }) {
  return (
    <div className="p-10 text-center text-sm text-slate-400">
      <div className="mx-auto h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500"><Icon size={16} /></div>
      <p className="mt-3">{label}</p>
    </div>
  );
}

function StatusPill({ status }) {
  const map = {
    pending: 'text-amber-300 bg-amber-500/15 border-amber-500/30',
    approved: 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30',
    rejected: 'text-rose-300 bg-rose-500/15 border-rose-500/30',
  };
  return <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] capitalize ${map[status] || map.pending}`}>{status}</span>;
}

function AppTable({ rows, onDecide, onViewSeller }) {
  if (rows.length === 0) return <Empty Icon={ShieldCheck} label="No seller applications yet." />;
  return (
    <div className="overflow-auto" data-testid="seller-applications-table">
      <table className="w-full text-sm">
        <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-white/[0.03]">
          <tr>
            <th className="text-left py-3 px-4">Applicant</th>
            <th className="text-left">Type</th>
            <th className="text-left">Category</th>
            <th className="text-left">Submitted</th>
            <th className="text-left">Status</th>
            <th className="text-right px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-white/5 align-middle hover:bg-white/[0.02]" data-testid={`app-row-${r.id}`}>
              <td className="py-3 px-4">
                <p className="text-white font-medium">{r.fullName}</p>
                <p className="text-[11px] text-slate-500 font-mono">{r.email}</p>
              </td>
              <td className="capitalize text-slate-200">{r.sellerType?.replace(/-/g, ' ')}</td>
              <td className="text-slate-300">{r.category || 'General'}</td>
              <td className="text-slate-400">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'}</td>
              <td><StatusPill status={r.status} /></td>
              <td className="text-right px-4">
                <div className="inline-flex items-center gap-1.5">
                  <button
                    type="button"
                    data-testid={`view-app-${r.id}`}
                    onClick={() => onViewSeller(r.userId)}
                    className="inline-flex items-center gap-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs px-2.5 py-1.5 border border-white/10"
                    title="View Profile"
                  >
                    <Eye size={12} /> View
                  </button>
                  {r.status === 'pending' && (
                    <>
                      <button
                        type="button"
                        data-testid={`approve-app-${r.id}`}
                        onClick={() => onDecide(r, 'approve')}
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-900 text-xs font-semibold px-2.5 py-1.5 btn-hover"
                      >
                        <CheckCircle2 size={12} /> Approve
                      </button>
                      <button
                        type="button"
                        data-testid={`reject-app-${r.id}`}
                        onClick={() => onDecide(r, 'reject')}
                        className="inline-flex items-center gap-1 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-200 text-xs font-semibold px-2.5 py-1.5 btn-hover"
                      >
                        <XCircle size={12} /> Reject
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProductMgmtPanel({
  pendingRows,
  allRows,
  subTab,
  setSubTab,
  onAdd,
  onEdit,
  onDelete,
  onDecide
}) {
  const displayedRows = subTab === 'pending' ? pendingRows : allRows;

  return (
    <div className="space-y-4 p-4" data-testid="product-management-panel">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            data-testid="prod-tab-all"
            onClick={() => setSubTab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
              subTab === 'all'
                ? 'bg-emerald-500 text-slate-950 border-emerald-500 font-bold'
                : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
            }`}
          >
            All Products ({allRows.length})
          </button>
          <button
            type="button"
            data-testid="prod-tab-pending"
            onClick={() => setSubTab('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
              subTab === 'pending'
                ? 'bg-emerald-500 text-slate-950 border-emerald-500 font-bold'
                : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
            }`}
          >
            Pending Approvals ({pendingRows.length})
          </button>
        </div>

        <button
          type="button"
          data-testid="add-product-btn"
          onClick={onAdd}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
        >
          <Plus size={14} /> Add Product
        </button>
      </div>

      {displayedRows.length === 0 ? (
        <Empty Icon={Package} label={subTab === 'pending' ? 'No pending product submissions.' : 'No products found.'} />
      ) : (
        <div className="overflow-auto rounded-xl border border-white/5">
          <table className="w-full text-sm" data-testid="admin-products-table">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-white/[0.03]">
              <tr>
                <th className="text-left py-3 px-4">Product</th>
                <th className="text-left">Category</th>
                <th className="text-left">Price</th>
                <th className="text-left">Stock Management</th>
                <th className="text-left">Status</th>
                <th className="text-right px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedRows.map((r) => (
                <tr key={r.id} className="border-t border-white/5 hover:bg-white/[0.02]" data-testid={`product-row-${r.id}`}>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {r.image ? (
                        <img src={r.image} alt={r.title} className="h-10 w-10 rounded-lg object-cover border border-white/10 shrink-0" />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 shrink-0">
                          <Package size={16} />
                        </div>
                      )}
                      <div>
                        <p className="text-white font-medium line-clamp-1">{r.title}</p>
                        <p className="text-[11px] text-slate-400 line-clamp-1 max-w-xs">{r.description || 'No description provided.'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-slate-300 text-xs">{r.category}</td>
                  <td className="text-emerald-400 font-mono font-bold text-xs">${Number(r.price || 0).toFixed(2)}</td>
                  <td className="text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-300">{r.stock ?? 100} in stock</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                        r.inStock !== false ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {r.inStock !== false ? 'Available' : 'Out'}
                      </span>
                    </div>
                  </td>
                  <td><StatusPill status={r.status || 'approved'} /></td>
                  <td className="text-right px-4">
                    <div className="inline-flex items-center gap-1.5">
                      {r.status === 'pending' && (
                        <>
                          <button
                            type="button"
                            data-testid={`approve-prod-${r.id}`}
                            onClick={() => onDecide(r, 'approve')}
                            className="p-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-900 text-xs font-semibold"
                            title="Approve"
                          >
                            <Check size={13} />
                          </button>
                          <button
                            type="button"
                            data-testid={`reject-prod-${r.id}`}
                            onClick={() => onDecide(r, 'reject')}
                            className="p-1.5 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:bg-rose-500/30 text-xs"
                            title="Reject"
                          >
                            <X size={13} />
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        data-testid={`edit-product-${r.id}`}
                        onClick={() => onEdit(r)}
                        className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white text-xs"
                        title="Edit Product"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        type="button"
                        data-testid={`delete-product-${r.id}`}
                        onClick={() => onDelete(r.id)}
                        className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 text-xs"
                        title="Delete Product"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function WdTable({ rows, onDecide }) {
  if (rows.length === 0) return <Empty Icon={Wallet} label="No withdrawal requests yet." />;
  return (
    <div className="overflow-auto">
      <table className="w-full text-sm">
        <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-white/[0.03]">
          <tr>
            <th className="text-left py-3 px-4">Amount</th>
            <th className="text-left">Method</th>
            <th className="text-left">Requested</th>
            <th className="text-left">Status</th>
            <th className="text-right px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-white/5">
              <td className="py-3 px-4 text-white font-semibold">${r.amount}</td>
              <td className="text-slate-200">{r.method}</td>
              <td className="text-slate-400">{new Date(r.createdAt).toLocaleDateString()}</td>
              <td><StatusPill status={r.status} /></td>
              <td className="text-right px-4">
                {r.status === 'pending' ? (
                  <div className="inline-flex gap-2">
                    <button onClick={() => onDecide(r, 'approve')} className="inline-flex items-center gap-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-900 text-xs font-semibold px-3 py-1.5 btn-hover"><CheckCircle2 size={12} /> Approve</button>
                    <button onClick={() => onDecide(r, 'reject')} className="inline-flex items-center gap-1 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-200 text-xs font-semibold px-3 py-1.5 btn-hover"><XCircle size={12} /> Reject</button>
                  </div>
                ) : <span className="text-xs text-slate-500">—</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SellerMgmtTable({ rows, onViewSeller, onToggleSuspend }) {
  if (rows.length === 0) return <Empty Icon={Users} label="No sellers registered yet." />;
  return (
    <div className="overflow-auto" data-testid="seller-management-table">
      <table className="w-full text-sm">
        <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-white/[0.03]">
          <tr>
            <th className="text-left py-3 px-4">Seller</th>
            <th className="text-left">Type</th>
            <th className="text-left">Country</th>
            <th className="text-left">Sales Summary</th>
            <th className="text-left">Status</th>
            <th className="text-right px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const sid = r.userId || r.id;
            return (
              <tr key={sid} className="border-t border-white/5 hover:bg-white/[0.02]" data-testid={`seller-row-${sid}`}>
                <td className="py-3 px-4">
                  <p className="text-white font-medium">{r.fullName}</p>
                  <p className="text-[11px] text-slate-500 font-mono">{r.email}</p>
                </td>
                <td className="capitalize text-slate-200">{r.sellerType?.replace(/-/g, ' ')}</td>
                <td className="text-slate-300">{r.country || '—'}</td>
                <td className="text-xs">
                  {r.salesSummary ? (
                    <div>
                      <span className="font-mono font-bold text-emerald-400">${Number(r.salesSummary.totalSales || 0).toFixed(2)}</span>
                      <span className="text-slate-500 ml-1">({r.salesSummary.completedOrders || 0} orders)</span>
                    </div>
                  ) : (
                    <span className="text-slate-500">—</span>
                  )}
                </td>
                <td>
                  {r.isSuspended ? (
                    <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] bg-rose-500/15 border-rose-500/30 text-rose-400 font-bold uppercase">
                      Suspended
                    </span>
                  ) : (
                    <StatusPill status={r.status || 'approved'} />
                  )}
                </td>
                <td className="text-right px-4">
                  <div className="inline-flex items-center gap-1.5">
                    <button
                      type="button"
                      data-testid={`view-seller-${sid}`}
                      onClick={() => onViewSeller(sid)}
                      className="inline-flex items-center gap-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs px-2.5 py-1.5 border border-white/10"
                    >
                      <Eye size={12} /> Profile & Sales
                    </button>
                    <button
                      type="button"
                      data-testid={r.isSuspended ? `unsuspend-seller-${sid}` : `suspend-seller-${sid}`}
                      onClick={() => onToggleSuspend(r)}
                      className={`inline-flex items-center gap-1 rounded-lg text-xs font-semibold px-2.5 py-1.5 border transition-all ${
                        r.isSuspended
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                          : 'bg-rose-500/10 border-rose-500/30 text-rose-300 hover:bg-rose-500/20'
                      }`}
                    >
                      <Ban size={12} /> {r.isSuspended ? 'Unsuspend' : 'Suspend'}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ReportsPanel({ apps, prods, wds }) {
  const totals = {
    revenue: prods.filter((p) => p.status === 'approved').reduce((s, p) => s + Number(p.price || 0), 0),
    sellers: apps.filter((a) => a.status === 'approved').length,
    products: prods.filter((p) => p.status === 'approved').length,
    payouts: wds.filter((w) => w.status === 'approved').reduce((s, w) => s + Number(w.amount || 0), 0),
  };
  return (
    <div className="p-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <ReportCell label="Approved products value" value={`$${totals.revenue.toFixed(2)}`} Icon={TrendingUp} color="from-emerald-500 to-green-500" />
      <ReportCell label="Approved sellers" value={totals.sellers} Icon={Users} color="from-blue-500 to-indigo-500" />
      <ReportCell label="Live products" value={totals.products} Icon={Package} color="from-violet-500 to-fuchsia-500" />
      <ReportCell label="Payouts sent" value={`$${totals.payouts.toFixed(2)}`} Icon={BarChart3} color="from-orange-500 to-amber-500" />
    </div>
  );
}
function ReportCell({ label, value, Icon, color }) {
  return (
    <div className="card-surface rounded-xl p-5 flex items-start justify-between">
      <div><p className="text-xs text-slate-400">{label}</p><p className="mt-1 text-xl font-extrabold text-white">{value}</p></div>
      <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}><Icon className="h-5 w-5 text-white" /></div>
    </div>
  );
}
function PlaceholderPanel({ Icon, title, desc }) {
  return (
    <div className="p-10 text-center">
      <div className="mx-auto h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400"><Icon size={18} /></div>
      <h3 className="mt-4 text-white font-semibold">{title}</h3>
      <p className="text-sm text-slate-400 mt-1">{desc}</p>
    </div>
  );
}
