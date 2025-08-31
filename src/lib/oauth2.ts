export async function getUserInfo(token: string): Promise<{ id: number; email: string }> {
  return fetch(`http://accounts.fileion.tw/api/user`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then((res) => res.json());
}