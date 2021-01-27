import { intranetClient } from '../utils/request';

type Req = {
  id: number;
};
type Res = {
  userId: number;
  id: number;
  title: string;
  body: string;
};
export const apiGetFirstPost = ({ id }: Req): Promise<Res> => intranetClient.get<Req, Res>(`/posts/${id}`, { id });
