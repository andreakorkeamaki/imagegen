'use client';

import React, { useState, useEffect } from 'react';

interface PromptFormProps {
  onSubmit: (prompt: string, negativePrompt: string, width: number, height: number, model: string) => void;
  isLoading?: boolean;
}

// Common resolutions for image generation
const RESOLUTIONS = [
  { width: 512, height: 512, label: '512×512' },
  { width: 768, height: 768, label: '768×768' },
  { width: 1024, height: 1024, label: '1024×1024' },
  { width: 512, height: 768, label: '512×768' },
  { width: 768, height: 512, label: '768×512' },
  { width: 1024, height: 768, label: '1024×768' },
  { width: 768, height: 1024, label: '768×1024' },
];

const PromptForm: React.FC<PromptFormProps> = ({ onSubmit, isLoading = false }) => {
  const [prompt, setPrompt] = useState<string>('');
  const [negativePrompt, setNegativePrompt] = useState<string>('');
  const [width, setWidth] = useState<number>(512);
  const [height, setHeight] = useState<number>(512);
  const [model, setModel] = useState<string>('sdxl');

  // Handle resolution selection
  const handleResolutionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [w, h] = e.target.value.split('x').map(Number);
    setWidth(w);
    setHeight(h);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onSubmit(prompt, negativePrompt, width, height, model);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-1">
          Image Prompt
        </label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., A photo of an astronaut riding a horse on the moon"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
          rows={3}
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="negativePrompt" className="block text-sm font-medium text-gray-700 mb-1">
          Negative Prompt (Optional)
        </label>
        <textarea
          id="negativePrompt"
          value={negativePrompt}
          onChange={(e) => setNegativePrompt(e.target.value)}
          placeholder="e.g., blurry, low quality, text, watermark"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
          rows={2}
          disabled={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
            Model
          </label>
          <select
            id="model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
            disabled={isLoading}
          >
            <option value="sdxl">Stable Diffusion XL</option>
            <option value="recraft-v3">Recraft V3</option>
          </select>
        </div>

        <div>
          <label htmlFor="resolution" className="block text-sm font-medium text-gray-700 mb-1">
            Resolution
          </label>
          <select
            id="resolution"
            value={`${width}x${height}`}
            onChange={handleResolutionChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
            disabled={isLoading}
          >
            {RESOLUTIONS.map((res) => (
              <option key={res.label} value={`${res.width}x${res.height}`}>
                {res.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        className="w-full px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isLoading || !prompt.trim()}
      >
        {isLoading ? 'Generating...' : 'Generate Image'}
      </button>
    </form>
  );
};

export default PromptForm;
