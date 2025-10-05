import { SetMetadata } from '@nestjs/common';

export const IS_OPTIONAL_KEY = 'isOptional';
export const Optional = () => SetMetadata(IS_OPTIONAL_KEY, true);
