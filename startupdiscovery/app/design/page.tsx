"use client";

export default function ResponsiveShowcase() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900">
      {/* Hero Section - Responsive Typography and Layout */}
      <section className="px-container py-section">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-lg-mobile md:text-4xl lg:text-5xl font-bold text-neutral-900 dark:text-white mb-4">
            Responsive Design Showcase
          </h1>
          <p className="text-base-mobile md:text-lg text-neutral-600 dark:text-neutral-300 mb-8 leading-relaxed">
            Experience how this design adapts seamlessly across mobile, tablet,
            and desktop devices with proper color contrast and accessibility
            considerations.
          </p>

          {/* Grid Showcase - Responsive Columns */}
          <div className="grid grid-cols-1 gap-4 mt-8">
            <div className="bg-brand-light dark:bg-brand-dark p-4 rounded-lg text-neutral-900 dark:text-white">
              <p className="text-sm md:text-base">
                📱 Mobile: 1 column, full width with padding
              </p>
            </div>
            <div className="hidden sm:block bg-brand-light dark:bg-brand-dark p-4 rounded-lg text-neutral-900 dark:text-white">
              <p className="text-sm md:text-base">
                📱 Tablet & Up: Visible from small screens
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Cards Grid - Multi-Column Responsive */}
      <section className="px-container py-section bg-neutral-50 dark:bg-neutral-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white mb-8">
            Responsive Card Grid
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Mobile First",
                description: "Designed for 1 column on mobile (xs-sm)",
                color: "brand",
              },
              {
                title: "Tablet Friendly",
                description: "Expands to 2 columns on tablet (md)",
                color: "success",
              },
              {
                title: "Desktop Optimized",
                description: "Shows 3 columns on desktop (lg+)",
                color: "info",
              },
              {
                title: "Flexible Spacing",
                description: "Padding adjusts based on screen size",
                color: "warning",
              },
              {
                title: "Dark Mode Support",
                description: "Full light/dark theme compatibility",
                color: "danger",
              },
              {
                title: "Touch Friendly",
                description: "Large tap targets for mobile devices",
                color: "brand",
              },
            ].map((card, i) => (
              <div
                key={i}
                className={`bg-${card.color}-light dark:bg-${card.color}-dark p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow`}
              >
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                  {card.title}
                </h3>
                <p className="text-sm md:text-base text-neutral-600 dark:text-neutral-300">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Breakpoint Indicator - Shows Current Breakpoint */}
      <section className="px-container py-section">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white mb-8">
            Breakpoint Indicators
          </h2>

          <div className="space-y-4">
            <div className="p-4 bg-red-100 dark:bg-red-900 rounded-lg">
              <p className="text-sm md:hidden font-semibold text-red-800 dark:text-red-100">
                📱 Mobile (xs to sm: &lt;640px)
              </p>
            </div>

            <div className="p-4 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <p className="hidden sm:block md:hidden font-semibold text-yellow-800 dark:text-yellow-100">
                📱 Tablet (sm to md: 640px - 768px)
              </p>
            </div>

            <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <p className="hidden md:block lg:hidden font-semibold text-blue-800 dark:text-blue-100">
                💻 Laptop (md to lg: 768px - 1024px)
              </p>
            </div>

            <div className="p-4 bg-green-100 dark:bg-green-900 rounded-lg">
              <p className="hidden lg:block font-semibold text-green-800 dark:text-green-100">
                🖥️ Desktop (lg+: 1024px+)
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Typography Showcase - Responsive Sizes */}
      <section className="px-container py-section bg-neutral-50 dark:bg-neutral-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white mb-8">
            Responsive Typography
          </h2>

          <div className="space-y-6">
            <div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 font-mono mb-2">
                h1 / Display Text
              </p>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 dark:text-white">
                Responsive Heading
              </h1>
            </div>

            <div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 font-mono mb-2">
                Body Copy (adapts per breakpoint)
              </p>
              <p className="text-xs sm:text-sm md:text-base lg:text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed">
                This text scales smoothly across devices. On mobile it&apos;s
                readable at xs size, on tablets it becomes sm, and on desktop
                it&apos;s base size. Proper line-height ensures readability at
                all sizes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Color Contrast Showcase - Accessibility */}
      <section className="px-container py-section">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white mb-8">
            Color Contrast & Accessibility
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Light Mode Examples */}
            <div className="space-y-4">
              <h3 className="font-semibold text-neutral-900 dark:text-white">
                Light Mode (WCAG AA/AAA)
              </h3>

              <div className="bg-brand-light text-neutral-900 p-4 rounded">
                <p className="text-sm">✅ Brand Light + Dark Text (AAA)</p>
              </div>

              <div className="bg-success-light text-neutral-900 p-4 rounded">
                <p className="text-sm">✅ Success Light + Dark Text (AAA)</p>
              </div>

              <div className="bg-warning-light text-neutral-900 p-4 rounded">
                <p className="text-sm">✅ Warning Light + Dark Text (AAA)</p>
              </div>
            </div>

            {/* Dark Mode Examples */}
            <div className="space-y-4 bg-neutral-800 p-6 rounded-lg">
              <h3 className="font-semibold text-white">
                Dark Mode (WCAG AA/AAA)
              </h3>

              <div className="bg-brand-dark text-white p-4 rounded">
                <p className="text-sm">✅ Brand Dark + Light Text (AA)</p>
              </div>

              <div className="bg-success-dark text-white p-4 rounded">
                <p className="text-sm">✅ Success Dark + Light Text (AA)</p>
              </div>

              <div className="bg-danger-dark text-white p-4 rounded">
                <p className="text-sm">✅ Danger Dark + Light Text (AA)</p>
              </div>
            </div>
          </div>

          {/* Contrast Ratios */}
          <div className="mt-8 p-6 bg-neutral-100 dark:bg-neutral-700 rounded-lg">
            <h4 className="font-semibold text-neutral-900 dark:text-white mb-4">
              Contrast Ratios (WCAG Standards)
            </h4>
            <ul className="text-sm space-y-2 text-neutral-700 dark:text-neutral-300">
              <li>✅ Large text (&gt;18pt): 3:1 minimum (AA), 4.5:1 (AAA)</li>
              <li>✅ Normal text: 4.5:1 minimum (AA), 7:1 (AAA)</li>
              <li>✅ All brand colors meet or exceed AA standard</li>
              <li>✅ Dark mode colors carefully selected for readability</li>
              <li>✅ No reliance on color alone for information</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Responsive Images & Media */}
      <section className="px-container py-section bg-neutral-50 dark:bg-neutral-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white mb-8">
            Responsive Media
          </h2>

          <div className="aspect-video bg-gradient-to-br from-brand to-success rounded-lg flex items-center justify-center mb-6">
            <p className="text-white text-center font-semibold">
              16:9 Aspect Ratio Container (Responsive)
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square bg-gradient-to-br from-brand-light to-info-light dark:from-brand-dark dark:to-info-dark rounded-lg flex items-center justify-center"
              >
                <p className="text-center text-sm font-semibold text-neutral-900 dark:text-white">
                  {i + 1}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Touch-Friendly Interactions */}
      <section className="px-container py-section">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white mb-8">
            Mobile-Optimized Interactions
          </h2>

          <div className="space-y-4">
            {/* Large tap targets - minimum 44x44px for mobile */}
            <button className="w-full md:w-auto px-6 py-3 bg-brand text-white rounded-lg hover:bg-brand-dark transition-colors font-semibold">
              Touch-Friendly Button (44px min height)
            </button>

            <button className="w-full md:w-auto px-6 py-3 bg-success text-white rounded-lg hover:bg-success-dark transition-colors font-semibold">
              Full Width on Mobile
            </button>

            {/* Stacked vertically on mobile, horizontal on desktop */}
            <div className="flex flex-col md:flex-row gap-4">
              <button className="flex-1 px-6 py-3 border-2 border-brand text-brand dark:border-brand-light dark:text-brand-light rounded-lg hover:bg-brand hover:text-white dark:hover:bg-brand-light dark:hover:text-neutral-900 transition-colors font-semibold">
                Secondary
              </button>
              <button className="flex-1 px-6 py-3 border-2 border-success text-success dark:border-success-light dark:text-success-light rounded-lg hover:bg-success hover:text-white dark:hover:bg-success-light dark:hover:text-neutral-900 transition-colors font-semibold">
                Action
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
