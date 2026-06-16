import ZAI from "z-ai-web-dev-sdk";
import fs from "fs";
import https from "https";
import http from "http";

const CLIPS = [
  {
    prompt: "3D animated human heart with blood vessels, glowing red and blue cardiovascular system, cholesterol particles being dissolved by gene editing, medical visualization, cinematic quality",
    out: "clip_05.mp4"
  },
  {
    prompt: "3D liver cells with nanoparticles delivering medicine, hepatocyte visualization, bioluminescent green and orange particles entering cells, medical biotechnology animation, cinematic",
    out: "clip_06.mp4"
  },
  {
    prompt: "AI neural network merging with DNA double helix, data streams flowing through genetic sequences, artificial intelligence meets genomics, futuristic blue and purple light effects, cinematic",
    out: "clip_07.mp4"
  },
  {
    prompt: "Futuristic medical city skyline at sunset, holographic medical symbols floating above buildings, biotechnology utopia, warm golden and blue light, cinematic wide shot",
    out: "clip_08.mp4"
  }
];

const OUT_DIR = "/home/z/my-project/gene_tech_video";

function downloadFile(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const mod = url.startsWith("https") ? https : http;
    mod.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        downloadFile(response.headers.location!, dest).then(resolve).catch(reject);
        return;
      }
      response.pipe(file);
      file.on("finish", () => { file.close(); resolve(); });
    }).on("error", (err) => { fs.unlink(dest, () => {}); reject(err); });
  });
}

async function generateClip(zai: any, clip: typeof CLIPS[0]): Promise<string> {
  console.log(`Creating task for: ${clip.out}`);
  let task;
  let retries = 5;
  while (retries > 0) {
    try {
      task = await zai.video.generations.create({
        prompt: clip.prompt,
        quality: "speed",
        with_audio: false,
        size: "1344x768",
        fps: 30,
        duration: 5,
      });
      break;
    } catch (err: any) {
      retries--;
      if (retries > 0) {
        console.log(`Error, waiting 30s before retry... (${retries} left): ${err?.message}`);
        await new Promise(r => setTimeout(r, 30000));
      } else {
        throw err;
      }
    }
  }

  if (!task) throw new Error("Failed to create task");
  console.log(`Task ${clip.out} created, ID: ${task.id}`);

  let result = await zai.async.result.query(task.id);
  let pollCount = 0;
  const maxPolls = 60;
  while (result.task_status === "PROCESSING" && pollCount < maxPolls) {
    pollCount++;
    console.log(`[${clip.out}] Poll ${pollCount}/${maxPolls}: ${result.task_status}`);
    await new Promise(r => setTimeout(r, 10000));
    result = await zai.async.result.query(task.id);
  }

  if (result.task_status === "SUCCESS") {
    const videoUrl = result.video_result?.[0]?.url || result.video_url || result.url || result.video;
    if (videoUrl) {
      const dest = `${OUT_DIR}/${clip.out}`;
      console.log(`Downloading ${clip.out}...`);
      await downloadFile(videoUrl, dest);
      console.log(`✅ ${clip.out} saved!`);
      return dest;
    } else {
      console.error(`⚠️ No video URL for ${clip.out}`);
      return "";
    }
  } else {
    console.error(`❌ ${clip.out} failed: ${result.task_status}`);
    return "";
  }
}

async function main() {
  const zai = await ZAI.create();
  const results: string[] = [];
  
  for (let i = 0; i < CLIPS.length; i++) {
    try {
      const result = await generateClip(zai, CLIPS[i]);
      results.push(result);
    } catch (err: any) {
      console.error(`❌ Failed:`, err?.message || err);
      results.push("");
    }
    if (i < CLIPS.length - 1) {
      console.log("Waiting 20s before next clip...");
      await new Promise(r => setTimeout(r, 20000));
    }
  }

  const validClips = results.filter(r => r !== "");
  console.log(`\n🎬 Done! ${validClips.length}/${CLIPS.length} clips generated.`);
}

main().catch(err => { console.error(err); process.exit(1); });
