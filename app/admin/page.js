'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '../../lib/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import PageHeader from '../../components/PageHeader';
import Cart from '../../components/Cart';
import ImageUpload from '../../components/ImageUpload';

const AVAILABLE_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
const AVAILABLE_COLORS = ['أسود', 'أبيض', 'كحلي', 'رمادي', 'بني', 'بيج', 'وردي', 'أخضر', 'أحمر', 'كريمي'];

export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authCode, setAuthCode] = useState('');
  const [showAuthError, setShowAuthError] = useState(false);
  
  // Admin settings state
  const [adminCode, setAdminCode] = useState('mn67admin');
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [brandName, setBrandName] = useState('الأيطالي');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordSuccess, setShowPasswordSuccess] = useState(false);
  
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productForm, setProductForm] = useState({
    title: '',
    price: '',
    image: '',
    colors: [],
    sizes: [],
  });
  const [editingId, setEditingId] = useState(null);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedAdminCode = localStorage.getItem('luxe-admin-code');
    if (savedAdminCode) { setAdminCode(savedAdminCode); }
    const savedDeliveryFee = localStorage.getItem('luxe-delivery-fee');
    if (savedDeliveryFee !== null && savedDeliveryFee !== '') {
      setDeliveryFee(parseFloat(savedDeliveryFee) || 0);
    }
    const savedBrandName = localStorage.getItem('luxe-brand-name');
    if (savedBrandName) { setBrandName(savedBrandName); }
  }, []);

  const handleAuth = (e) => {
    e.preventDefault();
    if (authCode === adminCode) {
      setIsAuthenticated(true);
      setShowAuthError(false);
    } else {
      setShowAuthError(true);
      setAuthCode('');
    }
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('كلمتا المرور غير متطابقتين');
      return;
    }
    if (newPassword.length < 4) {
      toast.error('كلمة المرور يجب أن تكون 4 أحرف على الأقل');
      return;
    }
    localStorage.setItem('luxe-admin-code', newPassword);
    setAdminCode(newPassword);
    setNewPassword('');
    setConfirmPassword('');
    setShowPasswordSuccess(true);
    setTimeout(() => setShowPasswordSuccess(false), 3000);
    toast.success('تم تغيير رمز الدخول بنجاح');
  };

  const handleDeliveryFeeChange = (value) => {
    const fee = parseFloat(value) || 0;
    setDeliveryFee(fee);
    localStorage.setItem('luxe-delivery-fee', fee.toString());
    toast.success('تم تحديث سعر التوصيل');
  };

  const handleBrandNameChange = (value) => {
    setBrandName(value);
    localStorage.setItem('luxe-brand-name', value);
    toast.success('تم تحديث اسم المتجر');
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    const productsQuery = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));

    const unsubProducts = onSnapshot(productsQuery, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubOrders = onSnapshot(ordersQuery, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => { unsubProducts(); unsubOrders(); };
  }, [isAuthenticated]);

  const handleColorToggle = (color) => {
    setProductForm(prev => ({
      ...prev,
      colors: prev.colors.includes(color) ? prev.colors.filter(c => c !== color) : [...prev.colors, color]
    }));
  };

  const handleSizeToggle = (size) => {
    setProductForm(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size) ? prev.sizes.filter(s => s !== size) : [...prev.sizes, size]
    }));
  };

  const handleImageUploadSuccess = (url) => {
    setProductForm(prev => ({ ...prev, image: url }));
    toast.success('تم رفع الصورة! هسة تقدر تضيف المنتج');
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!productForm.title.trim() || !productForm.price || !productForm.image) {
      toast.error('يرجى ملء كافة البيانات ورفع الصورة');
      return;
    }

    try {
      const productData = {
        title: productForm.title.trim(),
        price: parseFloat(productForm.price),
        image: productForm.image,
        colors: productForm.colors,
        sizes: productForm.sizes,
        createdAt: serverTimestamp(), // ضروري جداً لظهور المنتج بالترتيب
      };

      if (editingId) {
        await updateDoc(doc(db, 'products', editingId), productData);
        toast.success('تم التحديث!');
      } else {
        // الحركة الأهم: الحفظ في فايربيس
        await addDoc(collection(db, 'products'), productData);
        toast.success('تمت إضافة المنتج للمحل بنجاح! 🚀');
      }

      setProductForm({ title: '', price: '', image: '', colors: [], sizes: [] });
      setEditingId(null);
    } catch (error) {
      // Extensive error handling for debugging Firebase issues
      console.error("========================================");
      console.error("🔥 FIREBASE ERROR DETAILS:");
      console.error("Error Code:", error.code);
      console.error("Error Message:", error.message);
      console.error("Error Name:", error.name);
      console.error("Full Error Object:", error);
      console.error("========================================");
      
      // Provide specific error messages based on error type
      if (error.code === 'permission-denied' || error.message.includes('permission')) {
        toast.error('🚫 خطأ في الأذونات: تحقق من Firestore Security Rules');
        console.error('🔒 PERMISSION ERROR: Your Firestore rules are blocking write access. Check the rules in Firebase Console.');
      } else if (error.code === 'network-request-failed' || error.message.includes('network')) {
        toast.error('🌐 خطأ في الشبكة: تحقق من اتصال الإنترنت');
        console.error('🌐 NETWORK ERROR: Check your internet connection.');
      } else if (error.code === 'not-found' || error.message.includes('not-found')) {
        toast.error('❌ خطأ: الـ Collection غير موجودة');
        console.error('❌ COLLECTION ERROR: Make sure the "products" collection exists in Firestore.');
      } else if (error.code === 'invalid-argument' || error.message.includes('invalid')) {
        toast.error('⚠️ خطأ في البيانات: تحقق من صحة البيانات المرسلة');
        console.error('⚠️ VALIDATION ERROR: Check the data being sent to Firestore.');
      } else {
        toast.error('❌ خطأ في الفايربيس: ' + error.message);
      }
    }
  };

  const handleDeleteProduct = async (id) => {
    if (confirm('هل أنت متأكد؟')) {
      try {
        await deleteDoc(doc(db, 'products', id));
        toast.success('تم الحذف');
      } catch (e) { toast.error('خطأ بالحذف'); }
    }
  };

  const handleEditProduct = (product) => {
    setProductForm({
      title: product.title,
      price: product.price.toString(),
      image: product.image,
      colors: product.colors || [],
      sizes: product.sizes || [],
    });
    setEditingId(product.id);
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status });
      toast.success('تم التحديث');
    } catch (e) { toast.error('خطأ'); }
  };

  const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen">
        <PageHeader />
        <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-8 shadow-sm max-w-md w-full mx-4">
            <h2 className="font-serif text-2xl text-center mb-6">لوحة تحكم الأيطالي</h2>
            <form onSubmit={handleAuth}>
              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-2">رمز الدخول</label>
                <input type="password" value={authCode} onChange={(e) => setAuthCode(e.target.value)} className="input-field w-full" placeholder="أدخل الرمز" required />
                {showAuthError && <p className="text-red-500 text-sm mt-2">الرمز خطأ</p>}
              </div>
              <button type="submit" className="btn-accent w-full py-3 rounded-lg">دخول</button>
            </form>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <PageHeader />
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-serif text-4xl">لوحة تحكم الأيطالي</motion.h1>
            <button onClick={() => setIsAuthenticated(false)} className="text-sm text-gray-500">خروج</button>
          </div>

          {/* الإحصائيات (Stats) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <p className="text-gray-500 text-sm">إجمالي الطلبات</p>
              <p className="text-3xl font-semibold text-accent">{orders.length}</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <p className="text-gray-500 text-sm">إجمالي الإيرادات</p>
              <p className="text-3xl font-semibold text-accent">{totalRevenue.toFixed(0)} د.ع</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <p className="text-gray-500 text-sm">المنتجات</p>
              <p className="text-3xl font-semibold text-accent">{products.length}</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <p className="text-gray-500 text-sm">الطلبات المعلقة</p>
              <p className="text-3xl font-semibold text-accent">{orders.filter(o => o.status === 'Pending').length}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="flex border-b bg-gray-50">
              <button onClick={() => setActiveTab('products')} className={`flex-1 py-4 font-medium ${activeTab === 'products' ? 'text-accent border-b-2 border-accent' : 'text-gray-500'}`}>المنتجات</button>
              <button onClick={() => setActiveTab('orders')} className={`flex-1 py-4 font-medium ${activeTab === 'orders' ? 'text-accent border-b-2 border-accent' : 'text-gray-500'}`}>الطلبات</button>
              <button onClick={() => setActiveTab('settings')} className={`flex-1 py-4 font-medium ${activeTab === 'settings' ? 'text-accent border-b-2 border-accent' : 'text-gray-500'}`}>الإعدادات</button>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'products' && (
                <motion.div key="products" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8">
                  <form onSubmit={handleProductSubmit} className="mb-8 p-6 bg-gray-50 rounded-xl">
                    <h3 className="font-medium text-lg mb-4">{editingId ? 'تعديل منتج' : 'إضافة منتج جديد'}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input type="text" placeholder="اسم المنتج" value={productForm.title} onChange={(e) => setProductForm({ ...productForm, title: e.target.value })} className="input-field" required />
                      <input type="number" placeholder="السعر" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} className="input-field" required />
                      <div className="md:col-span-2">
                        <label className="block text-sm text-gray-600 mb-2">صورة المنتج *</label>
                        <ImageUpload onUploadSuccess={handleImageUploadSuccess} />
                        {productForm.image && <div className="mt-2 text-green-600 text-xs">✅ تم اختيار الصورة</div>}
                      </div>
                      <div>
                        <label className="block text-xs mb-2">الألوان</label>
                        <div className="flex flex-wrap gap-2">{AVAILABLE_COLORS.map(c => <button key={c} type="button" onClick={() => handleColorToggle(c)} className={`px-2 py-1 rounded text-xs border ${productForm.colors.includes(c) ? 'bg-accent text-white' : 'bg-white'}`}>{c}</button>)}</div>
                      </div>
                      <div>
                        <label className="block text-xs mb-2">المقاسات</label>
                        <div className="flex flex-wrap gap-2">{AVAILABLE_SIZES.map(s => <button key={s} type="button" onClick={() => handleSizeToggle(s)} className={`px-2 py-1 rounded text-xs border ${productForm.sizes.includes(s) ? 'bg-accent text-white' : 'bg-white'}`}>{s}</button>)}</div>
                      </div>
                      <button type="submit" className="btn-accent px-6 py-3 rounded-lg md:col-span-2">{editingId ? 'تحديث' : 'إضافة'} منتج</button>
                    </div>
                  </form>
                  <table className="w-full text-right">
                    <thead><tr className="border-b"><th className="p-2">الصورة</th><th className="p-2">الاسم</th><th className="p-2">السعر</th><th className="p-2">الإجراءات</th></tr></thead>
                    <tbody>{products.map(p => <tr key={p.id} className="border-b"><td className="p-2"><img src={p.image} className="w-10 h-12 object-cover rounded" /></td><td className="p-2">{p.title}</td><td className="p-2">{p.price} د.ع</td><td className="p-2"><button onClick={() => handleEditProduct(p)} className="text-accent ml-3">تعديل</button><button onClick={() => handleDeleteProduct(p.id)} className="text-red-500">حذف</button></td></tr>)}</tbody>
                  </table>
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 space-y-6">
                  <div className="p-6 bg-gray-50 rounded-xl"><h3 className="font-medium mb-3">اسم المتجر</h3><input type="text" value={brandName} onChange={(e) => handleBrandNameChange(e.target.value)} className="input-field w-full" /></div>
                  <div className="p-6 bg-gray-50 rounded-xl"><h3 className="font-medium mb-3">سعر التوصيل</h3><input type="number" value={deliveryFee} onChange={(e) => handleDeliveryFeeChange(e.target.value)} className="input-field w-full" /></div>
                  <div className="p-6 bg-gray-50 rounded-xl">
                    <h3 className="font-medium mb-3">تغيير الرمز</h3>
                    <form onSubmit={handlePasswordChange} className="space-y-3">
                      <input type="password" placeholder="الرمز الجديد" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="input-field w-full" />
                      <input type="password" placeholder="تأكيد الرمز" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="input-field w-full" />
                      <button type="submit" className="btn-accent px-6 py-2 rounded-lg">تحديث</button>
                    </form>
                  </div>
                </motion.div>
              )}
              
              {activeTab === 'orders' && (
                <motion.div key="orders" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8">
                   <table className="w-full text-right">
                    <thead><tr className="border-b"><th className="p-2">العميل</th><th className="p-2">الإجمالي</th><th className="p-2">الحالة</th></tr></thead>
                    <tbody>{orders.map(o => <tr key={o.id} className="border-b"><td className="p-2">{o.customerName}</td><td className="p-2">{o.total} د.ع</td><td className="p-2"><select value={o.status || 'Pending'} onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)} className="border rounded text-sm"><option value="Pending">معلق</option><option value="Completed">مكتمل</option></select></td></tr>)}</tbody>
                  </table>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      <Cart />
    </div>
  );
}