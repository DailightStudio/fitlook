export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-20">
        <h1 className="text-5xl font-bold text-center text-gray-800 mb-4">
          fitlook
        </h1>
        <p className="text-center text-gray-600 text-xl mb-12">
          실제 상품으로 3D 코디를 미리보고 회전해보세요
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-3">🎨 코디</h2>
            <p className="text-gray-600">실제 상품들을 조합해 나만의 스타일을 만들어보세요</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-3">🔄 회전</h2>
            <p className="text-gray-600">3D로 360도 회전하며 상세하게 확인해보세요</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-3">🛍️ 구매</h2>
            <p className="text-gray-600">마음에 드는 코디를 한 번에 구매하세요</p>
          </div>
        </div>

        <div className="mt-16 text-center">
          <button className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition">
            시작하기
          </button>
        </div>
      </div>
    </main>
  );
}
