export default class TrendData {
    ID: number;
    value:number;
    formattedValue:string;
    hasData:boolean;
    link :string;
    topic: TrendTopic;
  };

  export class TrendTopic{
    mid: string;
    title:string;
    type:string;
  }