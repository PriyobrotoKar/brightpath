import type { Role } from '@brightpath/db';
import { atom } from 'jotai';
import type { CreateMerchantPayload } from '@/api/services/merchant';

export const roleAtom = atom<Role | ''>('');

export const accountAtom = atom<Partial<CreateMerchantPayload>>();
