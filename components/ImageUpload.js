'use client';

import { useState } from 'react';
import { supabase } from '../lib/supabase';

const BUCKET_NAME = 'al-italy-store';

export default function ImageUpload({ onUploadSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  console.log('ImageUpload component loaded, onUploadSuccess:', typeof onUploadSuccess);

  const handleUpload = async (event) => {
    console.log('handleUpload triggered', event);
    
    try {
      setUploading(true);
      
      const file = event.target.files?.[0];
      console.log('Selected file:', file);
      
      if (!file) {
        alert('لم يتم اختيار ملف');
        setUploading(false);
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('يرجى اختيار ملف صورة صالح');
        setUploading(false);
        return;
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      const fileName = `${timestamp}-${randomStr}.${fileExt}`;
      
      console.log('Uploading to bucket:', BUCKET_NAME, 'with path:', fileName);

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Supabase upload error:', uploadError);
        throw new Error(uploadError.message || 'فشل في رفع الصورة');
      }

      console.log('Upload successful:', uploadData);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(fileName);

      const publicUrl = urlData?.publicUrl;
      
      if (!publicUrl) {
        throw new Error('لم يتم الحصول على رابط الصورة');
      }

      console.log('Public URL:', publicUrl);

      // Set preview
      setPreviewUrl(publicUrl);

      // Call callback if provided
      if (onUploadSuccess) {
        console.log('Calling onUploadSuccess with URL:', publicUrl);
        onUploadSuccess(publicUrl);
      }

      alert('تم رفع الصورة بنجاح!');
      
    } catch (error) {
      console.error('Full error:', error);
      alert('خطأ في رفع الصورة: ' + (error.message || 'حدث خطأ'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={uploading}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
      
      {uploading && (
        <p className="text-blue-500 text-sm">جاري الرفع... يرجى الانتظار</p>
      )}
      
      {previewUrl && (
        <div className="mt-2">
          <p className="text-green-600 text-sm">✓ تم رفع الصورة</p>
          <img 
            src={previewUrl} 
            alt="Uploaded preview" 
            className="mt-2 w-24 h-24 object-cover rounded-lg border"
          />
        </div>
      )}
    </div>
  );
}

