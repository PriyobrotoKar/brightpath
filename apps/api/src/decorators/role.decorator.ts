import { SetMetadata } from '@nestjs/common';

export const IS_CREATOR_KEY = 'isCreator';
export const Creator = () => SetMetadata(IS_CREATOR_KEY, true);
