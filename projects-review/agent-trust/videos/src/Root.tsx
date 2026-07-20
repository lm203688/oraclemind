import { Composition } from "remotion";
import { AgentTrustDemo } from "./AgentTrustDemo";
import { AgentTrustStory } from "./AgentTrustStory";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* A-2: Demo 演示型 — 45秒 9:16 */}
      <Composition
        id="AgentTrustDemo"
        component={AgentTrustDemo}
        durationInFrames={45 * 30}
        fps={30}
        width={1024}
        height={1536}
      />
      {/* A-3: Story 故事型 — 60秒 9:16 */}
      <Composition
        id="AgentTrustStory"
        component={AgentTrustStory}
        durationInFrames={60 * 30}
        fps={30}
        width={1024}
        height={1536}
      />
    </>
  );
};
