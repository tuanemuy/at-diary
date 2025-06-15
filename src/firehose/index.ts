import path from "node:path";
import { WebSocket } from "ws";
import { processFirehoseAction } from "@/actions/post.ts";

function run() {
  const hosts = Deno.env.get("JETSTREAM_HOST");
  const decoder = new TextDecoder("utf-8");

  if (!hosts) {
    console.error("JETSTREAM_ADDRESS is not set");
    Deno.exit(1);
  }

  for (const host of hosts.split(",")) {
    const address = new URL(path.join(host, "subscribe"));
    const ws = new WebSocket(
      `${address}?wantedCollections=app.bsky.feed.post&wantedDids=${Deno.env.get("DID")}`,
    );

    ws.on("error", console.error);

    ws.on("message", function message(data: BufferSource) {
      processFirehoseAction({ data: decoder.decode(data) });
    });
  }
}

run();
