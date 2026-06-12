import { listFlows } from '../lib/flows';
import FlowCanvas from '../components/FlowCanvas';

export default async function Home() {
  const flows = await listFlows();
  return <FlowCanvas initialFlows={flows} />;
}
