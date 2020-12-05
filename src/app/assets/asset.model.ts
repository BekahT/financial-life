export class Asset {
  constructor(
    public name: string,
    public value: number,
    public category: string,
    public lastModified?: any,
    public note?: string,
    public id?: string
  ) { }
}
