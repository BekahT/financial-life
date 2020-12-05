export class Liability {
  constructor(
    public name: string,
    public balance: number,
    public category: string,
    public lastModified: any,
    public dueDate?: any,
    public interestRate?: number,
    public note?: string,
    public id?: string
  ) { }
}
