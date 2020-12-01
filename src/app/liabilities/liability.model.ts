export class Liability {
  constructor(
    public name: string,
    public balance: number,
    public category: string,
    public dueDate?: any,
    public interestRate?: number,
    public note?: string,
    public id?: string
  ) { }
}
