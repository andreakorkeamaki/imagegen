'use client';

import React, { useState, useEffect, useCallback } from 'react';
import PromptForm from '@/components/PromptForm';
import ImageDisplay from '@/components/ImageDisplay';
import ImageGallery from '@/components/ImageGallery';
import { addStoredImage, StoredImageData } from '@/lib/storage';

export default function Home() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastPrompt, setLastPrompt] = useState<string>(''); // Store last prompt for display/saving
  const [lastModel, setLastModel] = useState<string>('sdxl'); // Store last model used

  // Key to force gallery re-render when new image is added
  // This is a simple way; Context or Zustand would be better for complex state
  const [galleryUpdateKey, setGalleryUpdateKey] = useState(0);

  const handleGenerate = useCallback(async (prompt: string, negativePrompt: string, width: number, height: number, model: string) => {
    setIsLoading(true);
    setError(null);
    setImageUrl(null);
    setLastPrompt(prompt); // Store the prompt
    setLastModel(model); // Store the model

    try {
      console.log('Sending request:', { prompt, negativePrompt, width, height, model });
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, negative_prompt: negativePrompt, width, height, model }),
      });

      const responseBody = await response.json(); // Always try to parse body
      console.log('Received response:', response.status, responseBody);

      if (!response.ok) {
        throw new Error(responseBody.error || `HTTP error! status: ${response.status}`);
      }

      if (!responseBody.imageUrl) {
          throw new Error('No image URL received from server.');
      }

      const generatedImageUrl = responseBody.imageUrl;
      setImageUrl(generatedImageUrl);

      // Save to gallery
      const savedImage = addStoredImage({
        imageUrl: generatedImageUrl,
        prompt,
        negativePrompt,
        width,
        height,
        model // Store which model was used
      });

      if (savedImage) {
        console.log('Image saved to gallery', savedImage);
        // Trigger gallery update
        setGalleryUpdateKey(prev => prev + 1);
      } else {
          console.warn('Failed to save image to local storage');
      }

    } catch (err: any) {
      console.error("Generation failed:", err);
      setError(err.message || 'Failed to generate image.');
    } finally {
      setIsLoading(false);
    }
  }, []); // No dependencies needed if state setters are used

  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 md:p-12 lg:p-16 bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      <div className="w-full max-w-5xl space-y-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center text-indigo-700">
          AI Image Generator
        </h1>

        {/* Input Section */}
        <section className="p-4 sm:p-6 bg-white rounded-lg shadow-lg">
          <PromptForm onSubmit={handleGenerate} isLoading={isLoading} />
        </section>

        {/* Display Section */}
        <section className="p-4 sm:p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-700">Generated Image</h2>
          <ImageDisplay 
            imageUrl={imageUrl} 
            isLoading={isLoading} 
            error={error} 
            prompt={lastPrompt} 
            model={lastModel}
          />
          {/* TODO: Add Download Button Here */}
        </section>

        {/* Gallery Section */}
        <section className="p-4 sm:p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-700">Image History</h2>
          <ImageGallery key={galleryUpdateKey} /> {/* Use key to force re-render */}
        </section>
      </div>
    </main>
  );
}
