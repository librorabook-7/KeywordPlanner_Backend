export default class KeywordData {
  ID: number;
  KeywordText: string;
  SearchVolume: number;
  AverageCPC: number;
  Competition: number;
  CompetitionLabel: string;
  Ternd: string;
  MonthlyTargetedSearches: number[] = [];
  Xaxis: string[] = [];
  Yaxis: number[] = [];
}

export class MonthlyTargetedSearches {
  Year: number;
  Month: number;
  SearchVolume: number;
}

export class GridBarModel {
  TotalSearchVolume: number;
  TotalTernd: string;
  TotalAverageCPC: number;
  AverageCompetition: number;
  Xaxis: string[] = [];
  Yaxis: number[] = [];
}

export class Type2Data {
  GridModelListRelevant: KeywordData[];
  GridModelListRelated: KeywordData[];
  GridBarModel: GridBarModel;
  Questions: string[];
  Prepositions: string[];
  GridModel: KeywordData[];
  PageToken: string;
}
