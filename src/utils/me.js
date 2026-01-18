import { trpc } from './trpc';

export async function fetchMeViaTrpc() {
  return trpc.me.get.query();
}
