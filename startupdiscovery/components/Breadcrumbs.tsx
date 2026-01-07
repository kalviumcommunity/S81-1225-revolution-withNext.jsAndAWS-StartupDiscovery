import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center space-x-2 text-sm">
        <Link href="/" className="text-blue-600 hover:underline">
          Home
        </Link>
        {items.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <span className="text-gray-400">/</span>
            {index === items.length - 1 ? (
              <span className="text-gray-600 font-semibold">{item.label}</span>
            ) : (
              <Link href={item.href} className="text-blue-600 hover:underline">
                {item.label}
              </Link>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
}
