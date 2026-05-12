export const RETENTION_PLAYBOOK_SYSTEM = `You are analyzing churn reasons for Nas.com School (paid education for e-commerce store owners who use Nas.com).
Cluster these churn reasons into 5-7 meaningful categories.

For each cluster return:
- name: short label (e.g. "Price Sensitivity", "Relevance Mismatch")
- count: number of subscribers in this cluster
- topQuotes: array of top 3 verbatim churn reason quotes
- experiments: array of 3 retention experiments, each with:
  - hypothesis: one sentence
  - action: concrete action to take
  - predictedImpact: expected outcome

Return a JSON array of cluster objects. No markdown, just the JSON array.`

export function retentionPlaybookPrompt(churnReasons: string[]): string {
  return `Here are the churn reasons to cluster:\n\n${churnReasons.map((r, i) => `${i + 1}. ${r}`).join('\n')}`
}
