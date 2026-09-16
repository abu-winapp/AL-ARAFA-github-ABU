import apiClient from './client';

/**
 * Upload service for handling menu item and category image uploads
 */

interface UploadResponse {
  success: boolean;
  data: {
    url: string;
  };
}

/**
 * Validates file type and size before upload
 * @param file - File to validate
 * @param maxSizeMB - Maximum file size in MB (default: 5)
 * @returns Error message if invalid, null if valid
 */
export const validateImageFile = (file: File, maxSizeMB: number = 5): string | null => {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];

  if (!validTypes.includes(file.type)) {
    return 'Please upload a JPG, PNG, or WebP image';
  }

  const maxBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return `File size must be less than ${maxSizeMB}MB`;
  }

  return null;
};

/**
 * Upload menu item image to Cloudinary
 * @param file - Image file to upload
 * @returns Cloudinary URL of uploaded image
 */
export const uploadMenuItemImage = async (file: File): Promise<string> => {
  try {
    // Validate file before upload
    const validationError = validateImageFile(file);
    if (validationError) {
      throw new Error(validationError);
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<UploadResponse>('/upload/menu-item-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.data.success || !response.data.data.url) {
      throw new Error('Upload failed: Invalid response from server');
    }

    return response.data.data.url;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Authentication failed. Please log in again.');
    }
    if (error.response?.status === 413) {
      throw new Error('File size too large. Please choose a smaller image.');
    }
    if (error.message) {
      throw error;
    }
    throw new Error('Failed to upload image. Please check your connection and try again.');
  }
};

/**
 * Upload category image to Cloudinary
 * @param file - Image file to upload
 * @returns Cloudinary URL of uploaded image
 */
export const uploadCategoryImage = async (file: File): Promise<string> => {
  try {
    // Validate file before upload
    const validationError = validateImageFile(file);
    if (validationError) {
      throw new Error(validationError);
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<UploadResponse>('/upload/category-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.data.success || !response.data.data.url) {
      throw new Error('Upload failed: Invalid response from server');
    }

    return response.data.data.url;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Authentication failed. Please log in again.');
    }
    if (error.response?.status === 413) {
      throw new Error('File size too large. Please choose a smaller image.');
    }
    if (error.message) {
      throw error;
    }
    throw new Error('Failed to upload image. Please check your connection and try again.');
  }
};

/**
 * Upload profile image to Cloudinary
 * @param file - Image file to upload
 * @returns Cloudinary URL of uploaded image
 */
export const uploadProfileImage = async (file: File): Promise<string> => {
  try {
    // Validate file before upload (2MB limit for profile images)
    const validationError = validateImageFile(file, 2);
    if (validationError) {
      throw new Error(validationError);
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<UploadResponse>('/upload/profile-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.data.success || !response.data.data.url) {
      throw new Error('Upload failed: Invalid response from server');
    }

    return response.data.data.url;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Authentication failed. Please log in again.');
    }
    if (error.response?.status === 413) {
      throw new Error('File too large. Max 2MB.');
    }
    if (error.message) {
      throw error;
    }
    throw new Error('Failed to upload image. Please check your connection and try again.');
  }
};

/**
 * Delete image from Cloudinary
 * @param imageUrl - Cloudinary URL of image to delete
 */
export const deleteImage = async (imageUrl: string): Promise<void> => {
  try {
    await apiClient.delete('/upload/image', {
      params: { imageUrl },
    });
  } catch (error: any) {
    // Delete errors are non-blocking - log only
    console.warn('Failed to delete image from Cloudinary:', imageUrl, error);
  }
};
