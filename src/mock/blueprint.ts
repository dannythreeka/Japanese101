/** Product-defined counts. The official N5 page supplies section times and item categories, not these counts. */
export const MOCK_RULES_VERSION='mock-v1-draft'
export const MOCK_BLUEPRINT_VERSION='n5-custom-80-v1'
export const MOCK_SECTIONS=[
  {id:'vocabulary',minutes:20,count:25,types:{T01:7,T02:5,T03:8,T04:5}},
  {id:'grammar-reading',minutes:40,count:30,types:{T05:10,T06:4,T07:4,T08:5,T09:4,T10:3}},
  {id:'listening',minutes:30,count:25,types:{T11:8,T12:7,T13:5,T14:5}},
] as const
export type MockSectionId=typeof MOCK_SECTIONS[number]['id']
export type MockPaperId='MA'|'MB'|'MC'
export const MOCK_PAPER_IDS:readonly MockPaperId[]=['MA','MB','MC']
