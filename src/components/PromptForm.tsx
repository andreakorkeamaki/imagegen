'use client';

import React, { useState } from 'react';

interface PromptFormProps {
  onSubmit: (prompt: string, negativePrompt: string, width: number, height: number, model: string) => void;
  isLoading: boolean;
}

const PromptForm: React.FC<PromptFormProps> = ({ onSubmit, isLoading }) => {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [resolution, setResolution] = useState('512x512');
  const [model, setModel] = useState('sdxl');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const [width, height] = resolution.split('x').map(Number);
    onSubmit(prompt, negativePrompt, width, height, model);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-1">
          Image Prompt
        </label>
        <textarea
          id="prompt"
          name="prompt"
          rows={3}
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="e.g., A photo of an astronaut riding a horse on the moon"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="negativePrompt" className="block text-sm font-medium text-gray-700 mb-1">
          Negative Prompt (Optional)
        </label>
        <input
          type="text"
          id="negativePrompt"
          name="negativePrompt"
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="e.g., blurry, low quality, text, watermark"
          value={negativePrompt}
          onChange={(e) => setNegativePrompt(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
            Model
          </label>
          <select
            id="model"
            name="model"
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={model}
            onChange={(e) => setModel(e.target.value)}
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
            name="resolution"
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
          >
            <option value="512x512">512x512</option>
            <option value="1024x1024">1024x1024</option>
            {/* Add other supported resolutions if needed */}
          </select>
        </div>
      </div>

      <button
        type="submit"
        className="w-full px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isLoading || !prompt.trim()}
      >
        {isLoading ? 'Generating...' : 'Generate Image'}
      </button>
    </form>
  );
};

export default PromptForm;
