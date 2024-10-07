import type { Role } from '@brightpath/db';
import { atom } from 'jotai';

export const roleAtom = atom<Role | ''>('');
