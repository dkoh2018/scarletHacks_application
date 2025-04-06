// Simple empty session fallback
// No imports needed - completely standalone

export async function GET() {
  // Always return a valid JSON response for session
  return new Response(JSON.stringify({ 
    user: null,
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() 
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
