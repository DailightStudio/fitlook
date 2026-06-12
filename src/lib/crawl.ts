// Web crawler to extract product image from shopping mall URLs

export async function extractImageFromUrl(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.statusText}`);
    }

    const html = await response.text();

    // Try multiple methods to extract image

    // Method 1: Open Graph meta tag (most reliable)
    const ogMatch = html.match(/<meta\s+property=['"]og:image['"][^>]*content=['"]([^'"]+)['"]/i);
    if (ogMatch?.[1]) {
      return normalizeUrl(ogMatch[1], url);
    }

    // Method 2: Twitter Card
    const twitterMatch = html.match(/<meta\s+name=['"]twitter:image['"][^>]*content=['"]([^'"]+)['"]/i);
    if (twitterMatch?.[1]) {
      return normalizeUrl(twitterMatch[1], url);
    }

    // Method 3: First large image in body
    const imgMatches = html.matchAll(/<img[^>]*src=['"]([^'"]+)['"]/gi);
    for (const match of imgMatches) {
      const src = match[1];
      // Skip small/icon images
      if (!src.includes('icon') && !src.includes('logo') && !src.includes('avatar')) {
        return normalizeUrl(src, url);
      }
    }

    // Method 4: Picture element source
    const pictureMatch = html.match(/<source[^>]*srcset=['"]([^'"]+)['"]/i);
    if (pictureMatch?.[1]) {
      const imageUrl = pictureMatch[1].split(',')[0].trim().split(' ')[0];
      return normalizeUrl(imageUrl, url);
    }

    throw new Error('Could not extract image from URL');
  } catch (error) {
    console.error('Crawl error:', error);
    throw error;
  }
}

// Normalize relative URLs to absolute URLs
function normalizeUrl(imageUrl: string, baseUrl: string): string {
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  if (imageUrl.startsWith('//')) {
    return `https:${imageUrl}`;
  }

  if (imageUrl.startsWith('/')) {
    const baseUri = new URL(baseUrl);
    return `${baseUri.protocol}//${baseUri.host}${imageUrl}`;
  }

  // Relative path
  const baseUri = new URL(baseUrl);
  const pathname = baseUri.pathname.endsWith('/')
    ? baseUri.pathname
    : baseUri.pathname.substring(0, baseUri.pathname.lastIndexOf('/') + 1);

  return `${baseUri.protocol}//${baseUri.host}${pathname}${imageUrl}`;
}

// Extract product name from URL or HTML title
export async function extractProductName(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      return new URL(url).hostname;
    }

    const html = await response.text();

    // Try to get product name from meta tags
    const ogTitleMatch = html.match(/<meta\s+property=['"]og:title['"][^>]*content=['"]([^'"]+)['"]/i);
    if (ogTitleMatch?.[1]) {
      return ogTitleMatch[1].trim();
    }

    // Try page title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch?.[1]) {
      return titleMatch[1].trim().split('|')[0].trim();
    }

    // Fallback to domain
    return new URL(url).hostname;
  } catch (error) {
    console.error('Failed to extract product name:', error);
    return new URL(url).hostname;
  }
}
