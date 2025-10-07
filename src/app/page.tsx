"use client";

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

// ✅ Accordion Component
function DescriptionAccordion({ text, expanded }: { text: string; expanded: boolean }) {
  return (
    <p
      className={`text-gray-700 text-justify text-sm transition-all duration-300 ${
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

  // ✅ Pagination State
  const ITEMS_PER_PAGE = 8;
  const [currentPage, setCurrentPage] = useState(1);

  // ✅ Modal State
  const [modalImage, setModalImage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const result = await fetchSheetData(SHEET_ID);
        setData(result);
      } catch (error) {
        console.error("Failed to fetch sheet data:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // ✅ Filter + Paginate
  const filteredData = data.filter(
    (item) =>
      item.gem_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.gem_desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.gem_category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (loading) {
    return (
      <main className="container mx-auto p-6">
        <div className="text-center text-gray-500 text-lg font-medium animate-pulse">
          Loading...
        </div>
      </main>
    );
  }

  // ✅ Safe Image Loader for Local + Fallback
  function LocalImage({
    id,
    alt,
    onClick,
  }: {
    id: string;
    alt: string;
    onClick?: () => void;
  }) {
    const [error, setError] = useState(false);

    return (
      <Image
        src={error ? "/img/noimage.png" : `/img/${id}.png`}
        alt={alt}
        width={600}
        height={400}
        priority
        className="rounded-t-lg w-full h-[400px] object-cover cursor-pointer hover:opacity-90 transition"
        onError={() => setError(true)}
        onClick={onClick}
      />
    );
  }

  // ✅ Pagination Component
  const Pagination = ({ position }: { position: "top" | "bottom" }) =>
    totalPages > 1 && (
      <div
        className={`flex flex-wrap justify-center items-center gap-2 ${
          position === "top" ? "mb-6" : "mt-10"
        }`}
      >
        {/* Prev */}
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => prev - 1)}
          className="px-4 py-2 bg-white border border-gray-300 rounded-xl shadow-sm text-black hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          ← Previous
        </button>

        {/* Page Numbers */}
        <div className="flex flex-wrap justify-center gap-1">
          {[...Array(totalPages)].map((_, i) => {
            const pageNum = i + 1;
            if (
              pageNum === 1 ||
              pageNum === totalPages ||
              Math.abs(currentPage - pageNum) <= 1
            ) {
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl border transition shadow-sm text-black
                    ${
                      currentPage === pageNum
                        ? "bg-blue-100 border-blue-400 font-bold"
                        : "bg-white border-gray-300 hover:bg-blue-50"
                    }`}
                >
                  {pageNum}
                </button>
              );
            }

            if (
              (pageNum === currentPage - 2 && pageNum > 1) ||
              (pageNum === currentPage + 2 && pageNum < totalPages)
            ) {
              return (
                <span
                  key={`ellipsis-${pageNum}`}
                  className="w-10 h-10 flex items-center justify-center text-gray-400"
                >
                  ...
                </span>
              );
            }

            return null;
          })}
        </div>

        {/* Next */}
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((prev) => prev + 1)}
          className="px-4 py-2 bg-white border border-gray-300 rounded-xl shadow-sm text-black hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          Next →
        </button>
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* ✅ Header */}
      <header className="bg-blue-700 text-white py-6 shadow-md">
        <h1 className="text-3xl font-bold text-center tracking-wide">
          MICreations Gemini Prompts
        </h1>
      </header>

      {/* ✅ Main */}
      <main className="container mx-auto flex-1 p-6">
        {/* Search Bar */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <input
            type="text"
            placeholder="Search Prompts..."
            className="w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        {/* Pagination (Top) */}
        <Pagination position="top" />

        {/* ✅ Card Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {paginatedData.length > 0 ? (
            paginatedData.map((item) => (
              <div
                key={item.gem_id}
                className="flex flex-col bg-white border border-gray-200 rounded-xl shadow hover:shadow-lg transition"
              >
                <LocalImage
                  id={item.gem_id}
                  alt={item.gem_name || "No title"}
                  onClick={() => setModalImage(`/img/${item.gem_id}.png`)}
                />

                <div className="p-5 flex flex-col gap-3">
                  <h5 className="text-lg font-semibold text-gray-900">
                    {item.gem_name}
                  </h5>

                  <DescriptionAccordion
                    text={item.gem_desc}
                    expanded={expandedIndex === item.gem_id}
                  />

                  <div className="flex items-center justify-between mt-auto">
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      {item.gem_category}
                    </span>

                    <button
                      onClick={() =>
                        setExpandedIndex(
                          expandedIndex === item.gem_id ? null : item.gem_id
                        )
                      }
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 transition"
                    >
                      {expandedIndex === item.gem_id ? "Show less" : "Read more"}
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center col-span-full">No results found.</p>
          )}
        </div>

        {/* Pagination (Bottom) */}
        <Pagination position="bottom" />
      </main>

      {/* ✅ Image Modal */}
      {modalImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setModalImage(null)}
        >
          <div
            className="relative bg-white rounded-xl overflow-hidden shadow-lg max-w-3xl w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setModalImage(null)}
              className="absolute top-3 right-3 bg-gray-800 text-white rounded-full px-2 py-1 text-sm hover:bg-red-600"
            >
              ✕
            </button>
            <Image
              src={modalImage}
              alt="Full size image"
              width={1200}
              height={800}
              className="w-full h-auto object-contain"
            />
          </div>
        </div>
      )}

      {/* ✅ Footer */}
      <footer className="bg-gray-800 text-gray-200 text-center py-4 mt-10">
        <p className="text-sm">© MICHAEL TRAJE</p>
      </footer>
    </div>
  );
}
