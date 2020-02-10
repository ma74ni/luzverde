import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms'; 

import { BankService } from '../services/bank.service';

import { Bank } from '../interfaces/bank';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  bankForm;
  preCancelForm;
  capital;
  month;
  show = false;
  totalFees = 12;
  bank: Bank[] = [];
  banks: any[] = [];
  
  constructor(
    private formBuilder: FormBuilder,
    private bankService: BankService
  ) {
    this.bankForm =this.formBuilder.group({
      capital: ['', Validators.required],
      month: ['']
    })
  }

  ngOnInit(): void {
  }

  onSubmit(customerData) {
    if (this.bankForm.valid) {
      this.banks = [];
      this.month = customerData.month - 1;
      this.capital = customerData.capital; //monto ingresado por el cliente
      this.bankService.getBank().forEach(element => { //tomo los datos de los bancos y los recorro
        this.bank = element;
        let commision = this.commisionCalculate(this.bank['openingCommision'], this.capital);
        let interest = this.bank['interest'];
        let mensualFee = this.mensualFeeCalculate(this.capital, interest);
        let finalValueToPay;
        if(this.month != undefined && this.month > 0){
          let pending = this.pendingCapitalCalculate(interest, mensualFee, this.capital, this.month, 0);
          finalValueToPay = commision + (mensualFee * (this.month + 1)) +  pending;
        } else {
          let interestCredit = this.interestCreditCalculate(interest, mensualFee, this.capital, 0);
          finalValueToPay = interestCredit + parseFloat(this.capital)  + commision;
        }
        const auxBank = {
          capital: this.capital,
          month: this.month,
          name: this.bank['name'],
          commision : commision,
          interest: interest,
          mensualFee: mensualFee,
          finalValueToPay: finalValueToPay
        };
        this.banks.push(auxBank);
        this.banks.sort( (a,b) => {
          if(a.finalValueToPay > b.finalValueToPay) {
            return 1;
          } else {
            return -1;
          }
        })
      });
      this.bankForm.reset();
    } else {
      alert('Ingrese los campos');
    }
  }
  commisionCalculate(bankCommision, capital){
    return bankCommision * capital;
  }
  mensualFeeCalculate(capital, interest){
    let typeOfInterest = interest / this.totalFees;
    let auxTypeOfInterest = Math.pow((1 + typeOfInterest), this.totalFees);
    return capital * ((auxTypeOfInterest*typeOfInterest)/(auxTypeOfInterest-1));
  }
  interestCreditCalculate(interest, mensualFee, capital, incInterest){
    let i = interest/this.totalFees;
    let interestCredit  = capital * i;
    let aux = Math.round((interestCredit + incInterest) * 100) / 100;
    let amortization = mensualFee - interestCredit;
    let newCapital = Math.round((capital - amortization) * 100) / 100;
    if(newCapital <= 0){
    } else {
      return this.interestCreditCalculate(interest, mensualFee, newCapital, aux);
    }
    return aux;
  }
  pendingCapitalCalculate(interest, mensualFee, capital, month, incInterest){
    let newMont = month;
    let i = interest/this.totalFees;
    let interestCredit  = capital * i;
    let aux = Math.round((interestCredit + incInterest) * 100) / 100;
    let amortization = mensualFee - interestCredit;
    let newCapital = capital - amortization;
    if(newMont <= 0){
    } else {
      newMont--;
      return this.pendingCapitalCalculate(interest, mensualFee, newCapital, newMont, aux);
    }
    return newCapital;
  }
  display(){
    this.show = !this.show;
    if(this.show){
      this.bankForm.get('month').setValidators([Validators.required, Validators.min(1), Validators.max(11)]);
    } else if(!this.show) {
      this.bankForm.get('month').clearValidators();
    }
  }
}
