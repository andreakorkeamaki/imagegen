// Define the structure of the image data we want to store
export interface StoredImageData {
  id: string; // Unique ID for each image
  imageUrl: string;
  prompt: string;
  negativePrompt?: string;
  width: number;
  height: number;
  timestamp: number; // Use timestamp for sorting
  model?: string; // Optional: Store model used
}

const STORAGE_KEY = 'ai-image-gallery';

// Function to get all stored images
export const getStoredImages = (): StoredImageData[] => {
  if (typeof window === 'undefined') return []; // Avoid SSR errors
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      const images: StoredImageData[] = JSON.parse(storedData);
      // Sort by timestamp, newest first
      return images.sort((a, b) => b.timestamp - a.timestamp);
    }
  } catch (error) {
    console.error("Error retrieving images from localStorage:", error);
  }
  return [];
};

// Function to add a new image
export const addStoredImage = (newImage: Omit<StoredImageData, 'id' | 'timestamp'>): StoredImageData | null => {
  if (typeof window === 'undefined') return null;
  try {
    const images = getStoredImages();
    const imageData: StoredImageData = {
      ...newImage,
      id: crypto.randomUUID(), // Generate a unique ID
      timestamp: Date.now(),
    };
    images.unshift(imageData); // Add to the beginning (for newest first view)

    // Optional: Limit the number of stored images to prevent excessive storage usage
    // const MAX_IMAGES = 50;
    // if (images.length > MAX_IMAGES) {
    //   images.length = MAX_IMAGES; // Keep only the most recent images
    // }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(images));
    return imageData;
  } catch (error) {
    console.error("Error saving image to localStorage:", error);
    return null;
  }
};

// Function to remove an image by ID (optional)
export const removeStoredImage = (id: string): void => {
  if (typeof window === 'undefined') return;
  try {
    let images = getStoredImages();
    images = images.filter(image => image.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(images));
  } catch (error) {
    console.error("Error removing image from localStorage:", error);
  }
};
