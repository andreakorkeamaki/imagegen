import Replicate from "replicate";
import { NextResponse } from 'next/server';

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
  if (!process.env.REPLICATE_API_TOKEN) {
    return NextResponse.json({ error: "Replicate API token not configured." }, { status: 500 });
  }

  try {
    const reqBody = await request.json();
    const { prompt, negative_prompt, width = 512, height = 512 } = reqBody;

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
    }

    console.log("Received request for image generation:", { prompt, negative_prompt, width, height });

    // Specify the Stable Diffusion model version you want to use
    // Find model versions on Replicate: https://replicate.com/stability-ai/sdxl
     const modelVersion = "stability-ai/sdxl:c221b2b8ef527988fb59bf24a8b97c4561f1c671f73bd389f86650ce26a4eda4"; // Example: SDXL Base 1.0

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
