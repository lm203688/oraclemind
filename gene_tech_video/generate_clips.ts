import ZAI from "z-ai-web-dev-sdk";
import fs from "fs";
import https from "https";
import http from "http";

const CLIPS = [
  {
    prompt: "Cinematic close-up of a glowing DNA double helix rotating in dark space, blue and cyan bioluminescent light effects, futuristic medical technology visualization, dramatic lighting, 4K",
    out: "clip_01.mp4"
  },
  {
    prompt: "Microscopic view of glowing cells dividing in a laboratory, blue fluorescent markers highlighting genetic material, medical research microscopy, bioluminescent green and blue colors, scientific documentary style",
    out: "clip_02.mp4"
  },
  {
    prompt: "Medical syringe with glowing DNA strands intertwining around it, red and blue light effects representing medical breakthrough, futuristic gene therapy visualization, cinematic lighting",
    out: "clip_03.mp4"
  },
  {
    prompt: "CRISPR molecular scissors editing DNA sequence animation, glowing gene sequence being precisely cut and modified, bright golden and blue light particles, futuristic biotechnology visualization, cinematic",
    out: "clip_04.mp4"
  },
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
  let retries = 3;
  while (retries > 0) {
    try {
      task = await zai.video.generations.create({
        prompt: clip.prompt,
        quality: "quality",
        with_audio: false,
        size: "1344x768",
        fps: 30,
        duration: 5,
      });
      break;
    } catch (err: any) {
      retries--;
      if (err?.message?.includes("429") && retries > 0) {
        console.log(`Rate limited, waiting 30s before retry... (${retries} left)`);
        await new Promise(r => setTimeout(r, 30000));
      } else {
        throw err;
      }
    }
  }

  if (!task) throw new Error("Failed to create task");
  console.log(`Task ${clip.out} created, ID: ${task.id}`);

  // Poll
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
  // Generate clips one by one with delay to avoid rate limiting
  for (let i = 0; i < CLIPS.length; i++) {
    const clip = CLIPS[i];
    try {
      const result = await generateClip(zai, clip);
      results.push(result);
    } catch (err: any) {
      console.error(`❌ Failed to generate ${clip.out}:`, err?.message || err);
      results.push("");
    }
    // Wait 15s between clips to avoid rate limiting
    if (i < CLIPS.length - 1) {
      console.log("Waiting 15s before next clip...");
      await new Promise(r => setTimeout(r, 15000));
    }
  }

  const validClips = results.filter(r => r !== "");
  fs.writeFileSync(`${OUT_DIR}/clips_manifest.json`, JSON.stringify(validClips, null, 2));
  console.log(`\n🎬 All done! ${validClips.length}/${CLIPS.length} clips generated.`);
}

main().catch(err => { console.error(err); process.exit(1); });
