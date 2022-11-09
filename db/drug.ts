import type { Knex } from 'knex';

export interface DrugArticleRecord {
  id: string;
  type: 'URL' | 'MARKDOWN' | 'HTML';
  url: string;
  title: string;
  description?: string;
  publishedAt?: Date;
  lastModifiedBy: string;
  lastModifiedAt: Date;
  postedBy: string;
  createdAt: Date;
}

export type RouteOfAdministration = 'ORAL'
| 'INSUFFLATED'
| 'INHALED'
| 'TOPICAL'
| 'SUBLINGUAL'
| 'BUCCAL'
| 'RECTAL'
| 'INTRAMUSCULAR'
| 'INTRAVENOUS'
| 'SUBCUTANIOUS'
| 'TRANSDERMAL';

export type DrugUnit = 'MG'
| 'ML'
| 'UG'
| 'G'
| 'OZ'
| 'FLOZ';

export type DrugNameType = 'BRAND' | 'COMMON' | 'SUBSTITUTIVE' | 'SYSTEMATIC';

export interface DrugNameRecord {
  id: string;
  drugId: string;
  name: string;
  isDefault: boolean;
  type: DrugNameType;
}

export interface DrugVariantRecord {
  id: string;
  drugId: string;
  name?: string;
  description?: string;
  default: boolean;
  lastUpdatedBy: string;
  updatedAt: Date;
  createdAt: Date;
}

export interface DrugRecord {
  id: string;
  summary?: string;
  psychonautWikiUrl?: string;
  errowidExperiencesUrl?: string;
  lastUpdatedBy: string;
  updatedAt: Date;
  createdAt: Date;
}

export default function createDrugDb(knex: Knex) {
  return {
    getById(drugId: string) {
      return knex<DrugRecord>('drugs')
        .where('id', drugId)
        .first();
    },

    getNames(drugId: string) {
      return knex<DrugNameRecord>('drugNames')
        .where('drugId', drugId)
        .orderBy('name');
    },
  };
}
