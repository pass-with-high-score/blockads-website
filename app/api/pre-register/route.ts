import { NextRequest, NextResponse } from "next/server";
import { savePreRegistration, getPreRegistrationCount } from "@/app/lib/preregister";
import { sendPreRegistrationNotification } from "@/app/lib/notify";

export const dynamic = "force-dynamic";

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export async function GET() {
  try {
    const count = await getPreRegistrationCount();
    return NextResponse.json({ success: true, count });
  } catch (error: unknown) {
    console.error("GET /api/pre-register error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve waitlist count" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, platforms, referrer } = body;

    // Validate email
    if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    // Validate platforms
    if (!Array.isArray(platforms) || platforms.length === 0) {
      return NextResponse.json(
        { success: false, error: "Please select at least one platform (macOS or Windows)." },
        { status: 400 }
      );
    }

    const validPlatforms = ["macos", "windows"];
    const sanitizedPlatforms = platforms
      .map((p) => String(p).trim().toLowerCase())
      .filter((p) => validPlatforms.includes(p));

    if (sanitizedPlatforms.length === 0) {
      return NextResponse.json(
        { success: false, error: "Invalid platform selection. Choose macOS and/or Windows." },
        { status: 400 }
      );
    }

    // Extract client IP and User Agent
    const ipAddress =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "";
    const userAgent = req.headers.get("user-agent") || "";

    // Save to Database
    const { isNew, totalCount } = await savePreRegistration(
      email.trim(),
      sanitizedPlatforms,
      ipAddress,
      userAgent,
      typeof referrer === "string" ? referrer.slice(0, 255) : ""
    );

    // Trigger Telegram/Discord notifications in background
    sendPreRegistrationNotification({
      email: email.trim(),
      platforms: sanitizedPlatforms,
      ipAddress,
      userAgent,
      referrer: typeof referrer === "string" ? referrer : undefined,
      totalCount,
    }).catch((err) => {
      console.error("Background notification error:", err);
    });

    return NextResponse.json({
      success: true,
      isNew,
      totalCount,
      message: isNew
        ? "You're on the list! We'll notify you as soon as the desktop release is ready."
        : "Your pre-registration has been updated with your latest platform preferences!",
    });
  } catch (error: unknown) {
    console.error("POST /api/pre-register error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred while saving your pre-registration. Please try again.",
      },
      { status: 500 }
    );
  }
}
