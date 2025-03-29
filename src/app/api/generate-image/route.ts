import Replicate from "replicate";
import { NextResponse } from 'next/server';

// Set timeout for API route
export const maxDuration = 60; // 60 seconds timeout
export const dynamic = 'force-dynamic'; // Disable caching for this route

// Initialize Replicate client
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// Define the expected input structure for Stable Diffusion
interface StableDiffusionInput {
  prompt: string;
  negative_prompt?: string;
  width?: number;
  height?: number;
  // Add other parameters as needed based on the specific Stable Diffusion model version
}

// Define the expected input structure for Recraft
interface RecraftInput {
  prompt: string;
  style?: string;
  size?: string;
  negative_prompt?: string;
}

// Define supported model types
type ModelType = 'sdxl' | 'recraft-v3';

// Model versions - these need to match Replicate's format
const MODELS = {
  // Updated to the latest public versions
  sdxl: "stability-ai/sdxl:c221b2b8ef527988fb59bf24a8b97c4561f1c671f73bd389f866bfb27c061316",
  "recraft-v3": "recraft-ai/recraft-v3" // No version ID needed for Recraft
};

export async function POST(request: Request) {
  // Log the API token (first few characters only for security)
  const apiToken = process.env.REPLICATE_API_TOKEN;
  console.log("API Token available:", apiToken ? `${apiToken.substring(0, 5)}...` : "Not set");
  
  if (!apiToken) {
    return NextResponse.json({ error: "Replicate API token not configured." }, { status: 500 });
  }

  try {
    const reqBody = await request.json();
    const { prompt, negative_prompt, width = 512, height = 512, model = 'sdxl' } = reqBody;

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
    }

    // Type check for the model
    if (!(model in MODELS)) {
      return NextResponse.json({ error: "Invalid model selected." }, { status: 400 });
    }

    const selectedModel = model as ModelType;
    console.log("Received request for image generation:", { prompt, negative_prompt, width, height, model: selectedModel });

    let output;
    
    // Different handling based on model type
    if (selectedModel === 'sdxl') {
      // SDXL input format
      const input: StableDiffusionInput = {
        prompt,
        negative_prompt,
        width,
        height,
      };
      
      console.log("Calling Replicate API with SDXL input:", input);
      // Use type assertion to satisfy TypeScript
      output = await replicate.run(MODELS.sdxl as any, { input });
    } else if (selectedModel === 'recraft-v3') {
      // Recraft input format
      const size = `${width}x${height}`;
      const input: RecraftInput = {
        prompt,
        negative_prompt,
        size,
        style: "any" // Default style
      };
      
      console.log("Calling Replicate API with Recraft input:", input);
      // Use type assertion to satisfy TypeScript
      output = await replicate.run(MODELS["recraft-v3"] as any, { input });
    }

    console.log("Replicate API output:", output);

    // Replicate usually returns an array of image URLs
    if (Array.isArray(output) && output.length > 0) {
      // Return the first image URL (or handle multiple images if needed)
      return NextResponse.json({ imageUrl: output[0] });
    } else {
      console.error("Unexpected output format from Replicate:", output);
      return NextResponse.json({ error: "Failed to generate image or unexpected output format." }, { status: 500 });
    }

  } catch (error) {
    console.error("Error calling Replicate API:", error);
    // Extract more specific error message if available
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return NextResponse.json({ error: `Failed to generate image: ${errorMessage}` }, { status: 500 });
  }
}
