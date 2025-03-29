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
  size: string;
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

// Define allowed sizes for Recraft model
const RECRAFT_ALLOWED_SIZES = [
  "1024x1024", 
  "1365x1024", 
  "1024x1365", 
  "1536x1024", 
  "1024x1536", 
  "1820x1024", 
  "1024x1820", 
  "1024x2048", 
  "2048x1024", 
  "1434x1024", 
  "1024x1434", 
  "1024x1280", 
  "1280x1024", 
  "1024x1707", 
  "1707x1024"
];

/**
 * Find the closest allowed size for Recraft based on requested dimensions
 */
function getClosestRecraftSize(width: number, height: number): string {
  // If the requested size is already in the allowed list, use it
  const requestedSize = `${width}x${height}`;
  if (RECRAFT_ALLOWED_SIZES.includes(requestedSize)) {
    return requestedSize;
  }

  // Otherwise, find the closest match based on aspect ratio and total pixels
  const requestedAspectRatio = width / height;
  const requestedPixels = width * height;
  
  // Calculate "distance" for each allowed size to find the best match
  let closestSize = RECRAFT_ALLOWED_SIZES[0];
  let smallestDistance = Infinity;
  
  for (const sizeStr of RECRAFT_ALLOWED_SIZES) {
    const [allowedWidth, allowedHeight] = sizeStr.split('x').map(Number);
    const allowedAspectRatio = allowedWidth / allowedHeight;
    const allowedPixels = allowedWidth * allowedHeight;
    
    // Weight aspect ratio more heavily than total pixels
    const aspectRatioDiff = Math.abs(allowedAspectRatio - requestedAspectRatio);
    const pixelDiff = Math.abs(allowedPixels - requestedPixels) / 1000000; // Normalize to make comparable
    
    const distance = aspectRatioDiff * 3 + pixelDiff; // Aspect ratio is 3x more important
    
    if (distance < smallestDistance) {
      smallestDistance = distance;
      closestSize = sizeStr;
    }
  }
  
  return closestSize;
}

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
      // Recraft input format - find closest allowed size
      const size = getClosestRecraftSize(width, height);
      
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

    // Handle different output formats based on the model
    if (selectedModel === 'sdxl') {
      // SDXL usually returns an array of image URLs
      if (Array.isArray(output) && output.length > 0) {
        return NextResponse.json({ imageUrl: output[0] });
      } else {
        console.error("Unexpected SDXL output format:", output);
        return NextResponse.json({ error: "Failed to generate image or unexpected output format from SDXL." }, { status: 500 });
      }
    } else if (selectedModel === 'recraft-v3') {
      // Recraft might return a single string URL or an object with different structure
      if (typeof output === 'string') {
        // Direct URL string
        return NextResponse.json({ imageUrl: output });
      } else if (Array.isArray(output) && output.length > 0) {
        // Array of URLs (like SDXL)
        return NextResponse.json({ imageUrl: output[0] });
      } else if (output && typeof output === 'object') {
        // It might be returning an object with a specific structure
        // Let's check common patterns
        if ('output' in output && typeof output.output === 'string') {
          return NextResponse.json({ imageUrl: output.output });
        } else if ('output' in output && Array.isArray(output.output) && output.output.length > 0) {
          return NextResponse.json({ imageUrl: output.output[0] });
        } else if ('image' in output && typeof output.image === 'string') {
          return NextResponse.json({ imageUrl: output.image });
        } else if ('images' in output && Array.isArray(output.images) && output.images.length > 0) {
          return NextResponse.json({ imageUrl: output.images[0] });
        } else if ('url' in output && typeof output.url === 'string') {
          return NextResponse.json({ imageUrl: output.url });
        }
      }
      
      // If we got here, we couldn't figure out the format
      console.error("Unexpected Recraft output format:", output);
      return NextResponse.json({ error: "Failed to extract image URL from Recraft response. Check server logs." }, { status: 500 });
    }

    // Fallback for unknown models
    console.error("Unexpected output format from unknown model:", output);
    return NextResponse.json({ error: "Failed to generate image or unexpected output format." }, { status: 500 });

  } catch (error) {
    console.error("Error calling Replicate API:", error);
    // Extract more specific error message if available
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return NextResponse.json({ error: `Failed to generate image: ${errorMessage}` }, { status: 500 });
  }
}
