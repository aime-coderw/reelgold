// components/Header.js
export default function Header() {
  return (
    <header className="flex justify-between items-center px-6 py-4 border-b">
      <div className="flex items-center space-x-2">
        <div className="bg-black text-white font-bold px-2 py-1">Logo</div>
        <h1 className="text-lg font-semibold">ReelGold Blog</h1>
      </div>
      <a
        href="https://play.google.com" // change this to your actual app link
        className="bg-indigo-700 text-white px-4 py-2 rounded hover:bg-indigo-800"
      >
        Download App
      </a>
    </header>
  );
}
