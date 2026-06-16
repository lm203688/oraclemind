import ZAI from "z-ai-web-dev-sdk";
import fs from "fs";
import https from "https";
import http from "http";

const CLIPS = [
  {
    prompt: "Glowing red blood cells flowing through veins and arteries, microscopic cardiovascular system, medical animation, red and blue light, cinematic 4K",
    out: "clip_09.mp4"
  },
  {
    prompt: "Futuristic laboratory with holographic DNA displays, scientist working with gene editing equipment, blue ambient light, sci-fi medical facility, cinematic",
    out: "clip_10.mp4"
  },
  {
    prompt: "Nanoparticles delivering medicine to cells, tiny glowing capsules entering cell membrane, bioluminescent green and gold, medical nanotechnology animation",
    out: "clip_11.mp4"
  },
  {
    prompt: "Abstract AI brain neural network merging with DNA strands, artificial intelligence processing genetic data, purple and blue digital visualization, cinematic",
    out: "clip_12.mp4"
  },
  {
    prompt: "Futuristic city skyline with holographic medical symbols, biotechnology utopia at golden hour, hope and progress, cinematic wide shot, warm lighting",
    out: "clip_13.mp4"
  }
];

const OUT_DIR = "/home/z/my-project/gene_tech_video";

function downloadFile(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const mod = url.startsWith("https") ? https : http;
    const follow = (response: any) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        follow(response.headers.location);
        return;
      }
      response.pipe(file);
      file.on("finish", () => { file.close(); resolve(); });
    };
    mod.get(url, follow).on("error", (err: any) => { fs.unlink(dest, () => {}); reject(err); });
  });
}

async function generateClip(zai: any, clip: typeof CLIPS[0]) {
  console.log(`Creating task for: ${clip.out}`);
  const task = await zai.video.generations.create({
    prompt: clip.prompt,
    quality: "speed",
    with_audio: false,
    size: "1344x768",
    fps: 30,
    duration: 5,
  });
  console.log(`[${clip.out}] Task ID: ${task.id}`);

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
      console.log("Waiting 20s...");
      await new Promise(r => setTimeout(r, 20000));
    }
  }

  console.log(`\n🎬 Done! ${results.filter(r => r !== "").length}/${CLIPS.length} clips generated.`);
}

main().catch(err => { console.error(err); process.exit(1); });
