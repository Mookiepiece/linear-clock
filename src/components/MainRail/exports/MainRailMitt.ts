import { Mitt } from '@/utils/mitt';

export const MainRailMitt = Mitt<{
  MARK: [number, number];
  UNMARK: undefined;
}>();
