'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '../../lib/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import PageHeader from '../../components/PageHeader';
import Cart from '../../components/Cart';

const AVAILABLE_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
const AVAILABLE_COLORS = ['أسود', 'أبيض', 'كحلي', 'رمادي', 'بني', 'بيج', 'وردي', 'أخضر', 'أحمر', 'كريمي'];

// ImgBB API Configuration
const IMGBB_API_KEY = '0ff96dfb954bf18038873ca5a9d4f4f0';
const IMGBB_API_URL = 'https://api.imgbb.com/1/upload';

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
  const [imagePreview, setImagePreview] = useState(null);
  const [editingId, setEditingId] = useState(null);
  
  // Image upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedAdminCode = localStorage.getItem('luxe-admin-code');
    if (savedAdminCode) {
      setAdminCode(savedAdminCode);
    }
    
    const savedDeliveryFee = localStorage.getItem('luxe-delivery-fee');
    if (savedDeliveryFee !== null && savedDeliveryFee !== '') {
      setDeliveryFee(parseFloat(savedDeliveryFee) || 0);
    }
    
    const savedBrandName = localStorage.getItem('luxe-brand-name');
    if (savedBrandName) {
      setBrandName(savedBrandName);
    }
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

  // Upload image to ImgBB
  const uploadImageToImgBB = async (file) => {
    setIsUploading(true);
    setUploadProgress('جاري رفع الصورة...');
    
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('key', IMGBB_API_KEY);
      
      const response = await fetch(IMGBB_API_URL, {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUploadProgress('تم الرفع بنجاح');
        toast.success('تم رفع الصورة بنجاح');
        return data.data.url;
      } else {
        throw new Error(data.error?.message || 'فشل في رفع الصورة');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadProgress('');
      toast.error('فشل في رفع الصورة: ' + error.message);
      return null;
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(''), 3000);
    }
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

    return () => {
      unsubProducts();
      unsubOrders();
    };
  }, [isAuthenticated]);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      
      // Show preview immediately while uploading
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Upload to ImgBB
      const uploadedUrl = await uploadImageToImgBB(file);
      
      if (uploadedUrl) {
        setProductForm(prev => ({ ...prev, image: uploadedUrl }));
      }
    }
  };

  const handleColorToggle = (color) => {
    setProductForm(prev => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter(c => c !== color)
        : [...prev.colors, color]
    }));
  };

  const handleSizeToggle = (size) => {
    setProductForm(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size]
    }));
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    
    if (productForm.colors.length === 0) {
      toast.error('يرجى اختيار لون واحد على الأقل');
      return;
    }
    if (productForm.sizes.length === 0) {
      toast.error('يرجى اختيار مقاس واحد على الأقل');
      return;
    }
    
    // Check if image is still uploading
    if (isUploading) {
      toast.error('يرجى الانتظار حتى انتهاء رفع الصورة');
      return;
    }

    try {
      const productData = {
        title: productForm.title,
        price: parseFloat(productForm.price),
        image: productForm.image || 'https://via.placeholder.com/400x533',
        colors: productForm.colors,
        sizes: productForm.sizes,
        createdAt: serverTimestamp(),
      };

      if (editingId) {
        await updateDoc(doc(db, 'products', editingId), productData);
        toast.success('تم تحديث المنتج!');
      } else {
        await addDoc(collection(db, 'products'), productData);
        toast.success('تمت إضافة المنتج!');
      }

      setProductForm({ title: '', price: '', image: '', colors: [], sizes: [] });
      setImagePreview(null);
      setSelectedFile(null);
      setEditingId(null);
    } catch (error) {
      toast.error('خطأ في حفظ المنتج');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      try {
        await deleteDoc(doc(db, 'products', id));
        toast.success('تم حذف المنتج!');
      } catch (error) {
        toast.error('خطأ في حذف المنتج');
      }
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
    setImagePreview(product.image);
    setSelectedFile(null);
    setEditingId(product.id);
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status });
      toast.success('تم تحديث حالة الطلب!');
    } catch (error) {
      toast.error('خطأ في تحديث الطلب');
    }
  };

  const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);

  // Auth form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen">
        <PageHeader />
        <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-8 shadow-sm max-w-md w-full mx-4"
          >
            <h2 className="font-serif text-2xl text-center mb-6">لوحة تحكم الأيطالي</h2>
            <form onSubmit={handleAuth}>
              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-2">رمز الدخول</label>
                <input
                  type="password"
                  value={authCode}
                  onChange={(e) => setAuthCode(e.target.value)}
                  className="input-field w-full"
                  placeholder="أدخل رمز الدخول"
                  required
                />
                {showAuthError && (
                  <p className="text-red-500 text-sm mt-2">رمز الدخول غير صحيح</p>
                )}
              </div>
              <button
                type="submit"
                className="btn-accent w-full py-3 rounded-lg"
              >
                دخول
              </button>
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
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-serif text-4xl text-center"
            >
              لوحة تحكم الأيطالي
            </motion.h1>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="text-sm text-gray-500 hover:text-accent"
            >
              خروج
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <p className="text-gray-500 text-sm">إجمالي الطلبات</p>
              <p className="text-3xl font-semibold text-accent">{orders.length}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <p className="text-gray-500 text-sm">إجمالي الإيرادات</p>
              <p className="text-3xl font-semibold text-accent">{totalRevenue.toFixed(0)} د.ع</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <p className="text-gray-500 text-sm">المنتجات</p>
              <p className="text-3xl font-semibold text-accent">{products.length}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <p className="text-gray-500 text-sm">الطلبات المعلقة</p>
              <p className="text-3xl font-semibold text-accent">
                {orders.filter(o => o.status === 'Pending').length}
              </p>
            </motion.div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab('products')}
                className={`flex-1 py-4 font-medium transition-colors ${
                  activeTab === 'products' ? 'text-accent border-b-2 border-accent' : 'text-gray-500'
                }`}
              >
                المنتجات
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`flex-1 py-4 font-medium transition-colors ${
                  activeTab === 'orders' ? 'text-accent border-b-2 border-accent' : 'text-gray-500'
                }`}
              >
                الطلبات
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex-1 py-4 font-medium transition-colors ${
                  activeTab === 'settings' ? 'text-accent border-b-2 border-accent' : 'text-gray-500'
                }`}
              >
                الإعدادات
              </button>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'products' && (
                <motion.div
                  key="products"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-8"
                >
                  <form onSubmit={handleProductSubmit} className="mb-8 p-6 bg-gray-50 rounded-xl">
                    <h3 className="font-medium text-lg mb-4">{editingId ? 'تعديل منتج' : 'إضافة منتج جديد'}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="اسم المنتج"
                        value={productForm.title}
                        onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                        className="input-field"
                        required
                      />
                      <input
                        type="number"
                        placeholder="السعر"
                        value={productForm.price}
                        onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                        className="input-field"
                        required
                      />
                      
                      {/* Image Upload */}
                      <div className="md:col-span-2">
                        <label className="block text-sm text-gray-600 mb-2">صورة المنتج</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          disabled={isUploading}
                          className="input-field file:ml-0 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-white hover:file:bg-accent-dark disabled:opacity-50"
                        />
                        {uploadProgress && (
                          <p className={`text-sm mt-2 ${uploadProgress.includes('تم') ? 'text-green-500' : 'text-blue-500'}`}>
                            {uploadProgress}
                          </p>
                        )}
                      </div>
                      
                      {/* Image Preview */}
                      {imagePreview && (
                        <div className="md:col-span-2">
                          <p className="text-sm text-gray-600 mb-2">معاينة الصورة:</p>
                          <div className="relative w-32 h-40 bg-gray-200 rounded-lg overflow-hidden">
                            <img 
                              src={imagePreview} 
                              alt="Preview" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      )}
                      
                      {/* Colors Dropdown */}
                      <div>
                        <label className="block text-sm text-gray-600 mb-2">الألوان</label>
                        <div className="flex flex-wrap gap-2">
                          {AVAILABLE_COLORS.map((color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => handleColorToggle(color)}
                              className={`px-3 py-1 rounded-lg text-sm border transition-colors ${
                                productForm.colors.includes(color)
                                  ? 'bg-accent text-white border-accent'
                                  : 'bg-white border-gray-200 hover:border-accent'
                              }`}
                            >
                              {color}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Sizes Dropdown */}
                      <div>
                        <label className="block text-sm text-gray-600 mb-2">المقاسات</label>
                        <div className="flex flex-wrap gap-2">
                          {AVAILABLE_SIZES.map((size) => (
                            <button
                              key={size}
                              type="button"
                              onClick={() => handleSizeToggle(size)}
                              className={`px-3 py-1 rounded-lg text-sm border transition-colors ${
                                productForm.sizes.includes(size)
                                  ? 'bg-accent text-white border-accent'
                                  : 'bg-white border-gray-200 hover:border-accent'
                              }`}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 md:col-span-2">
                        <button 
                          type="submit" 
                          className="btn-accent px-6 py-3 rounded-lg disabled:opacity-50"
                          disabled={isUploading}
                        >
                          {editingId ? 'تحديث' : 'إضافة'} منتج
                        </button>
                        {editingId && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(null);
                              setProductForm({ title: '', price: '', image: '', colors: [], sizes: [] });
                              setImagePreview(null);
                              setSelectedFile(null);
                            }}
                            className="px-6 py-3 border border-gray-200 rounded-lg hover:border-gray-300"
                          >
                            إلغاء
                          </button>
                        )}
                      </div>
                    </div>
                  </form>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-right py-3 px-4 font-medium text-gray-500">الصورة</th>
                          <th className="text-right py-3 px-4 font-medium text-gray-500">المنتج</th>
                          <th className="text-right py-3 px-4 font-medium text-gray-500">السعر</th>
                          <th className="text-right py-3 px-4 font-medium text-gray-500">الألوان</th>
                          <th className="text-right py-3 px-4 font-medium text-gray-500">المقاسات</th>
                          <th className="text-right py-3 px-4 font-medium text-gray-500">الإجراءات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((product) => (
                          <tr key={product.id} className="border-b">
                            <td className="py-3 px-4">
                              <div className="w-12 h-16 bg-gray-200 rounded-lg overflow-hidden">
                                <img 
                                  src={product.image || 'https://via.placeholder.com/48x64'} 
                                  alt={product.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </td>
                            <td className="py-3 px-4">{product.title}</td>
                            <td className="py-3 px-4">{product.price?.toFixed(0)} د.ع</td>
                            <td className="py-3 px-4">{product.colors?.join(', ')}</td>
                            <td className="py-3 px-4">{product.sizes?.join(', ')}</td>
                            <td className="py-3 px-4">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditProduct(product)}
                                  className="text-accent hover:underline"
                                >
                                  تعديل
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="text-red-500 hover:underline"
                                >
                                  حذف
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {activeTab === 'orders' && (
                <motion.div
                  key="orders"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-8"
                >
                  {loading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">لا توجد طلبات بعد</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-right py-3 px-4 font-medium text-gray-500">العميل</th>
                            <th className="text-right py-3 px-4 font-medium text-gray-500">المنتجات</th>
                            <th className="text-right py-3 px-4 font-medium text-gray-500">الإجمالي</th>
                            <th className="text-right py-3 px-4 font-medium text-gray-500">الحالة</th>
                            <th className="text-right py-3 px-4 font-medium text-gray-500">الإجراءات</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map((order) => (
                            <tr key={order.id} className="border-b">
                              <td className="py-3 px-4">
                                <p className="font-medium">{order.customerName}</p>
                                <p className="text-sm text-gray-500">{order.phone}</p>
                                <p className="text-sm text-gray-500 truncate max-w-[200px]">{order.address}</p>
                              </td>
                              <td className="py-3 px-4">
                                {order.items?.map((item, i) => (
                                  <p key={i} className="text-sm">{item.quantity}x {item.title}</p>
                                ))}
                              </td>
                              <td className="py-3 px-4 font-medium">{order.total?.toFixed(0)} د.ع</td>
                              <td className="py-3 px-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  order.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {order.status === 'Completed' ? 'مكتمل' : 'معلق'}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <select
                                  value={order.status || 'Pending'}
                                  onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                  className="text-sm border rounded-lg px-2 py-1"
                                >
                                  <option value="Pending">معلق</option>
                                  <option value="Completed">مكتمل</option>
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-8"
                >
                  <div className="space-y-8">
                    {/* Brand Name Section */}
                    <div className="p-6 bg-gray-50 rounded-xl">
                      <h3 className="font-medium text-lg mb-4">اسم المتجر</h3>
                      <div className="flex gap-4 items-end">
                        <div className="flex-1">
                          <label className="block text-sm text-gray-600 mb-2">اسم المتجر</label>
                          <input
                            type="text"
                            value={brandName}
                            onChange={(e) => handleBrandNameChange(e.target.value)}
                            className="input-field w-full"
                            placeholder="أدخل اسم المتجر"
                          />
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        سيظهر هذا الاسم في الرسائل والواجهة
                      </p>
                    </div>

                    {/* Change Password Section */}
                    <div className="p-6 bg-gray-50 rounded-xl">
                      <h3 className="font-medium text-lg mb-4">تغيير رمز الدخول</h3>
                      <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div>
                          <label className="block text-sm text-gray-600 mb-2">رمز الدخول الجديد</label>
                          <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="input-field w-full"
                            placeholder="أدخل رمز الدخول الجديد"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-2">تأكيد رمز الدخول</label>
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="input-field w-full"
                            placeholder="أعد إدخال رمز الدخول"
                          />
                        </div>
                        <button
                          type="submit"
                          className="btn-accent px-6 py-3 rounded-lg"
                        >
                          تغيير رمز الدخول
                        </button>
                        {showPasswordSuccess && (
                          <p className="text-green-500 text-sm mt-2">تم تغيير رمز الدخول بنجاح!</p>
                        )}
                      </form>
                    </div>

                    {/* Delivery Fee Section */}
                    <div className="p-6 bg-gray-50 rounded-xl">
                      <h3 className="font-medium text-lg mb-4">سعر التوصيل</h3>
                      <div className="flex gap-4 items-end">
                        <div className="flex-1">
                          <label className="block text-sm text-gray-600 mb-2">سعر التوصيل (د.ع)</label>
                          <input
                            type="number"
                            value={deliveryFee}
                            onChange={(e) => handleDeliveryFeeChange(e.target.value)}
                            className="input-field w-full"
                            placeholder="أدخل سعر التوصيل"
                            min="0"
                          />
                        </div>
                        <div className="text-lg font-medium text-accent">
                          {deliveryFee.toFixed(0)} د.ع
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        سيتم إضافة سعر التوصيل تلقائياً إلى إجمالي الطلب
                      </p>
                    </div>
                  </div>
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

