export interface PaymentProvider {
  deposit(userId: string, amount: number): Promise<void>;
  withdraw(userId: string, amount: number): Promise<void>;
}
