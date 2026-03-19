import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Auth bảo vệ client-side trong mỗi page.
// Middleware này chỉ pass-through, không block.
export function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
