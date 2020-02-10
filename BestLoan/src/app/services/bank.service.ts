import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BankService {

  bank: any[] = [
    {
      id: 1,
      name: 'BANCO A',
      interest: 0.12,
      openingCommision: 0.05
    },
    {
      id: 2,
      name: 'BANCO B',
      interest: 0.16,
      openingCommision: 0.02
    },
    {
      id: 3,
      name: 'BANCO C',
      interest: 0.2,
      openingCommision: 0
    }
  ];
  constructor() {}

  getBank(){
    return this.bank;
  }
}
