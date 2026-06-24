// ── New types (simple single-URL lookup) ──────────────────
export interface Person {
  name: string;
  title: string;
  seniority: string;
  email: string;
  linkedin_url: string;
  location: string;
  phone: string;
}

export interface LookupResult {
  success: boolean;
  total: number;
  people: Person[];
  company_url: string;
}

// ── Legacy types (kept so unused components still compile) ─
export type CompanyStatus = 'pending' | 'enriching' | 'found' | 'not_found' | 'no_email' | 'error';
export type JobStatus = 'pending' | 'running' | 'complete' | 'failed';

export interface CompanyResult {
  company_linkedin_url: string;
  company_name: string;
  domain?: string;
  status: CompanyStatus;
  person_name?: string;
  title?: string;
  seniority?: string;
  email?: string;
  phone?: string;
  location?: string;
  industry?: string;
  company_size?: string;
  reason?: string;
  enriched_at?: string;
}

export interface Job {
  jobId: string;
  status: JobStatus;
  totalCompanies: number;
  processedCount: number;
  companies: CompanyResult[];
  createdAt: string;
  updatedAt: string;
}
