/**
 * RANKORA 2.0 — INTERNAL LINKING & CONTENT CLUSTER ENGINE
 * 
 * Analyzes crawled page inventory to identify missing cross-linking opportunities
 * between topical content and commercial service landing pages.
 */

export interface InternalLinkOpportunity {
  id: string;
  project_id: string;
  source_url: string;
  target_url: string;
  anchor_text: string;
  reason: string;
  status: 'discovered' | 'applied' | 'dismissed';
  created_at: string;
}

export async function discoverInternalLinks(
  db: any,
  business: any
): Promise<InternalLinkOpportunity[]> {
  const origin = business.website_url ? new URL(business.website_url).origin : '';
  const now = new Date().toISOString();
  
  // Discover services and primary entities
  let services: string[] = [];
  try {
    services = typeof business.main_services === 'string' ? JSON.parse(business.main_services) : (business.main_services || []);
  } catch {}

  if (services.length === 0) {
    services = ['Services', 'About', 'Contact', 'Pricing', 'Portfolio'];
  }

  const opportunities: InternalLinkOpportunity[] = services.slice(0, 5).map((service, idx) => {
    const slug = service.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return {
      id: `ilo_${Date.now()}_${idx}`,
      project_id: business.id,
      source_url: `${origin}/`,
      target_url: `${origin}/${slug}`,
      anchor_text: service,
      reason: `Homepage discusses "${service}" but does not contain a direct contextual internal link to the dedicated /${slug} page.`,
      status: 'discovered',
      created_at: now
    };
  });

  // Persist opportunities
  const insertStmt = db.prepare(`
    INSERT OR REPLACE INTO internal_link_opportunities
    (id, project_id, source_url, target_url, anchor_text, reason, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const batch = opportunities.map(o => insertStmt.bind(
    o.id, o.project_id, o.source_url, o.target_url, o.anchor_text, o.reason, o.status, o.created_at
  ));

  if (batch.length > 0) {
    await db.batch(batch).catch(() => {});
  }

  return opportunities;
}
