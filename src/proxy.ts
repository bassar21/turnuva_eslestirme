import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

// Not: middleware Edge runtime'da çalışır, veritabanına erişemez. Burada
// yalnızca token'ın geçerliliği ve rolü kontrol edilir; askıya alınmış admin
// kontrolü ve scope eşleşmesi her sayfa/route'ta (Node runtime) tekrar yapılır.

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isSuperadminArea =
    pathname.startsWith("/superadmin") && pathname !== "/superadmin/login";
  const isAdminArea = pathname.startsWith("/admin") && pathname !== "/admin/login";

  if (!isSuperadminArea && !isAdminArea) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (isSuperadminArea && session?.role !== "superadmin") {
    const url = request.nextUrl.clone();
    url.pathname = "/superadmin/login";
    return NextResponse.redirect(url);
  }

  if (isAdminArea && !session) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/superadmin/:path*"],
};
