export class Goal {
  constructor(
    public category: string,
    public source: string,
    public amount: number,
    public lastModified?: any,
    public completionDate?: any,
    public id?: string,
    public assetId?: string,
    public liabilityId?: string
  ) { }
}
