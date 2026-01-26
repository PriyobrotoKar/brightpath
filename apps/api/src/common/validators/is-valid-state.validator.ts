import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { STATES_BY_COUNTRY } from '../constants';

@ValidatorConstraint()
export class IsValidState implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments): Promise<boolean> | boolean {
    const obj = args.object as any;
    const country = obj.country;

    if (!country || !STATES_BY_COUNTRY[country]) {
      return true;
    }

    const validStates = STATES_BY_COUNTRY[country];
    return validStates.includes(value);
  }

  defaultMessage(args: ValidationArguments): string {
    const obj = args.object as any;
    return `${args.value} is not a valid state for ${obj.country}`;
  }
}
