import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return new NextResponse('Missing URL parameter', { status: 400 });
  }

  try {
    // Add headers to handle CORS and various content types
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ClubCorra-Webapp/1.0)',
        'Accept': 'image/*,application/pdf,*/*',
      },
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch image from ${url}: ${response.status} ${response.statusText}`);
      return new NextResponse(`Failed to fetch image: ${response.statusText}`, { status: response.status });
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'application/octet-stream';

    // Set appropriate headers for different content types
    const headers: Record<string, string> = {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Add specific headers for images
    if (contentType.startsWith('image/')) {
      headers['Content-Disposition'] = 'inline';
    } else if (contentType === 'application/pdf') {
      headers['Content-Disposition'] = 'inline; filename="receipt.pdf"';
    }

    return new NextResponse(imageBuffer, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('S3 Proxy Error:', error);
    return new NextResponse('Error fetching image from S3.', { status: 500 });
  }
}
