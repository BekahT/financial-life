export class Goal {
  constructor(
    public category: string,
    public source: string,
    public amount: number,
    public completionDate?: any
  ) { }
}
