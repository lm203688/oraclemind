/**
 * GeneTech Knowledge Engine SDK
 * 12 domain knowledge bases, 4,000+ structured entities
 * 
 * @example
 * import { GeneTech } from 'genetech-kb';
 * const kb = new GeneTech();
 * const entities = await kb.getEntities('genetech');
 * console.log(entities.total); // 422
 */

const DOMAINS = {
  genetech: 'genetech-tools.pages.dev',
  tcm: 'tcm-tools.pages.dev',
  agent: 'agentecosystem.pages.dev',
  robot: 'robotparts.pages.dev',
  quantum: 'quantumcomputing.pages.dev',
  brain: 'brainscience.pages.dev',
  nuclear: 'nuclearenergy.pages.dev',
  exo: 'exoscience.pages.dev',
  mineral: 'alienminerals.pages.dev',
  deepsea: 'deepseatech.pages.dev',
  energy: 'newenergy-nya.pages.dev',
  life: 'lifescience-epe.pages.dev',
};

export class GeneTech {
  constructor(apiKey) {
    this.apiKey = apiKey || null;
    this.baseDomains = DOMAINS;
  }

  async _fetch(domain, path) {
    const url = `https://${DOMAINS[domain] || domain}/api/${path}`;
    const headers = { 'Content-Type': 'application/json' };
    if (this.apiKey) headers['Authorization'] = `Bearer ${this.apiKey}`;
    
    const resp = await fetch(url, { headers });
    if (!resp.ok) throw new Error(`API error: ${resp.status}`);
    return resp.json();
  }

  /** Get all entities from a domain */
  async getEntities(domain = 'genetech') {
    return this._fetch(domain, 'entities.json');
  }

  /** Get structured data with categories */
  async getData(domain = 'genetech') {
    return this._fetch(domain, 'data.json');
  }

  /** Get knowledge graph */
  async getGraph(domain = 'genetech') {
    return this._fetch(domain, 'graph.json');
  }

  /** Get OpenAPI spec */
  async getOpenAPI(domain = 'genetech') {
    return this._fetch(domain, 'openapi.json');
  }

  /** Get GEO FAQs (AI-optimized Q&A) */
  async getFAQs(domain = 'genetech') {
    return this._fetch(domain, 'geo-faqs.json');
  }

  /** Get cross-domain references */
  async getCrossRefs(domain = 'genetech') {
    return this._fetch(domain, 'cross-refs.json');
  }

  /** List all available domains */
  listDomains() {
    return Object.entries(DOMAINS).map(([key, host]) => ({
      key, host, url: `https://${host}/api/entities.json`
    }));
  }

  /** Register for a free API key */
  static async register(email) {
    const resp = await fetch('https://genetech-tools.pages.dev/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return resp.json();
  }

  /** Search entities across all domains */
  async searchAll(query) {
    const results = {};
    const promises = Object.keys(DOMAINS).map(async (domain) => {
      try {
        const data = await this._fetch(domain, 'entities.json');
        const matches = (data.entities || []).filter(e => 
          JSON.stringify(e).toLowerCase().includes(query.toLowerCase())
        );
        if (matches.length > 0) results[domain] = matches;
      } catch(e) { /* skip failed domains */ }
    });
    await Promise.all(promises);
    return results;
  }
}

export default GeneTech;
