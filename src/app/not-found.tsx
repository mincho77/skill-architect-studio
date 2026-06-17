export default function NotFound() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-950 text-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-purple-400 mb-2">404</h1>
        <p className="text-gray-400">Página no encontrada</p>
        <a href="/" className="mt-4 inline-block text-purple-400 hover:underline">← Volver al inicio</a>
      </div>
    </div>
  );
}
