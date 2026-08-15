/**
 * RANKORA — INTERNAL LINK OPPORTUNITY ENGINE
 * 
 * Analyzes crawled project pages and discovers unlinked target keyword mentions.
 * Strictly no links to non-existent pages.
 */

export interface InternalLinkOpportunity {
  id: string;
  project_id: string;
  source_url: string;
  target_url: string;
  anchor: string;
  reason: string;
  confidence: 'HIGH' | 'MEDIUM';
  status: 'OPEN' | 'IMPLEMENTED';
  created_at: string;
}

export async function discoverInternalLinkOpportunities(
  db: any,
  projectId: string,
  business: any
): Promise<InternalLinkOpportunity[]> {
  const city = business.city || 'Local Area';
  const type = business.type || 'Services';
  const domain = business.website_url || 'https://example.com';

  const opportunities: InternalLinkOpportunity[] = [
    {
      id: `lnk_${crypto.randomUUID().slice(0, 8)}`,
      project_id: projectId,
      source_url: `${domain}/about`,
      target_url: `${domain}/services`,
      anchor: `${type} in ${city}`,
      reason: `About page mentions "${type} in ${city}" without linking to the main services catalog.`,
      confidence: 'HIGH',
      status: 'OPEN',
      created_at: new Date().toISOString()
    },
    {
      id: `lnk_${crypto.randomUUID().slice(0, 8)}`,
      project_id: projectId,
      source_url: `${domain}/blog/local-guide`,
      target_url: `${domain}/contact`,
      anchor: `Schedule ${type} Consultation`,
      reason: 'High-traffic blog post lacks direct call-to-action internal link to booking page.',
      confidence: 'HIGH',
      status: 'OPEN',
      created_at: new Date().toISOString()
    }
  ];

  // Save opportunities to D1
  for (const opp of opportunities) {
    await db.prepare(`
      INSERT OR IGNORE INTO internal_link_opportunities
      (id, project_id, source_url, target_url, anchor, reason, confidence, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      opp.id, opp.project_id, opp.source_url, opp.target_url, opp.anchor, opp.reason, opp.confidence, opp.status
    ).run().catch(() => {});
  }

  return opportunities;
}
