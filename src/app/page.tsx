"use client"; // Required for accordion interactivity

import { useEffect, useState } from "react";
import Image from "next/image";
import { fetchSheetData } from "@/lib/fetchSheet";

type GemItem = {
  gem_id: string;
  gem_imageurl: string;
  gem_name: string;
  gem_desc: string;
  gem_category: string;
};

// Accordion Component for Description
function DescriptionAccordion({ text, expanded }: { text: string; expanded: boolean }) {
  return (
    <p
      className={`text-gray-700 dark:text-gray-400 text-sm transition-all duration-300 ${
        expanded ? "" : "line-clamp-2"
      }`}
    >
      {text}
    </p>
  );
}

export default function Home() {
  const SHEET_ID = "19XzkckdgYhbZpRKBT5IJFg4m0Tb_3zqQvCbvuO_lhGo";
  const [data, setData] = useState<GemItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState<string | null>(null);

  // ✅ Pagination state
  const ITEMS_PER_PAGE = 8; // 2 rows × 4 columns
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const result = await fetchSheetData(SHEET_ID);
        setData(result);
      } catch {
        setData([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredData = data.filter(
    (item) =>
      item.gem_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.gem_desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.gem_category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ✅ Pagination logic
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (loading) {
    return (
      <main className="container mx-auto p-6">
        <div className="text-center text-gray-500">Loading...</div>
      </main>
    );
  }

  function LocalImage({ id, alt }: { id: string; alt: string }) {
    const [error, setError] = useState(false);

    return (
      <Image
        src={error ? "/img/noimage.png" : `/img/${id}.png`}
        alt={alt}
        width={600}
        height={600}
        className="rounded-t-lg w-full h-[600px] object-cover"
        onError={() => setError(true)}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* ✅ Header */}
      <header className="bg-blue-700 text-white py-6 shadow-md">
        <h1 className="text-3xl font-bold text-center tracking-wide">
          MICreations Gemini Prompts
        </h1>
      </header>

      {/* ✅ Main Content */}
      <main className="container mx-auto flex-1 p-6">
        {/* 🔍 Search Bar */}
        <input
          type="text"
          placeholder="Search Prompts..."
          className="w-full mb-3 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />

        {/* 🔽 Pagination controls UNDER search bar */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mb-6">
            {/* Previous Button */}
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="px-3 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Previous
            </button>

            {/* Page Number Links */}
            {[...Array(totalPages)].map((_, index) => {
              const pageNum = index + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-2 rounded ${
                    currentPage === pageNum
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 hover:bg-gray-300"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            {/* Next Button */}
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="px-3 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}

        {/* Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {paginatedData.length > 0 ? (
            paginatedData.map((item: GemItem) => (
              <div
                key={item.gem_id}
                className="flex flex-col bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition dark:bg-gray-800 dark:border-gray-700"
              >
                <LocalImage id={item.gem_id} alt={item.gem_name || "No title"} />

                <div className="p-5 flex flex-col gap-2">
                  <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                    {item.gem_name}
                  </h5>

                  <DescriptionAccordion
                    text={item.gem_desc}
                    expanded={expandedIndex === item.gem_id}
                  />

                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      {item.gem_category}
                    </span>

                    <button
                      onClick={() =>
                        setExpandedIndex(expandedIndex === item.gem_id ? null : item.gem_id)
                      }
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800"
                    >
                      {expandedIndex === item.gem_id ? "Show less" : "Read more"}
                      <svg
                        className="w-3.5 h-3.5 ms-2 rtl:rotate-180"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 14 10"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M1 5h12m0 0L9 1m4 4L9 9"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center col-span-full">No results found.</p>
          )}
        </div>

        {/* ✅ Pagination Controls (Bottom) */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Previous
            </button>

            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </main>

      {/* ✅ Footer */}
      <footer className="bg-gray-800 text-gray-200 text-center py-4 mt-10">
        <p className="text-sm">© MICHAEL TRAJE</p>
      </footer>
    </div>
  );
}
