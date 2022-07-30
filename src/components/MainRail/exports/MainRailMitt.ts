import { Mitt } from '@mookiepiece/strawberry-farm/shared';

export const MainRailMitt = Mitt<{
  MARK: [number, number];
  UNMARK: undefined;
}>();
