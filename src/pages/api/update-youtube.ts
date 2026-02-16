import type { APIRoute } from "astro";

async function commitStats(stats: any) {
  const GITHUB_TOKEN = import.meta.env.GITHUB_TOKEN;

  const content = Buffer.from(JSON.stringify(stats, null, 2)).toString(
    "base64",
  );

  await fetch(
    "https://api.github.com/repos/Brunogarcia03/dandelion/contents/src/content/stats/youtube.json",
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "update youtube stats",
        content,
      }),
    },
  );
}

export const POST: APIRoute = async ({ request }) => {
  const CRON_SECRET = import.meta.env.CRON_SECRET;

  if (request.headers.get("authorization") !== `Bearer ${CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const API_KEY = import.meta.env.YOUTUBE_API_KEY;
    const CHANNEL_ID = import.meta.env.YOUTUBE_CHANNEL_ID;

    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${CHANNEL_ID}&key=${API_KEY}`,
    );

    if (!res.ok) {
      const text = await res.text();
      console.error("YouTube error raw:", text);
      throw new Error(`YouTube request failed: ${res.status} ${text}`);
    }

    const data = await res.json();

    if (!data.items?.length) throw new Error("No data");

    const stats = data.items[0].statistics;

    await commitStats(stats);

    console.log("Updated stats:", stats);

    return new Response(JSON.stringify(stats), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("Update failed", { status: 500 });
  }
};
