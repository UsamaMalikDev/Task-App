export const ORGANIZATIONS = {
  ORG_A: {
    id: 'org_a_001',
    name: 'orgA',
    displayName: 'Organization A'
  },
  ORG_B: {
    id: 'org_b_002', 
    name: 'orgB',
    displayName: 'Organization B'
  }
} as const;

export type OrganizationId = typeof ORGANIZATIONS[keyof typeof ORGANIZATIONS]['id'];
export type OrganizationName = typeof ORGANIZATIONS[keyof typeof ORGANIZATIONS]['name'];

export const VALID_ORGANIZATION_IDS = Object.values(ORGANIZATIONS).map(org => org.id);
