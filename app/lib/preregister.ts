import { sql } from "./db";

export interface PreRegistrationRecord {
  id: string;
  email: string;
  platforms: string[];
  ipAddress: string;
  userAgent: string;
  referrer: string;
  createdAt: string;
  updatedAt: string;
}

let tableInitPromise: Promise<void> | null = null;

export async function ensurePreRegistrationTable(): Promise<void> {
  if (tableInitPromise) return tableInitPromise;

  tableInitPromise = (async () => {
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS pre_registrations (
          id BIGSERIAL PRIMARY KEY,
          email TEXT NOT NULL UNIQUE,
          platforms TEXT[] NOT NULL DEFAULT '{}',
          ip_address TEXT DEFAULT '',
          user_agent TEXT DEFAULT '',
          referrer TEXT DEFAULT '',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `;

      await sql`
        CREATE INDEX IF NOT EXISTS idx_pre_registrations_email ON pre_registrations (email);
      `;
      await sql`
        CREATE INDEX IF NOT EXISTS idx_pre_registrations_created_at ON pre_registrations (created_at DESC);
      `;
    } catch (err) {
      console.error("Failed to run pre_registrations migration:", err);
      tableInitPromise = null;
      throw err;
    }
  })();

  return tableInitPromise;
}

export async function savePreRegistration(
  email: string,
  platforms: string[],
  ipAddress: string = "",
  userAgent: string = "",
  referrer: string = ""
): Promise<{ isNew: boolean; totalCount: number }> {
  await ensurePreRegistrationTable();

  const normalizedEmail = email.trim().toLowerCase();
  const cleanPlatforms = Array.from(new Set(platforms.map((p) => p.trim().toLowerCase())));

  // Check if email already registered
  const existing = await sql`
    SELECT id, platforms FROM pre_registrations WHERE email = ${normalizedEmail} LIMIT 1
  `;

  let isNew = true;

  if (existing.length > 0) {
    isNew = false;
    // Merge new platforms with existing platforms
    const mergedPlatforms = Array.from(
      new Set([...(existing[0].platforms || []), ...cleanPlatforms])
    );

    await sql`
      UPDATE pre_registrations
      SET platforms = ${mergedPlatforms},
          ip_address = COALESCE(NULLIF(${ipAddress}, ''), ip_address),
          user_agent = COALESCE(NULLIF(${userAgent}, ''), user_agent),
          referrer = COALESCE(NULLIF(${referrer}, ''), referrer),
          updated_at = NOW()
      WHERE email = ${normalizedEmail}
    `;
  } else {
    await sql`
      INSERT INTO pre_registrations (email, platforms, ip_address, user_agent, referrer, created_at, updated_at)
      VALUES (${normalizedEmail}, ${cleanPlatforms}, ${ipAddress}, ${userAgent}, ${referrer}, NOW(), NOW())
    `;
  }

  const countResult = await sql`
    SELECT COUNT(*)::int as count FROM pre_registrations
  `;
  const totalCount = countResult[0]?.count ?? 0;

  return { isNew, totalCount };
}

export async function getPreRegistrationCount(): Promise<number> {
  try {
    await ensurePreRegistrationTable();
    const countResult = await sql`
      SELECT COUNT(*)::int as count FROM pre_registrations
    `;
    return countResult[0]?.count ?? 0;
  } catch (err) {
    console.error("Error getting pre-registration count:", err);
    return 0;
  }
}
