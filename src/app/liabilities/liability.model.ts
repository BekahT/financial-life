export class Liability {
  constructor(
    public name: string,
    public balance: number,
    public category: string,
    public dueDate?: Date,
    public note?: string    
  ) { }
}