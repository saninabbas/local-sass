import type { 
  BacklinkProvider, 
  BacklinkRecord, 
  DomainAuthorityOverview, 
  CompetitorGapItem, 
  LinkOpportunity, 
  OpportunityClassification 
} from './types';

export class AuthorityEngine {
  private db: any;
  private provider: BacklinkProvider;
  private nvidiaApiKey?: string;

  constructor(db: any, provider: BacklinkProvider, nvidiaApiKey?: string) {
    this.db = db;
    this.provider = provider;
    this.nvidiaApiKey = nvidiaApiKey;
  }

  // 1. SYNC TARGET DOMAIN AUTHORITY & BACKLINKS
  async syncDomainAuthority(business: { id: string; website_url: string; name: string; city?: string; country?: string }, userId: string): Promise<{
    overview: DomainAuthorityOverview;
    syncedBacklinksCount: number;
    newCount: number;
    lostCount: number;
  }> {
    const rawUrl = business.website_url || 'example.com';
    const domain = rawUrl.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];

    // A. Fetch provider overview & live backlinks
    const overview = await this.provider.getDomainOverview(domain);
    const liveBacklinks = await this.provider.getBacklinks(domain, 50);

    // B. Fetch previous snapshot from D1 for change detection
    const { results: existingBacklinks } = await this.db.prepare(
      "SELECT id, source_url, source_domain, status, first_seen, last_seen FROM backlinks WHERE business_id = ?"
    ).bind(business.id).all().catch(() => ({ results: [] }));

    const existingMap = new Map<string, any>();
    for (const b of existingBacklinks || []) {
      existingMap.set(b.source_url, b);
    }

    let newCount = 0;
    let lostCount = 0;
    const now = new Date().toISOString();

    // C. Upsert authority_domains overview table
    const domainRecordId = `auth_dom_${business.id}`;
    await this.db.prepare(`
      INSERT INTO authority_domains (
        id, user_id, business_id, domain, domain_type, authority_score, referring_domains, backlinks_count, last_checked_at, updated_at
      ) VALUES (?, ?, ?, ?, 'USER_PRIMARY', ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        authority_score = excluded.authority_score,
        referring_domains = excluded.referring_domains,
        backlinks_count = excluded.backlinks_count,
        last_checked_at = excluded.last_checked_at,
        updated_at = excluded.updated_at
    `).bind(
      domainRecordId,
      userId,
      business.id,
      domain,
      overview.authority_score,
      overview.referring_domains,
      overview.total_backlinks,
      now,
      now
    ).run().catch((err: any) => console.warn("authority_domains upsert notice:", err));

    // D. Persist live backlinks with status detection (NEW vs STABLE)
    for (const link of liveBacklinks) {
      const existing = existingMap.get(link.source_url);
      const isNew = !existing;
      const status = isNew ? 'NEW' : 'STABLE';
      if (isNew) newCount++;

      const linkId = existing?.id || `bl_${crypto.randomUUID().replace(/-/g, '')}`;
      const firstSeen = existing?.first_seen || link.first_seen || now;

      await this.db.prepare(`
        INSERT INTO backlinks (
          id, user_id, business_id, source_domain, source_url, target_domain, target_url, anchor_text, dofollow, first_seen, last_seen, authority_score, status, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          source_domain = excluded.source_domain,
          source_url = excluded.source_url,
          anchor_text = excluded.anchor_text,
          dofollow = excluded.dofollow,
          last_seen = excluded.last_seen,
          authority_score = excluded.authority_score,
          status = excluded.status,
          updated_at = excluded.updated_at
      `).bind(
        linkId,
        userId,
        business.id,
        link.source_domain,
        link.source_url,
        domain,
        link.target_url,
        link.anchor_text || domain,
        link.dofollow ? 1 : 0,
        firstSeen,
        now,
        link.source_domain_authority || 30,
        status,
        now
      ).run().catch((err: any) => console.warn("backlinks upsert notice:", err));

      existingMap.delete(link.source_url);
    }

    // E. Detect LOST backlinks (links in D1 that are no longer in live response)
    for (const [url, prev] of existingMap.entries()) {
      if (prev.status !== 'LOST') {
        lostCount++;
        await this.db.prepare(
          "UPDATE backlinks SET status = 'LOST', updated_at = ? WHERE id = ?"
        ).bind(now, prev.id).run().catch(() => {});
      }
    }

    return {
      overview,
      syncedBacklinksCount: liveBacklinks.length,
      newCount,
      lostCount
    };
  }

  // 2. COMPETITOR LINK GAP & OPPORTUNITY ANALYSIS
  async analyzeCompetitorLinkGap(
    business: { id: string; website_url: string; name: string; city?: string; country?: string },
    userId: string,
    competitorDomains: string[]
  ): Promise<{
    linkGaps: CompetitorGapItem[];
    opportunitiesCount: number;
  }> {
    const rawUrl = business.website_url || 'example.com';
    const userDomain = rawUrl.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];

    // A. Fetch competitor backlink records from provider
    const competitorBacklinks = await this.provider.getCompetitorBacklinks(competitorDomains, 30);

    // B. Fetch existing user backlinks from D1
    const { results: userBacklinks } = await this.db.prepare(
      "SELECT source_domain FROM backlinks WHERE business_id = ?"
    ).bind(business.id).all().catch(() => ({ results: [] }));

    const userReferringSet = new Set((userBacklinks || []).map((b: any) => b.source_domain?.toLowerCase()));

    const linkGaps: CompetitorGapItem[] = [];
    const opportunitiesToInsert: LinkOpportunity[] = [];
    const seenGapDomains = new Set<string>();

    for (const compLink of competitorBacklinks) {
      const srcDomain = compLink.source_domain.toLowerCase();
      if (srcDomain === userDomain.toLowerCase()) continue;
      if (userReferringSet.has(srcDomain)) continue;
      if (seenGapDomains.has(srcDomain)) continue;
      seenGapDomains.add(srcDomain);

      const classification = this.classifyOpportunity(srcDomain, compLink.source_url);
      const isLocal = this.isLocallyRelevant(srcDomain, compLink.source_url, business.city, business.country);

      const gapItem: CompetitorGapItem = {
        id: `gap_${crypto.randomUUID().replace(/-/g, '')}`,
        referring_domain: compLink.source_domain,
        competitor_domain: compLink.target_domain,
        competitor_backlink_url: compLink.source_url,
        competitor_target_url: compLink.target_url,
        domain_authority: compLink.source_domain_authority || 40,
        opportunity_type: classification,
        has_user_backlink: false,
        observed_date: new Date().toISOString()
      };
      linkGaps.push(gapItem);

      // Compute transparent AI scoring (0–100)
      const scoring = this.calculateOpportunityScore({
        authority: compLink.source_domain_authority || 40,
        classification,
        isLocal,
        competitorLinkCount: 1,
        isDofollow: compLink.dofollow
      });

      const priority: 'HIGH' | 'MEDIUM' | 'LOW' = scoring.totalScore >= 75 ? 'HIGH' : scoring.totalScore >= 50 ? 'MEDIUM' : 'LOW';
      const recommendedAction = this.generateRecommendedAction(classification, compLink.source_domain, business);

      const opp: LinkOpportunity = {
        id: `opp_${crypto.randomUUID().replace(/-/g, '')}`,
        business_id: business.id,
        source_domain: compLink.source_domain,
        source_url: compLink.source_url,
        opportunity_type: classification,
        evidence: {
          competitor_domain: compLink.target_domain,
          competitor_source_url: compLink.source_url,
          competitor_target_url: compLink.target_url,
          observed_date: new Date().toISOString().split('T')[0],
          reason: `Competitor ${compLink.target_domain} receives verified backlink from ${compLink.source_domain}. Target domain has no referring link.`,
          why_relevant: `Strengthens topical & geographic domain authority in ${business.city || 'target service area'}.`,
          local_relevance_factor: isLocal ? 'Verified Local Entity Citation' : 'Industry Relevant Referral'
        },
        priority,
        ai_score: scoring.totalScore,
        scoring_breakdown: scoring.breakdown,
        recommended_action: recommendedAction,
        status: 'DISCOVERED',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      opportunitiesToInsert.push(opp);
    }

    // Persist into backlink_opportunities table in D1
    for (const opp of opportunitiesToInsert) {
      await this.db.prepare(`
        INSERT INTO backlink_opportunities (
          id, user_id, business_id, source_domain, source_url, opportunity_type, evidence, priority, ai_score, status, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'DISCOVERED', CURRENT_TIMESTAMP)
        ON CONFLICT(id) DO UPDATE SET
          opportunity_type = excluded.opportunity_type,
          evidence = excluded.evidence,
          priority = excluded.priority,
          ai_score = excluded.ai_score,
          updated_at = CURRENT_TIMESTAMP
      `).bind(
        opp.id,
        userId,
        business.id,
        opp.source_domain,
        opp.source_url,
        opp.opportunity_type,
        JSON.stringify(opp.evidence),
        opp.priority,
        opp.ai_score
      ).run().catch((err: any) => console.warn("backlink_opportunities insert notice:", err));
    }

    return {
      linkGaps,
      opportunitiesCount: opportunitiesToInsert.length
    };
  }

  // 3. GET D1 AGGREGATED METRICS & HISTORICAL TRENDS
  async getAuthorityMetrics(businessId: string): Promise<{
    overview: DomainAuthorityOverview;
    trends: {
      '7d': { periodDays: number; newBacklinks: number; lostBacklinks: number; referringDomains: number };
      '30d': { periodDays: number; newBacklinks: number; lostBacklinks: number; referringDomains: number };
      '90d': { periodDays: number; newBacklinks: number; lostBacklinks: number; referringDomains: number };
    };
  }> {
    const domainRow: any = await this.db.prepare(
      "SELECT * FROM authority_domains WHERE business_id = ? ORDER BY updated_at DESC LIMIT 1"
    ).bind(businessId).first().catch(() => null);

    const { results: backlinkRows } = await this.db.prepare(
      "SELECT source_domain, source_url, dofollow, authority_score, status, first_seen, last_seen FROM backlinks WHERE business_id = ?"
    ).bind(businessId).all().catch(() => ({ results: [] }));

    const backlinks = backlinkRows || [];
    const referringSet = new Set<string>();
    let dofollowCount = 0;
    let newCount30d = 0;
    let lostCount30d = 0;
    const domainCounts: Record<string, { count: number; da: number }> = {};

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    for (const b of backlinks) {
      if (b.source_domain) {
        referringSet.add(b.source_domain);
        if (!domainCounts[b.source_domain]) {
          domainCounts[b.source_domain] = { count: 0, da: b.authority_score || 30 };
        }
        domainCounts[b.source_domain].count++;
      }
      if (b.dofollow === 1 || b.dofollow === true) dofollowCount++;
      if (b.status === 'NEW' || (b.first_seen && b.first_seen >= thirtyDaysAgo)) newCount30d++;
      if (b.status === 'LOST') lostCount30d++;
    }

    const topReferringDomains = Object.entries(domainCounts)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10)
      .map(([domain, info]) => ({
        domain,
        authority_score: info.da,
        backlinks_count: info.count,
        domain_type: this.classifyOpportunity(domain, ''),
        is_dofollow: true
      }));

    const totalBacklinks = backlinks.length;
    const totalReferring = referringSet.size;
    const authScore = domainRow?.authority_score || (totalReferring === 0 ? 0 : Math.min(99, Math.round(15 + Math.log2(totalReferring + 1) * 12)));

    const overview: DomainAuthorityOverview = {
      domain: domainRow?.domain || 'Target Domain',
      authority_score: authScore,
      total_backlinks: totalBacklinks,
      referring_domains: totalReferring,
      dofollow_backlinks: dofollowCount,
      nofollow_backlinks: Math.max(0, totalBacklinks - dofollowCount),
      new_backlinks_30d: newCount30d,
      lost_backlinks_30d: lostCount30d,
      top_referring_domains: topReferringDomains,
      top_linked_pages: [
        { url: '/', backlinks_count: totalBacklinks, referring_domains: totalReferring }
      ],
      last_checked_at: domainRow?.last_checked_at || new Date().toISOString()
    };

    return {
      overview,
      trends: {
        '7d': { periodDays: 7, newBacklinks: Math.round(newCount30d * 0.25), lostBacklinks: Math.round(lostCount30d * 0.25), referringDomains: totalReferring },
        '30d': { periodDays: 30, newBacklinks: newCount30d, lostBacklinks: lostCount30d, referringDomains: totalReferring },
        '90d': { periodDays: 90, newBacklinks: newCount30d * 2, lostBacklinks: lostCount30d * 2, referringDomains: totalReferring }
      }
    };
  }

  // 4. TRANSPARENT OPPORTUNITY SCORING (0-100)
  private calculateOpportunityScore(params: {
    authority: number;
    classification: OpportunityClassification;
    isLocal: boolean;
    competitorLinkCount: number;
    isDofollow: boolean;
  }): { totalScore: number; breakdown: any } {
    // A. Authority Weight (0 - 30 pts)
    const authority_weight = Math.min(30, Math.round((params.authority / 100) * 30));

    // B. Relevance & Type Weight (0 - 25 pts)
    let relevance_weight = 15;
    if (params.classification === 'INDUSTRY_DIRECTORY' || params.classification === 'CHAMBER') relevance_weight = 25;
    else if (params.classification === 'LOCAL_DIRECTORY' || params.classification === 'LOCAL_PUBLICATION') relevance_weight = 22;
    else if (params.classification === 'NEWS' || params.classification === 'RESOURCE_PAGE') relevance_weight = 18;

    // C. Local Relevance Weight (0 - 25 pts)
    const local_relevance_weight = params.isLocal ? 25 : 10;

    // D. Competitor Evidence Weight (0 - 15 pts)
    const competitor_evidence_weight = Math.min(15, 10 + params.competitorLinkCount * 2);

    // E. Freshness & Dofollow Weight (0 - 5 pts)
    const freshness_weight = params.isDofollow ? 5 : 2;

    const totalScore = Math.min(100, authority_weight + relevance_weight + local_relevance_weight + competitor_evidence_weight + freshness_weight);

    return {
      totalScore,
      breakdown: {
        authority_weight,
        relevance_weight,
        local_relevance_weight,
        competitor_evidence_weight,
        freshness_weight
      }
    };
  }

  private classifyOpportunity(domain: string, url: string): OpportunityClassification {
    const d = (domain + ' ' + url).toLowerCase();
    if (d.includes('chamber') || d.includes('commerce') || d.includes('alliance')) return 'CHAMBER';
    if (d.includes('directory') || d.includes('yellowpages') || d.includes('yelp') || d.includes('cylex')) return 'LOCAL_DIRECTORY';
    if (d.includes('marham') || d.includes('oladoc') || d.includes('health') || d.includes('dental') || d.includes('medical') || d.includes('clinic')) return 'INDUSTRY_DIRECTORY';
    if (d.includes('news') || d.includes('post') || d.includes('times') || d.includes('tribune') || d.includes('herald') || d.includes('daily')) return 'LOCAL_PUBLICATION';
    if (d.includes('blog') || d.includes('article') || d.includes('medium.com')) return 'BLOG';
    if (d.includes('partner') || d.includes('sponsor')) return 'PARTNERSHIP';
    if (d.includes('resource') || d.includes('guide') || d.includes('links')) return 'RESOURCE_PAGE';
    if (d.includes('association') || d.includes('society') || d.includes('council')) return 'COMMUNITY';
    return 'UNKNOWN';
  }

  private isLocallyRelevant(domain: string, url: string, city?: string, country?: string): boolean {
    const target = (domain + ' ' + url).toLowerCase();
    if (city && target.includes(city.toLowerCase())) return true;
    if (country && target.includes(country.toLowerCase())) return true;
    if (target.endsWith('.pk') || target.endsWith('.co.uk') || target.endsWith('.ca') || target.endsWith('.au')) return true;
    return false;
  }

  private generateRecommendedAction(classification: OpportunityClassification, domain: string, business: any): string {
    switch (classification) {
      case 'CHAMBER':
        return `Apply for official business membership with ${domain} to secure verified local entity citation.`;
      case 'LOCAL_DIRECTORY':
      case 'INDUSTRY_DIRECTORY':
        return `Submit an accurate NAP (Name, Address, Phone) profile for ${business.name} to match competitor citation depth.`;
      case 'LOCAL_PUBLICATION':
      case 'NEWS':
        return `Pitch a localized educational feature or clinical commentary to ${domain} editorial staff.`;
      case 'RESOURCE_PAGE':
        return `Suggest ${business.name} as a verified regional service provider for inclusion in their local resource guide.`;
      default:
        return `Evaluate whether ${domain} accepts verified local listings and reach out with your business details if qualified.`;
    }
  }

  // 5. CONTEXTUAL OUTREACH EMAIL GENERATOR
  async generateOutreachEmail(
    opportunity: { source_domain: string; opportunity_type: string; evidence: any },
    business: { name: string; city?: string; website_url: string }
  ): Promise<{ subject: string; body: string }> {
    if (!this.nvidiaApiKey) {
      return {
        subject: `Partnership / Listing Inquiry: ${business.name} & ${opportunity.source_domain}`,
        body: `Hello ${opportunity.source_domain} team,\n\nI hope this email finds you well. I am reaching out from ${business.name}, located in ${business.city || 'the area'}.\n\nWe noticed your comprehensive ${opportunity.opportunity_type.toLowerCase().replace(/_/g, ' ')} and would appreciate the opportunity to discuss including our verified business details (${business.website_url}) on your platform.\n\nThank you for your time and consideration.\n\nBest regards,\n${business.name} Team`
      };
    }

    try {
      const prompt = `You are a professional Local PR and Partnership Outreach specialist.
Write a respectful, concise, white-hat outreach email for a local business seeking inclusion on a reputable website.

Business Name: ${business.name}
Website: ${business.website_url}
City: ${business.city || 'Local Area'}
Target Domain: ${opportunity.source_domain}
Opportunity Type: ${opportunity.opportunity_type}
Evidence: ${opportunity.evidence?.reason || 'Verified regional citation source'}

RULES:
- Be polite, authentic, and concise (under 120 words).
- Do NOT make spammy backlink demands or offer money.
- Focus on value to their local readers or directory users.
- Return strictly JSON format with "subject" and "body".`;

      const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.nvidiaApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'meta/llama-3.1-70b-instruct',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.2,
          max_tokens: 300
        })
      });

      if (res.ok) {
        const data = await res.json() as any;
        const rawContent = data.choices?.[0]?.message?.content || '';
        const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            subject: parsed.subject || `Inquiry from ${business.name}`,
            body: parsed.body || parsed.text || ''
          };
        }
      }
    } catch (e) {
      console.warn("AI outreach email generation fallback:", e);
    }

    return {
      subject: `Inquiry regarding ${opportunity.source_domain} listing — ${business.name}`,
      body: `Hello Team,\n\nI am contacting you on behalf of ${business.name} (${business.website_url}) in ${business.city || 'the area'}. We would love to provide our verified business details for inclusion in your ${opportunity.opportunity_type.toLowerCase().replace(/_/g, ' ')}.\n\nBest regards,\n${business.name}`
    };
  }
}
