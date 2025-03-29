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

export async function POST(request: Request) {
  // Log the API token (first few characters only for security)
  const apiToken = process.env.REPLICATE_API_TOKEN;
  console.log("API Token available:", apiToken ? `${apiToken.substring(0, 5)}...` : "Not set");
  
  if (!apiToken) {
    return NextResponse.json({ error: "Replicate API token not configured." }, { status: 500 });
  }

  try {
    const reqBody = await request.json();
    const { prompt, negative_prompt, width = 512, height = 512 } = reqBody;

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
    }

    console.log("Received request for image generation:", { prompt, negative_prompt, width, height });

    // Updated to a more recent SDXL model version
    const modelVersion = "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b";

    const input: StableDiffusionInput = {
      prompt,
      negative_prompt,
      width,
      height,
    };

    console.log("Calling Replicate API with input:", input);

    // Run the model
    const output = await replicate.run(modelVersion, { input });

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
