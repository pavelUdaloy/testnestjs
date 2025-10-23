export class CreateRedeemVoucherRequestDto {
  status: string;

  constructor(parameters: CreateRedeemVoucherRequestDto) {
    this.status = parameters.status;
  }
}
