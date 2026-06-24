import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import type { LookupResult, Person } from '@/lib/types';

const colors = {
  headerBg:       '#1e3a5f',
  accentBlue:     '#3b82f6',
  tableHeaderBg:  '#1e293b',
  tableHeaderText:'#94a3b8',
  rowEven:        '#0f172a',
  rowOdd:         '#1e293b',
  rowText:        '#e2e8f0',
  rowSubtext:     '#94a3b8',
  borderColor:    '#334155',
  successGreen:   '#4ade80',
  warningYellow:  '#facc15',
  bodyBg:         '#020617',
  sectionBg:      '#0f172a',
  sectionBorder:  '#1e293b',
  footerText:     '#64748b',
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
  brandName: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  brandAccent: { color: colors.accentBlue },
  tagline: {
    fontSize: 9,
    color: '#94a3b8',
    marginTop: 3,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  headerMeta: { flexDirection: 'column', alignItems: 'flex-end' },
  headerMetaLabel: {
    fontSize: 8,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  headerMetaValue: { fontSize: 9, color: '#cbd5e1', marginTop: 2 },
  headerDivider: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.15)',
    marginTop: 12,
    marginBottom: 12,
  },
  headerCompanyUrl: { fontSize: 8, color: '#94a3b8' },
  body: { paddingHorizontal: 32 },
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
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#e2e8f0',
    marginBottom: 10,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
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
  tableRowEven: { backgroundColor: colors.rowEven },
  tableRowOdd:  { backgroundColor: colors.rowOdd },
  tableCell: { padding: 7, fontSize: 9, color: colors.rowText, flexWrap: 'wrap' },
  tableCellSub: { fontSize: 8, color: colors.rowSubtext, marginTop: 2 },
  colName:      { width: '20%' },
  colTitle:     { width: '22%' },
  colSeniority: { width: '10%' },
  colEmail:     { width: '26%' },
  colPhone:     { width: '12%' },
  colLocation:  { width: '10%' },
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
  footerText:  { fontSize: 8, color: colors.footerText },
  pageNumber:  { fontSize: 8, color: colors.footerText },
});

const SENIORITY_LABELS: Record<string, string> = {
  owner: 'Owner', founder: 'Founder', c_suite: 'C-Suite', partner: 'Partner',
  vp: 'VP', head: 'Head', director: 'Director', manager: 'Manager', senior: 'Senior',
};

function SummaryCards({ result }: { result: LookupResult }) {
  const withEmail = result.people.filter((p) => p.email).length;
  const noEmail   = result.people.filter((p) => !p.email).length;

  return (
    <View style={styles.summarySection}>
      <View style={styles.summaryCard}>
        <Text style={[styles.summaryValue, { color: colors.accentBlue }]}>{result.total}</Text>
        <Text style={styles.summaryLabel}>People Found</Text>
      </View>
      <View style={styles.summaryCard}>
        <Text style={[styles.summaryValue, { color: colors.successGreen }]}>{withEmail}</Text>
        <Text style={styles.summaryLabel}>With Email</Text>
      </View>
      <View style={styles.summaryCard}>
        <Text style={[styles.summaryValue, { color: colors.warningYellow }]}>{noEmail}</Text>
        <Text style={styles.summaryLabel}>No Email</Text>
      </View>
    </View>
  );
}

function PeopleTable({ people }: { people: Person[] }) {
  return (
    <View>
      <Text style={styles.sectionTitle}>Top Contacts ({people.length})</Text>
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, styles.colName]}>Name</Text>
          <Text style={[styles.tableHeaderCell, styles.colTitle]}>Title</Text>
          <Text style={[styles.tableHeaderCell, styles.colSeniority]}>Level</Text>
          <Text style={[styles.tableHeaderCell, styles.colEmail]}>Email</Text>
          <Text style={[styles.tableHeaderCell, styles.colPhone]}>Phone</Text>
          <Text style={[styles.tableHeaderCell, styles.colLocation]}>Location</Text>
        </View>

        {people.map((person, index) => (
          <View
            key={index}
            style={[
              styles.tableRow,
              index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd,
            ]}
            wrap={false}
          >
            <View style={[styles.tableCell, styles.colName]}>
              <Text>{person.name || '—'}</Text>
            </View>
            <View style={[styles.tableCell, styles.colTitle]}>
              <Text>{person.title || '—'}</Text>
            </View>
            <View style={[styles.tableCell, styles.colSeniority]}>
              <Text style={{ fontSize: 8 }}>
                {SENIORITY_LABELS[person.seniority] ?? person.seniority ?? '—'}
              </Text>
            </View>
            <View style={[styles.tableCell, styles.colEmail]}>
              <Text style={{ color: person.email ? colors.accentBlue : colors.rowSubtext }}>
                {person.email || 'Not available'}
              </Text>
            </View>
            <View style={[styles.tableCell, styles.colPhone]}>
              <Text style={{ fontSize: 8 }}>{person.phone || '—'}</Text>
            </View>
            <View style={[styles.tableCell, styles.colLocation]}>
              <Text style={{ fontSize: 8 }}>{person.location || '—'}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

interface LeadReportDocumentProps {
  result: LookupResult;
}

export function LeadReportDocument({ result }: LeadReportDocumentProps) {
  const reportDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const companyDisplay = (result.company_url || '')
    .replace(/https?:\/\//, '')
    .replace('www.', '');

  return (
    <Document
      title="HelixGTM People Lookup Report"
      author="HelixGTM"
      subject="Lead Enrichment Report"
      creator="HelixGTM Lead Enrichment Engine"
    >
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Header */}
        <View style={styles.header} fixed>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.brandName}>
                Helix<Text style={styles.brandAccent}>GTM</Text>
              </Text>
              <Text style={styles.tagline}>People Lookup Report</Text>
            </View>
            <View style={styles.headerMeta}>
              <Text style={styles.headerMetaLabel}>Generated</Text>
              <Text style={styles.headerMetaValue}>{reportDate}</Text>
              <Text style={[styles.headerMetaLabel, { marginTop: 6 }]}>Powered by</Text>
              <Text style={styles.headerMetaValue}>Apollo.io</Text>
            </View>
          </View>
          <View style={styles.headerDivider} />
          <Text style={styles.headerCompanyUrl}>{companyDisplay}</Text>
        </View>

        {/* Body */}
        <View style={styles.body}>
          <SummaryCards result={result} />
          <PeopleTable people={result.people} />
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            HelixGTM — Lead Enrichment Engine · Powered by Apollo.io
          </Text>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}
