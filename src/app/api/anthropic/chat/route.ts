import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: Request) {
  // This is a placeholder route that doesn't require an API key
  return NextResponse.json({ 
    message: "This endpoint is disabled in this version of the application." 
  }, { status: 200 });
}
