import Sidebar from '../components/Sidebar';
import ClientFlowCanvas from '../components/ClientFlowCanvas';

export default function Home() {
  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden w-full">
      <Sidebar />
      <div className="flex-1 overflow-hidden">
        <ClientFlowCanvas />
      </div>
    </div>
  );
}
