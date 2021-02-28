export default async function validtown(req, res) {
  const { query } = req;
  const { roomId } = query;

  const response = await fetch(
    `http://localhost:8888/validtown?roomId=${roomId}`
  );
  const json = await response.json();

  const { valid } = json;
  console.log(valid);
  res.status(200).json({ valid });
}
