export default function Footer() {
  return (
    <footer className="border-t mt-12">
      <div className="px-4 py-6 text-sm text-gray-600 flex items-center justify-between">
        <p>© {new Date().getFullYear()} RentCar. Barcha huquqlar himoyalangan.</p>
        <div className="flex gap-4">
          <a href="/privacy" className="hover:underline">Maxfiylik</a>
          <a href="/terms" className="hover:underline">Shartlar</a>
        </div>
      </div>
    </footer>
  );
}


