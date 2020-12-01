export class Asset {
  constructor(
    public name: string,
    public value: number,
    public category: string,
    public note?: string,
    public id?: string
  ) { }
}
