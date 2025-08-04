// components/Footer.js
export default function Footer() {
  return (
    <footer className="border-t mt-8 p-4 flex justify-between items-center flex-wrap gap-2">
      <div className="text-red-600 space-x-4">
        <a href="#">Contact us</a>
        <a href="#">About Us</a>
      </div>
      <a
        href="https://play.google.com"
        className="bg-indigo-700 text-white px-4 py-2 rounded"
      >
        Download android App
      </a>
    </footer>
  );
}
