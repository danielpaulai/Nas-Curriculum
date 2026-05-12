import {
  pgTable,
  uuid,
  text,
  boolean,
  date,
  numeric,
  integer,
  jsonb,
  timestamp,
} from 'drizzle-orm/pg-core'

// ============================================================================
// Module 1: Knowledge Base
// ============================================================================
export const meetings = pgTable('meetings', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  meetingDate: date('meeting_date'),
  participants: text('participants').array(),
  rawTranscript: text('raw_transcript').notNull(),
  source: text('source'),
  processed: boolean('processed').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export const kbEntries = pgTable('kb_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  sourceMeetingId: uuid('source_meeting_id').references(() => meetings.id, { onDelete: 'set null' }),
  category: text('category').notNull(),
  fact: text('fact').notNull(),
  confidence: numeric('confidence').default('0.8'),
  appliedToFiles: text('applied_to_files').array(),
  status: text('status').default('pending'),
  // embedding stored as vector in DB; drizzle doesn't have native vector type yet
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export const kbChanges = pgTable('kb_changes', {
  id: uuid('id').primaryKey().defaultRandom(),
  filePath: text('file_path').notNull(),
  changeSummary: text('change_summary'),
  diffBefore: text('diff_before'),
  diffAfter: text('diff_after'),
  appliedAt: timestamp('applied_at', { withTimezone: true }).defaultNow(),
})

// ============================================================================
// Module 2: Title Generator
// ============================================================================
export const titles = pgTable('titles', {
  id: uuid('id').primaryKey().defaultRandom(),
  topic: text('topic').notNull(),
  generatedTitle: text('generated_title').notNull(),
  framework: text('framework'),
  ruleScore: integer('rule_score'),
  slopProb: numeric('slop_prob'),
  noveltyOverlap: numeric('novelty_overlap'),
  verdict: text('verdict'),
  toolsNamed: text('tools_named').array(),
  channelNamed: text('channel_named'),
  productType: text('product_type'),
  rationale: text('rationale'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export const titleFeedback = pgTable('title_feedback', {
  id: uuid('id').primaryKey().defaultRandom(),
  titleId: uuid('title_id').references(() => titles.id, { onDelete: 'cascade' }),
  action: text('action').notNull(),
  editedVersion: text('edited_version'),
  reason: text('reason'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

// ============================================================================
// Module 3: Retention
// ============================================================================
export const subscribers = pgTable('subscribers', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').unique(),
  name: text('name'),
  status: text('status'),
  joinedDate: date('joined_date'),
  churnedDate: date('churned_date'),
  churnReason: text('churn_reason'),
  churnCategory: text('churn_category'),
  ltvCents: integer('ltv_cents'),
  source: text('source'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export const cohorts = pgTable('cohorts', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  criteria: jsonb('criteria'),
  subscriberCount: integer('subscriber_count'),
  avgLtvCents: integer('avg_ltv_cents'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export const retentionExperiments = pgTable('retention_experiments', {
  id: uuid('id').primaryKey().defaultRandom(),
  cohortId: uuid('cohort_id').references(() => cohorts.id, { onDelete: 'cascade' }),
  hypothesis: text('hypothesis'),
  action: text('action'),
  predictedImpact: text('predicted_impact'),
  status: text('status').default('proposed'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

// ============================================================================
// Module 4: Campaign Drafter
// ============================================================================
export const campaigns = pgTable('campaigns', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  type: text('type'),
  brief: text('brief'),
  status: text('status').default('draft'),
  targetAudience: text('target_audience'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export const campaignAssets = pgTable('campaign_assets', {
  id: uuid('id').primaryKey().defaultRandom(),
  campaignId: uuid('campaign_id').references(() => campaigns.id, { onDelete: 'cascade' }),
  assetType: text('asset_type'),
  sequencePosition: integer('sequence_position'),
  content: text('content'),
  variant: text('variant'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

// ============================================================================
// Module 5: Analytics
// ============================================================================
export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionDate: date('session_date'),
  dayOfWeek: text('day_of_week'),
  type: text('type'),
  title: text('title'),
  speaker: text('speaker'),
  host: text('host'),
  taughtTools: text('tools_taught').array(),
  signups: integer('signups'),
  attendance: integer('attendance'),
  peak: integer('peak'),
  rating: numeric('rating'),
  coolestMoment: text('coolest_moment'),
  importedFrom: text('imported_from'),
  externalId: text('external_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export const predictions = pgTable('predictions', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  predictedSignups: integer('predicted_signups'),
  predictedAttendance: integer('predicted_attendance'),
  predictedRating: numeric('predicted_rating'),
  confidence: numeric('confidence'),
  comparableSessions: uuid('comparable_sessions').array(),
  generatedAt: timestamp('generated_at', { withTimezone: true }).defaultNow(),
})

// ============================================================================
// Module 6: Research
// ============================================================================
export const researchRuns = pgTable('research_runs', {
  id: uuid('id').primaryKey().defaultRandom(),
  query: text('query').notNull(),
  sourcesUsed: text('sources_used').array(),
  rawResults: jsonb('raw_results'),
  summary: text('summary'),
  opportunityScore: numeric('opportunity_score'),
  suggestedTitles: uuid('suggested_titles').array(),
  triggeredBy: text('triggered_by'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export const trendingTopics = pgTable('trending_topics', {
  id: uuid('id').primaryKey().defaultRandom(),
  topic: text('topic').notNull(),
  source: text('source'),
  velocityScore: numeric('velocity_score'),
  rawData: jsonb('raw_data'),
  surfacedAt: timestamp('surfaced_at', { withTimezone: true }).defaultNow(),
  usedInSessionId: uuid('used_in_session_id').references(() => sessions.id),
})
