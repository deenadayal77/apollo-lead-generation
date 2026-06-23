import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import type { Job, CompanyResult } from '@/lib/types';

// Register Helvetica as the default font (built-in to PDF)
// No external font needed

const colors = {
  headerBg: '#1e3a5f',
  headerText: '#ffffff',
  accentBlue: '#3b82f6',
  tableHeaderBg: '#1e293b',
  tableHeaderText: '#94a3b8',
  rowEven: '#0f172a',
  rowOdd: '#1e293b',
  rowText: '#e2e8f0',
  rowSubtext: '#94a3b8',
  borderColor: '#334155',
  successGreen: '#4ade80',
  warningYellow: '#facc15',
  errorRed: '#f87171',
  bodyBg: '#020617',
  sectionBg: '#0f172a',
  sectionBorder: '#1e293b',
  footerText: '#64748b',
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.bodyBg,
    paddingTop: 0,
    paddingBottom: 40,
    paddingHorizontal: 0,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: colors.rowText,
  },

  // Header
  header: {
    backgroundColor: colors.headerBg,
    paddingVertical: 24,
    paddingHorizontal: 32,
    marginBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  brandContainer: {
    flexDirection: 'column',
  },
  brandName: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  brandAccent: {
    color: colors.accentBlue,
  },
  tagline: {
    fontSize: 9,
    color: '#94a3b8',
    marginTop: 3,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  headerMeta: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  headerMetaLabel: {
    fontSize: 8,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  headerMetaValue: {
    fontSize: 9,
    color: '#cbd5e1',
    marginTop: 2,
    fontFamily: 'Helvetica',
  },
  headerDivider: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.15)',
    marginTop: 12,
    marginBottom: 12,
  },
  headerJobId: {
    fontSize: 8,
    color: '#94a3b8',
  },

  // Body
  body: {
    paddingHorizontal: 32,
  },

  // Summary section
  summarySection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.sectionBg,
    borderWidth: 1,
    borderColor: colors.sectionBorder,
    borderRadius: 6,
    padding: 12,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 8,
    color: colors.rowSubtext,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  // Section title
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#e2e8f0',
    marginBottom: 10,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },

  // Table
  table: {
    borderWidth: 1,
    borderColor: colors.borderColor,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.tableHeaderBg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderColor,
  },
  tableHeaderCell: {
    padding: 8,
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: colors.tableHeaderText,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(51,65,85,0.5)',
  },
  tableRowEven: {
    backgroundColor: colors.rowEven,
  },
  tableRowOdd: {
    backgroundColor: colors.rowOdd,
  },
  tableCell: {
    padding: 7,
    fontSize: 9,
    color: colors.rowText,
    flexWrap: 'wrap',
  },
  tableCellSub: {
    fontSize: 8,
    color: colors.rowSubtext,
    marginTop: 2,
  },

  // Column widths
  colCompany: { width: '25%' },
  colContact: { width: '22%' },
  colTitle: { width: '20%' },
  colEmail: { width: '25%' },
  colPhone: { width: '8%' },

  // Status badge
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  badgeText: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 32,
    right: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.sectionBorder,
    paddingTop: 8,
  },
  footerText: {
    fontSize: 8,
    color: colors.footerText,
  },
  pageNumber: {
    fontSize: 8,
    color: colors.footerText,
  },
});

function getStatusColor(status: string): string {
  switch (status) {
    case 'found':
      return colors.successGreen;
    case 'no_email':
      return colors.warningYellow;
    case 'not_found':
    case 'error':
      return colors.errorRed;
    default:
      return '#94a3b8';
  }
}

function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    found: 'Found',
    not_found: 'Not Found',
    no_email: 'No Email',
    error: 'Error',
    pending: 'Pending',
    enriching: 'Enriching',
  };
  return map[status] ?? status;
}

function SummaryCards({ job }: { job: Job }) {
  const found = job.companies.filter((c) => c.status === 'found').length;
  const noEmail = job.companies.filter((c) => c.status === 'no_email').length;
  const notFound = job.companies.filter((c) => c.status === 'not_found').length;

  return (
    <View style={styles.summarySection}>
      <View style={styles.summaryCard}>
        <Text style={[styles.summaryValue, { color: colors.successGreen }]}>{found}</Text>
        <Text style={styles.summaryLabel}>Found</Text>
      </View>
      <View style={styles.summaryCard}>
        <Text style={[styles.summaryValue, { color: colors.warningYellow }]}>{noEmail}</Text>
        <Text style={styles.summaryLabel}>No Email</Text>
      </View>
      <View style={styles.summaryCard}>
        <Text style={[styles.summaryValue, { color: colors.errorRed }]}>{notFound}</Text>
        <Text style={styles.summaryLabel}>Not Found</Text>
      </View>
      <View style={styles.summaryCard}>
        <Text style={[styles.summaryValue, { color: colors.accentBlue }]}>
          {job.totalCompanies}
        </Text>
        <Text style={styles.summaryLabel}>Total</Text>
      </View>
    </View>
  );
}

function LeadTable({ companies }: { companies: CompanyResult[] }) {
  const foundLeads = companies.filter((c) => c.status === 'found');

  if (foundLeads.length === 0) {
    return (
      <View>
        <Text style={[styles.sectionTitle, { marginBottom: 8 }]}>Enriched Leads</Text>
        <View
          style={[
            styles.table,
            { padding: 16, alignItems: 'center', justifyContent: 'center' },
          ]}
        >
          <Text style={{ color: colors.rowSubtext, fontSize: 9 }}>
            No leads with found status in this job.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View>
      <Text style={styles.sectionTitle}>
        Enriched Leads ({foundLeads.length} found)
      </Text>
      <View style={styles.table}>
        {/* Header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, styles.colCompany]}>Company</Text>
          <Text style={[styles.tableHeaderCell, styles.colContact]}>Contact</Text>
          <Text style={[styles.tableHeaderCell, styles.colTitle]}>Title</Text>
          <Text style={[styles.tableHeaderCell, styles.colEmail]}>Email</Text>
          <Text style={[styles.tableHeaderCell, styles.colPhone]}>Phone</Text>
        </View>

        {/* Rows */}
        {foundLeads.map((company, index) => (
          <View
            key={`${company.company_linkedin_url}-${index}`}
            style={[
              styles.tableRow,
              index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd,
            ]}
            wrap={false}
          >
            <View style={[styles.tableCell, styles.colCompany]}>
              <Text>{company.company_name || '—'}</Text>
              {company.industry && (
                <Text style={styles.tableCellSub}>{company.industry}</Text>
              )}
            </View>

            <View style={[styles.tableCell, styles.colContact]}>
              <Text>{company.person_name || '—'}</Text>
              {company.seniority && (
                <Text style={styles.tableCellSub}>{company.seniority}</Text>
              )}
            </View>

            <View style={[styles.tableCell, styles.colTitle]}>
              <Text>{company.title || '—'}</Text>
              {company.location && (
                <Text style={styles.tableCellSub}>{company.location}</Text>
              )}
            </View>

            <View style={[styles.tableCell, styles.colEmail]}>
              <Text style={{ color: colors.accentBlue }}>{company.email || '—'}</Text>
            </View>

            <View style={[styles.tableCell, styles.colPhone]}>
              <Text style={{ fontSize: 8 }}>{company.phone || '—'}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function AllCompaniesTable({ companies }: { companies: CompanyResult[] }) {
  const nonFound = companies.filter((c) => c.status !== 'found');
  if (nonFound.length === 0) return null;

  return (
    <View>
      <Text style={styles.sectionTitle}>
        Other Companies ({nonFound.length})
      </Text>
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, { width: '45%' }]}>Company</Text>
          <Text style={[styles.tableHeaderCell, { width: '35%' }]}>LinkedIn URL</Text>
          <Text style={[styles.tableHeaderCell, { width: '20%' }]}>Status</Text>
        </View>

        {nonFound.map((company, index) => (
          <View
            key={`other-${company.company_linkedin_url}-${index}`}
            style={[
              styles.tableRow,
              index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd,
            ]}
            wrap={false}
          >
            <View style={[styles.tableCell, { width: '45%' }]}>
              <Text>{company.company_name || '—'}</Text>
            </View>

            <View style={[styles.tableCell, { width: '35%' }]}>
              <Text style={{ fontSize: 8, color: colors.rowSubtext }}>
                {company.company_linkedin_url
                  ? company.company_linkedin_url.replace('https://', '').replace('www.', '')
                  : '—'}
              </Text>
            </View>

            <View style={[styles.tableCell, { width: '20%' }]}>
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: `${getStatusColor(company.status)}20`,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    { color: getStatusColor(company.status) },
                  ]}
                >
                  {getStatusLabel(company.status)}
                </Text>
              </View>
              {company.reason && (
                <Text style={[styles.tableCellSub, { fontSize: 7, marginTop: 3 }]}>
                  {company.reason}
                </Text>
              )}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

interface LeadReportDocumentProps {
  job: Job;
}

export function LeadReportDocument({ job }: LeadReportDocumentProps) {
  const reportDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Document
      title={`HelixGTM Lead Enrichment Report — ${job.jobId}`}
      author="HelixGTM"
      subject="Lead Enrichment Report"
      creator="HelixGTM Lead Enrichment Engine"
    >
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Header */}
        <View style={styles.header} fixed>
          <View style={styles.headerTop}>
            <View style={styles.brandContainer}>
              <Text style={styles.brandName}>
                Helix<Text style={styles.brandAccent}>GTM</Text>
              </Text>
              <Text style={styles.tagline}>Lead Enrichment Report</Text>
            </View>
            <View style={styles.headerMeta}>
              <Text style={styles.headerMetaLabel}>Generated</Text>
              <Text style={styles.headerMetaValue}>{reportDate}</Text>
              <Text style={[styles.headerMetaLabel, { marginTop: 6 }]}>Powered by</Text>
              <Text style={styles.headerMetaValue}>Apollo.io</Text>
            </View>
          </View>
          <View style={styles.headerDivider} />
          <Text style={styles.headerJobId}>Job ID: {job.jobId}</Text>
        </View>

        {/* Body */}
        <View style={styles.body}>
          {/* Summary cards */}
          <SummaryCards job={job} />

          {/* Found leads table */}
          <LeadTable companies={job.companies} />

          {/* Other companies */}
          <AllCompaniesTable companies={job.companies} />
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            HelixGTM — Lead Enrichment Engine · Powered by Apollo.io
          </Text>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
